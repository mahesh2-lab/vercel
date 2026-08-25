import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { getCachedVercelToken } from '@/lib/vercel-token';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { FlashList } from '@shopify/flash-list';
import {
  Search,
  GitCommit,
  Tag,
  Rocket,
  RotateCw,
  Copy,
  Terminal,
} from 'lucide-react-native';
import { GeistText, GeistCard, StatusBadge, useTheme, GeistInput } from '../../../components/GeistUI';
import { Toast, ToastType } from '../../../components/Toast';
import { vercel } from '../../../api/vercel';
import { useUserContext } from '../../../context/UserContext';

const DeploymentRowItem = memo(function DeploymentRowItem({
  dep,
  isLast,
  theme,
  onPress,
  onPromote,
  onRedeploy,
  onLogs,
  onCopy,
}: {
  dep: any;
  isLast: boolean;
  theme: any;
  onPress: (id: string) => void;
  onPromote: (dep: any) => void;
  onRedeploy: (dep: any) => void;
  onLogs: (id: string) => void;
  onCopy: (url: string) => void;
}) {
  const depId = dep.uid || dep.id;
  const isProduction = dep.target === 'production';

  const rawState = (dep.readyState || dep.state || 'READY').toUpperCase();
  const status =
    rawState === 'READY'
      ? 'Ready'
      : rawState === 'ERROR' || rawState === 'FAILED'
      ? 'Failed'
      : rawState === 'CANCELED'
      ? 'Canceled'
      : rawState === 'QUEUED'
      ? 'Queued'
      : 'Building';

  return (
    <View
      style={[
        styles.deploymentRow,
        {
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <TouchableOpacity onPress={() => onPress(depId)} activeOpacity={0.7}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              flex: 1,
              marginRight: 12,
            }}
          >
            <GeistText weight="600" style={{ fontSize: 16, marginRight: 10 }}>
              {dep.url || 'No URL'}
            </GeistText>
            <View
              style={[
                styles.envBadge,
                {
                  backgroundColor: isProduction ? theme.success + '20' : theme.surface,
                  borderColor: isProduction ? theme.success + '40' : theme.border,
                },
              ]}
            >
              <GeistText
                style={{
                  fontSize: 11,
                  color: isProduction ? theme.success : theme.text,
                }}
              >
                {isProduction ? 'Production' : 'Preview'}
              </GeistText>
            </View>
          </View>
          <StatusBadge status={status as any} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GitCommit color={theme.textSecondary} size={14} style={{ marginRight: 6 }} />
            <GeistText mono secondary style={{ fontSize: 12 }}>
              {dep.meta?.githubCommitRef || 'main'}
            </GeistText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Tag color={theme.textSecondary} size={14} style={{ marginRight: 6 }} />
            <GeistText mono secondary style={{ fontSize: 12 }}>
              {dep.meta?.githubCommitSha?.substring(0, 7) || depId?.substring(0, 7) || 'N/A'}
            </GeistText>
          </View>
          <GeistText mono secondary style={{ fontSize: 12 }}>
            {dep.createdAt ? new Date(dep.createdAt).toLocaleDateString() : 'Just now'}
          </GeistText>
        </View>
      </TouchableOpacity>

      {/* Action Buttons Bar */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
          borderTopWidth: 1,
          borderTopColor: theme.border + '50',
          paddingTop: 10,
        }}
      >
        {!isProduction && (
          <TouchableOpacity
            style={[styles.rowActionBtn, { borderColor: '#0070F3', backgroundColor: '#0070F312' }]}
            onPress={() => onPromote(dep)}
          >
            <Rocket size={12} color="#0070F3" style={{ marginRight: 4 }} />
            <GeistText weight="600" style={{ fontSize: 11, color: '#0070F3' }}>
              Promote to Prod
            </GeistText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.rowActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => onRedeploy(dep)}
        >
          <RotateCw size={12} color={theme.text} style={{ marginRight: 4 }} />
          <GeistText weight="500" style={{ fontSize: 11 }}>
            Redeploy
          </GeistText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rowActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => onLogs(depId)}
        >
          <Terminal size={12} color={theme.text} style={{ marginRight: 4 }} />
          <GeistText weight="500" style={{ fontSize: 11 }}>
            Logs
          </GeistText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rowActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => onCopy(dep.url)}
        >
          <Copy size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
          <GeistText secondary style={{ fontSize: 11 }}>
            Copy
          </GeistText>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function ProjectDeploymentsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    async function fetchDeployments() {
      try {
        if (!getCachedVercelToken()) return;
        const result = await vercel.deployments.getDeployments({ projectId: id as string });
        const list = (result as any)?.deployments || (result as any)?.object?.deployments || result || [];
        setDeployments(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDeployments();
  }, [id]);

  const filteredDeployments = useMemo(() => {
    if (!searchQuery.trim()) return deployments;
    const q = searchQuery.toLowerCase();
    return deployments.filter(
      (d) =>
        d.url?.toLowerCase().includes(q) ||
        d.meta?.githubCommitRef?.toLowerCase().includes(q) ||
        d.meta?.githubCommitMessage?.toLowerCase().includes(q) ||
        d.target?.toLowerCase().includes(q)
    );
  }, [deployments, searchQuery]);

  const handleCopyUrl = useCallback(async (url: string) => {
    const full = url.startsWith('http') ? url : `https://${url}`;
    await Clipboard.setStringAsync(full);
    showToast('Deployment URL copied');
  }, []);

  const handlePromote = useCallback((dep: any) => {
    Alert.alert(
      'Promote to Production',
      `Promote deployment (${dep.url}) to Production?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          style: 'default',
          onPress: async () => {
            const token = getCachedVercelToken();
            try {
              if (token && id) {
                const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
                const { promoteDeployment } = require('../../../lib/vercel-api');
                await promoteDeployment(id as string, (dep.uid || dep.id) as string, queryParam);
              }

              setDeployments((prev) =>
                prev.map((item) =>
                  item.uid === dep.uid || item.id === dep.id ? { ...item, target: 'production' } : item
                )
              );
              showToast('Promoted to Production!', 'success');
            } catch (err: any) {
              showToast(`Promote failed: ${err.message}`, 'error');
            }
          },
        },
      ]
    );
  }, [id, activeScope]);

  const handleRedeploy = useCallback(async (dep: any) => {
    const token = getCachedVercelToken();
    showToast(`Redeploying ${dep.name || id}...`);

    try {
      if (token) {
        const queryParams = new URLSearchParams();
        queryParams.append('forceNew', '1');
        if (activeScope?.type === 'team' && activeScope.id) {
          queryParams.append('teamId', activeScope.id);
        }
        const { createDeployment } = require('../../../lib/vercel-api');
        const res = await createDeployment("?" + queryParams.toString(), {
          name: dep.name || id,
          deploymentId: dep.uid || dep.id,
          target: dep.target || 'production',
        });

        const data = await res.json();
        const newId = data.id || data.uid || data.url || dep.uid;
        router.push(`/deployment/${newId}`);
      } else {
        router.push(`/deployment/${dep.uid || dep.id}`);
      }
    } catch {
      router.push(`/deployment/${dep.uid || dep.id}`);
    }
  }, [id, activeScope, router]);

  const handleNavigateDetail = useCallback((depId: string) => {
    router.push(`/deployment/${depId}`);
  }, [router]);

  const handleNavigateLogs = useCallback((depId: string) => {
    router.push(`/deployment/${depId}/logs`);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <GeistText weight="bold" style={{ fontSize: 24 }}>Deployments</GeistText>
        </View>

        <GeistCard style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center' }}>
            <Search size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
            <GeistInput 
              placeholder="Search deployments..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ borderWidth: 0, backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 0, flex: 1, fontSize: 16 }}
            />
          </View>
          
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.text} />
            </View>
          ) : filteredDeployments.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <GeistText secondary>
                {searchQuery ? `No deployments match "${searchQuery}"` : 'No deployments found.'}
              </GeistText>
            </View>
          ) : (
            <FlashList
              data={filteredDeployments}
              keyExtractor={(item) => item.uid || item.id}
              renderItem={({ item, index }) => (
                <DeploymentRowItem
                  dep={item}
                  isLast={index === filteredDeployments.length - 1}
                  theme={theme}
                  onPress={handleNavigateDetail}
                  onPromote={handlePromote}
                  onRedeploy={handleRedeploy}
                  onLogs={handleNavigateLogs}
                  onCopy={handleCopyUrl}
                />
              )}
            />
          )}
        </GeistCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  deploymentRow: {
    padding: 20,
  },
  envBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
});
