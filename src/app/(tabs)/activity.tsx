import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import {
  Search,
  RefreshCw,
  MoreVertical,
  Rocket,
  RotateCw,
  Terminal,
  Copy,
  ExternalLink,
  GitCommit,
  User,
  RotateCcw,
  XCircle,
  CheckCircle2,
  X,
  Layers,
  ChevronDown,
  Folder,
  Check,
} from 'lucide-react-native';
import { GeistCard, GeistText, StatusBadge, useTheme, GeistInput } from '../../components/GeistUI';
import { Toast, ToastType } from '../../components/Toast';
import { vercel } from '../../api/vercel';
import { useUserContext } from '../../context/UserContext';

export interface ActivityDeployment {
  id: string;
  uid: string;
  name: string;
  url: string;
  aliases: string[];
  readyState: 'READY' | 'BUILDING' | 'ERROR' | 'CANCELED' | 'QUEUED';
  target?: string;
  createdAt: number;
  meta?: {
    githubCommitRef?: string;
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitAuthorName?: string;
  };
  computedStatus: 'Ready' | 'Building' | 'Failed' | 'Canceled' | 'Queued';
  computedTimeStr: string;
}

// Ultra-fast memoized deployment card item to prevent re-renders on filter/search changes
const DeploymentCardItem = memo(
  ({
    dep,
    theme,
    onOpenMenu,
    onPress,
  }: {
    dep: ActivityDeployment;
    theme: any;
    onOpenMenu: (dep: ActivityDeployment) => void;
    onPress: (uid: string) => void;
  }) => {
    const isProduction = dep.target === 'production';

    return (
      <GeistCard style={styles.card} onPress={() => onPress(dep.uid)}>
        {/* Top Header Row */}
        <View style={styles.cardHeader}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              marginRight: 8,
              flexWrap: 'wrap',
            }}
          >
            <GeistText weight="bold" style={{ fontSize: 16 }}>
              {dep.name}
            </GeistText>
            <GeistText secondary style={{ marginHorizontal: 6 }}>
              /
            </GeistText>
            <GeistText mono secondary style={{ fontSize: 13 }}>
              {dep.uid.substring(0, 7)}
            </GeistText>

            <View
              style={[
                styles.envPill,
                {
                  backgroundColor: isProduction ? theme.text : theme.surface,
                  borderColor: isProduction ? theme.text : theme.border,
                  marginLeft: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 999,
                },
              ]}
            >
              <GeistText
                style={{
                  fontSize: 10,
                  color: isProduction ? theme.background : theme.textSecondary,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {dep.target || 'production'}
              </GeistText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={dep.computedStatus} />

            {/* Instant-response 3-Dot Menu Button with expanded touch slop */}
            <TouchableOpacity
              style={[
                styles.threeDotBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
              onPress={(e) => {
                e.stopPropagation?.();
                onOpenMenu(dep);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.6}
            >
              <MoreVertical size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Commit Message */}
        <GeistText
          weight="500"
          numberOfLines={2}
          style={{ fontSize: 14, marginBottom: 12, color: theme.text }}
        >
          {dep.meta?.githubCommitMessage || 'Initial Project Deployment'}
        </GeistText>

        {/* Card Footer Metadata */}
        <View style={styles.cardFooter}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <GitCommit size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <GeistText mono secondary style={{ fontSize: 13 }}>
                {dep.meta?.githubCommitRef || 'main'}
              </GeistText>
            </View>

            {dep.meta?.githubCommitAuthorName && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
                <GeistText secondary style={{ fontSize: 13 }}>
                  {dep.meta.githubCommitAuthorName}
                </GeistText>
              </View>
            )}

            <GeistText secondary mono style={{ fontSize: 12 }}>
              {dep.computedTimeStr}
            </GeistText>
          </View>
        </View>
      </GeistCard>
    );
  }
);

DeploymentCardItem.displayName = 'DeploymentCardItem';

export default function ActivityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  const [deployments, setDeployments] = useState<ActivityDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const paginationNextRef = React.useRef<string | undefined>(undefined);
  const loadingMoreRef = React.useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // 3-Dot Action Menu Modal State
  const [activeMenuDeployment, setActiveMenuDeployment] = useState<ActivityDeployment | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // Redeploy Modal State
  const [redeployModalOpen, setRedeployModalOpen] = useState(false);
  const [clearCache, setClearCache] = useState(false);
  const [redeployTarget, setRedeployTarget] = useState<'production' | 'preview'>('production');
  const [redeploying, setRedeploying] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const fetchDeployments = useCallback(async (isPull = false, loadMore = false) => {
    if (loadMore) {
      if (loadingMoreRef.current || !hasMore) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      paginationNextRef.current = undefined;
      if (isPull) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setHasMore(true);
    }

    const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;

    if (!token) {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
      return;
    }

    try {
      const teamId = activeScope?.type === 'team' ? activeScope.id : undefined;

      const until =
        loadMore && paginationNextRef.current
          ? Number(paginationNextRef.current)
          : undefined;

      const result = await vercel.deployments.getDeployments({
        limit: 15,
        teamId,
        ...(until ? { until } : {}),
      });

      const list = (result as any)?.deployments || (result as any)?.object?.deployments || result || [];
      const now = Date.now();

      const formatted: ActivityDeployment[] = list.map((dep: any) => {
        const rawState = (dep.readyState || dep.state || 'READY').toUpperCase();
        let status: 'Ready' | 'Building' | 'Failed' | 'Canceled' | 'Queued' = 'Building';

        if (rawState === 'READY') status = 'Ready';
        else if (rawState === 'ERROR' || rawState === 'FAILED') status = 'Failed';
        else if (rawState === 'CANCELED') status = 'Canceled';
        else if (rawState === 'QUEUED') status = 'Queued';

        const created = dep.createdAt || now;
        const timeAgo = Math.round((now - created) / 1000 / 60);
        let timeStr = `${timeAgo}m ago`;
        if (timeAgo >= 60 && timeAgo < 1440) {
          timeStr = `${Math.round(timeAgo / 60)}h ago`;
        } else if (timeAgo >= 1440) {
          timeStr = `${Math.round(timeAgo / 1440)}d ago`;
        }

        const extractAliases = (d: any): string[] => {
          if (!d) return [];
          const raw = d.alias || d.aliases || [];
          if (Array.isArray(raw)) {
            return raw
              .map((item: any) => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object' && item) return item.alias || item.domain || '';
                return '';
              })
              .filter(Boolean);
          }
          if (typeof raw === 'string') {
            return [raw];
          }
          return [];
        };

        return {
          id: dep.uid || dep.id,
          uid: dep.uid || dep.id,
          name: dep.name || 'project',
          url: dep.url || `${dep.name || dep.id}.vercel.app`,
          aliases: extractAliases(dep),
          readyState: rawState as any,
          target: dep.target || 'production',
          createdAt: created,
          meta: dep.meta,
          computedStatus: status,
          computedTimeStr: timeStr,
        };
      });

      const newPagination =
        (result as any)?.pagination ||
        (result as any)?.object?.pagination ||
        (result as any)?.result?.pagination;

      if (loadMore) {
        setDeployments((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const uniqueList = formatted.filter((d: any) => !existingIds.has(d.id));
          return [...prev, ...uniqueList];
        });
      } else {
        setDeployments(formatted);
      }

      // Prevent infinite loop if API returns the same cursor or no cursor
      if (
        !newPagination?.next ||
        (loadMore && paginationNextRef.current === String(newPagination?.next))
      ) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      paginationNextRef.current = String(newPagination?.next);

      if (isPull && !loadMore) {
        showToast('Activity refreshed', 'success');
      }
    } catch (err: any) {
      console.error('Activity fetch error:', err);
      showToast('Failed to load activity', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [activeScope, showToast, hasMore]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      await fetchDeployments(false);
    }
    if (isMounted) {
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [fetchDeployments]);

  const handleManualRefresh = useCallback(() => {
    fetchDeployments(true);
  }, [fetchDeployments]);

  // Extract unique project list with counts
  const projectListWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    deployments.forEach((d) => {
      if (d.name) {
        counts[d.name] = (counts[d.name] || 0) + 1;
      }
    });

    const uniqueNames = Object.keys(counts).sort();
    return [
      { name: 'ALL', label: 'All Projects', count: deployments.length },
      ...uniqueNames.map((n) => ({ name: n, label: n, count: counts[n] })),
    ];
  }, [deployments]);

  // Filtered deployment list
  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const matchProject =
        selectedProjectFilter === 'ALL' ||
        d.name?.toLowerCase() === selectedProjectFilter.toLowerCase();
      if (!matchProject) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.name?.toLowerCase().includes(q) ||
        d.url?.toLowerCase().includes(q) ||
        d.meta?.githubCommitRef?.toLowerCase().includes(q) ||
        d.meta?.githubCommitMessage?.toLowerCase().includes(q) ||
        d.meta?.githubCommitAuthorName?.toLowerCase().includes(q) ||
        d.target?.toLowerCase().includes(q) ||
        d.computedStatus?.toLowerCase().includes(q)
      );
    });
  }, [deployments, selectedProjectFilter, searchQuery]);

  // Instant response 3-dot configure menu opener
  const handleOpenActionMenu = useCallback((dep: ActivityDeployment) => {
    setActiveMenuDeployment(dep);
    setRedeployTarget((dep.target as any) === 'preview' ? 'preview' : 'production');
    setActionMenuOpen(true);
  }, []);

  const handleItemPress = useCallback(
    (uid: string) => {
      router.push(`/deployment/${uid}`);
    },
    [router]
  );

  const handleCopyUrl = async () => {
    if (!activeMenuDeployment) return;
    const full = `https://${activeMenuDeployment.url}`;
    await Clipboard.setStringAsync(full);
    setActionMenuOpen(false);
    showToast('Deployment URL copied to clipboard');
  };

  const handleVisit = async () => {
    if (!activeMenuDeployment) return;
    const full = `https://${activeMenuDeployment.url}`;
    setActionMenuOpen(false);
    try {
      if (Platform.OS === 'web') {
        window.open(full, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(full);
      }
    } catch {
      // Fallback
    }
  };

  // Promote to Production
  const handlePromote = () => {
    if (!activeMenuDeployment) return;
    const targetDep = activeMenuDeployment;
    setActionMenuOpen(false);

    Alert.alert(
      'Promote to Production',
      `Promote deployment (${targetDep.url}) to Production? All production traffic will route to this build.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          style: 'default',
          onPress: async () => {
            const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;
            try {
              if (token && targetDep.name) {
                const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
                await fetch(
                  `https://api.vercel.com/v10/projects/${targetDep.name}/promote/${targetDep.uid}${queryParam}`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
              }

              setDeployments((prev) =>
                prev.map((d) => (d.uid === targetDep.uid ? { ...d, target: 'production' } : d))
              );
              showToast(`Promoted "${targetDep.name}" to Production!`, 'success');
            } catch (err: any) {
              showToast(`Promote failed: ${err.message}`, 'error');
            }
          },
        },
      ]
    );
  };

  // Rollback to this deployment
  const handleRollback = () => {
    if (!activeMenuDeployment) return;
    const targetDep = activeMenuDeployment;
    setActionMenuOpen(false);

    Alert.alert(
      'Rollback Production Traffic',
      `Instantly restore production traffic to this build (${targetDep.uid.substring(0, 7)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rollback Traffic',
          style: 'destructive',
          onPress: async () => {
            const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;
            try {
              if (token && targetDep.name) {
                const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
                await fetch(
                  `https://api.vercel.com/v9/projects/${targetDep.name}/rollback/${targetDep.uid}${queryParam}`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
              }
              showToast('Production traffic restored to this deployment!', 'success');
            } catch (err: any) {
              showToast(`Rollback failed: ${err.message}`, 'error');
            }
          },
        },
      ]
    );
  };

  // Cancel build
  const handleCancelDeployment = () => {
    if (!activeMenuDeployment) return;
    const targetDep = activeMenuDeployment;
    setActionMenuOpen(false);

    Alert.alert(
      'Cancel Deployment',
      'Are you sure you want to abort this in-progress deployment?',
      [
        { text: 'Keep Building', style: 'cancel' },
        {
          text: 'Cancel Deployment',
          style: 'destructive',
          onPress: async () => {
            const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;
            try {
              if (token && targetDep.uid) {
                const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
                await fetch(
                  `https://api.vercel.com/v12/deployments/${targetDep.uid}/cancel${queryParam}`,
                  {
                    method: 'PATCH',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
              }
              setDeployments((prev) =>
                prev.map((d) =>
                  d.uid === targetDep.uid
                    ? { ...d, computedStatus: 'Canceled', readyState: 'CANCELED' }
                    : d
                )
              );
              showToast('Deployment was cancelled', 'error');
            } catch (err: any) {
              showToast(`Cancel failed: ${err.message}`, 'error');
            }
          },
        },
      ]
    );
  };

  // Execute Redeploy
  const executeRedeploy = async () => {
    if (!activeMenuDeployment) return;
    setRedeploying(true);
    const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;
    const dep = activeMenuDeployment;

    try {
      if (!token) {
        setTimeout(() => {
          setRedeploying(false);
          setRedeployModalOpen(false);
          const fakeId = Math.random().toString(16).substring(2, 8);
          showToast(`Redeploying ${dep.name}...`);
          router.push(`/deployment/${fakeId}`);
        }, 1000);
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('forceNew', '1');
      if (clearCache) {
        queryParams.append('withCache', '0');
      }
      if (activeScope?.type === 'team' && activeScope.id) {
        queryParams.append('teamId', activeScope.id);
      }

      const payload: any = {
        name: dep.name,
        deploymentId: dep.uid,
        target: redeployTarget,
      };

      const res = await fetch(`https://api.vercel.com/v13/deployments?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Failed to trigger redeployment');
      }

      showToast('Redeployment initiated!', 'success');
      setRedeployModalOpen(false);
      setRedeploying(false);

      const newId = data.id || data.uid || data.url || dep.name;
      router.push(`/deployment/${newId}`);
    } catch (err: any) {
      console.error('Redeploy error:', err);
      setRedeploying(false);
      showToast(`Redeploy Failed: ${err.message}`, 'error');
      Alert.alert('Redeploy Failed', err.message);
    }
  };

  const currentProjectLabel =
    selectedProjectFilter === 'ALL'
      ? 'All Projects'
      : selectedProjectFilter;

  // Render header component for FlatList
  const renderHeader = () => (
    <View>
      {/* Title & Refresh Row */}
      <View style={styles.header}>
        <View>
          <GeistText weight="bold" style={{ fontSize: 28 }}>
            Activity
          </GeistText>
          <GeistText secondary style={{ marginTop: 4 }}>
            All deployment history across projects ({deployments.length} total)
          </GeistText>
        </View>

      </View>

      {/* Side-by-Side Controls: Search Bar + Project Dropdown Filter */}
      <View style={styles.controlsRow}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
            },
          ]}
        >
          <Search size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <GeistInput
            placeholder="Search activity..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderWidth: 0,
              backgroundColor: 'transparent',
              paddingVertical: 0,
              paddingHorizontal: 0,
              flex: 1,
              fontSize: 13,
            }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Project Dropdown Trigger Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setProjectDropdownOpen(true)}
          style={[
            styles.projectDropdownBtn,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
            },
          ]}
        >
          <Folder size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
          <GeistText
            numberOfLines={1}
            weight="500"
            style={{ fontSize: 13, maxWidth: 120 }}
          >
            {currentProjectLabel}
          </GeistText>
          <ChevronDown size={14} color={theme.textSecondary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Virtualized FlatList for 60/120fps scrolling and ultra-fast touch response */}
      <FlatList
        data={filteredDeployments}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <DeploymentCardItem
            dep={item}
            theme={theme}
            onOpenMenu={handleOpenActionMenu}
            onPress={handleItemPress}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.container}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleManualRefresh}
            tintColor={theme.text}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.text} />
              <GeistText secondary style={{ marginTop: 12, fontSize: 13 }}>
                Loading deployment activity...
              </GeistText>
            </View>
          ) : (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <GeistText secondary style={{ fontSize: 14 }}>
                {searchQuery || selectedProjectFilter !== 'ALL'
                  ? 'No deployments match your filter.'
                  : 'No deployment activity found.'}
              </GeistText>
            </View>
          )
        }
        onEndReached={() => {
          if (!loading && !refreshing && hasMore && !loadingMoreRef.current) {
            fetchDeployments(false, true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.text} />
            </View>
          ) : null
        }
      />

      {/* Project Selector Dropdown Modal */}
      <Modal
        visible={projectDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProjectDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProjectDropdownOpen(false)}
        >
          <View style={[styles.dropdownCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Folder size={16} color={theme.text} />
                <GeistText weight="600" style={{ fontSize: 15 }}>
                  Filter by Project
                </GeistText>
              </View>
              <TouchableOpacity onPress={() => setProjectDropdownOpen(false)}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320, padding: 8 }}>
              {projectListWithCounts.map((item) => {
                const isSelected = selectedProjectFilter === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.projectDropdownItem,
                      {
                        backgroundColor: isSelected ? theme.surface : 'transparent',
                        borderColor: isSelected ? theme.border : 'transparent',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedProjectFilter(item.name);
                      setProjectDropdownOpen(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Folder size={16} color={isSelected ? theme.text : theme.textSecondary} />
                      <GeistText
                        weight={isSelected ? '600' : 'normal'}
                        style={{ fontSize: 14 }}
                      >
                        {item.label}
                      </GeistText>
                      <View
                        style={{
                          backgroundColor: theme.surface,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        <GeistText secondary mono style={{ fontSize: 11 }}>
                          {item.count}
                        </GeistText>
                      </View>
                    </View>
                    {isSelected && <Check size={16} color={theme.success} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3-Dot Action Sheet / Modal */}
      <Modal
        visible={actionMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setActionMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActionMenuOpen(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <GeistText weight="bold" style={{ fontSize: 16 }}>
                  {activeMenuDeployment?.name}
                </GeistText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <GeistText mono secondary style={{ fontSize: 12, flexShrink: 0 }}>
                    {activeMenuDeployment?.uid?.substring(0, 7)} ·{' '}
                  </GeistText>
                  <GeistText mono secondary numberOfLines={1} ellipsizeMode="middle" style={{ fontSize: 12, flexShrink: 1 }}>
                    {activeMenuDeployment?.url}
                  </GeistText>
                </View>
              </View>
              <TouchableOpacity onPress={() => setActionMenuOpen(false)} style={{ paddingTop: 2 }}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Action Items List */}
            <View style={{ paddingVertical: 8 }}>
              {/* 1. Redeploy */}
              <TouchableOpacity
                style={styles.menuActionItem}
                onPress={() => {
                  setActionMenuOpen(false);
                  setRedeployModalOpen(true);
                }}
                activeOpacity={0.7}
              >
                <RotateCw size={18} color={theme.text} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <GeistText weight="500" style={{ fontSize: 14 }}>
                    Redeploy Project
                  </GeistText>
                  <GeistText secondary style={{ fontSize: 12 }}>
                    Rebuild from this exact commit with cache options
                  </GeistText>
                </View>
              </TouchableOpacity>

              {/* 2. View Deployment Timeline */}
              <TouchableOpacity
                style={styles.menuActionItem}
                onPress={() => {
                  setActionMenuOpen(false);
                  if (activeMenuDeployment) {
                    router.push(`/deployment/${activeMenuDeployment.uid}`);
                  }
                }}
                activeOpacity={0.7}
              >
                <Layers size={18} color={theme.text} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <GeistText weight="500" style={{ fontSize: 14 }}>
                    View Deployment Details
                  </GeistText>
                  <GeistText secondary style={{ fontSize: 12 }}>
                    5-stage progress timeline and assigned aliases
                  </GeistText>
                </View>
              </TouchableOpacity>

              {/* 3. Visit Live */}
              <TouchableOpacity
                style={styles.menuActionItem}
                onPress={handleVisit}
                activeOpacity={0.7}
              >
                <ExternalLink size={18} color={theme.text} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <GeistText weight="500" style={{ fontSize: 14 }}>
                    Visit Live URL
                  </GeistText>
                  <GeistText secondary style={{ fontSize: 12 }}>
                    Open in web browser
                  </GeistText>
                </View>
              </TouchableOpacity>
              {/* 4. Cancel Deployment (if building) */}
              {activeMenuDeployment?.computedStatus === 'Building' && (
                <TouchableOpacity
                  style={styles.menuActionItem}
                  onPress={handleCancelDeployment}
                  activeOpacity={0.7}
                >
                  <XCircle size={18} color={theme.error} style={{ marginRight: 14 }} />
                  <View style={{ flex: 1 }}>
                    <GeistText weight="500" style={{ color: theme.error, fontSize: 14 }}>
                      Cancel Deployment
                    </GeistText>
                    <GeistText secondary style={{ fontSize: 12 }}>
                      Abort active in-progress build
                    </GeistText>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Redeploy Modal */}
      <Modal
        visible={redeployModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !redeploying && setRedeployModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <RotateCw size={18} color={theme.text} />
                <GeistText weight="600" style={{ fontSize: 16 }}>
                  Redeploy Project
                </GeistText>
              </View>
              <TouchableOpacity onPress={() => !redeploying && setRedeployModalOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <GeistText secondary style={{ fontSize: 13, marginBottom: 16 }}>
                Trigger a new build for <GeistText weight="bold">{activeMenuDeployment?.name}</GeistText> from this exact commit.
              </GeistText>

              {/* Target Selector */}
              <GeistText weight="600" style={{ fontSize: 13, marginBottom: 8 }}>
                Target Environment
              </GeistText>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {(['production', 'preview'] as const).map((t) => {
                  const active = redeployTarget === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setRedeployTarget(t)}
                      style={[
                        styles.targetOption,
                        {
                          backgroundColor: active ? theme.text : theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <GeistText
                        weight="500"
                        style={{
                          color: active ? theme.background : theme.text,
                          textTransform: 'capitalize',
                          fontSize: 13,
                        }}
                      >
                        {t}
                      </GeistText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Clear Cache Toggle */}
              <TouchableOpacity
                style={[
                  styles.cacheToggleRow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setClearCache(!clearCache)}
              >
                <View style={{ flex: 1 }}>
                  <GeistText weight="500" style={{ fontSize: 13 }}>
                    Clear Build Cache
                  </GeistText>
                  <GeistText secondary style={{ fontSize: 11, marginTop: 2 }}>
                    Rebuild all dependencies from scratch
                  </GeistText>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: clearCache ? theme.text : 'transparent',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {clearCache && <CheckCircle2 size={14} color={theme.background} />}
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                  onPress={() => setRedeployModalOpen(false)}
                  disabled={redeploying}
                >
                  <GeistText weight="500" style={{ fontSize: 13 }}>Cancel</GeistText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: theme.text }]}
                  onPress={executeRedeploy}
                  disabled={redeploying}
                >
                  {redeploying ? (
                    <ActivityIndicator size="small" color={theme.background} />
                  ) : (
                    <GeistText weight="600" style={{ color: theme.background, fontSize: 13 }}>
                      Redeploy
                    </GeistText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  projectDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  projectDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  envPill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  threeDotBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlsContainer: {
    gap: 6,
    marginBottom: 12,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urlLabel: {
    width: 80,
    fontSize: 12,
  },
  urlLinkTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  miniIconBtn: {
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
    paddingTop: 10,
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  targetOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  cacheToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalSubmitBtn: {
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
