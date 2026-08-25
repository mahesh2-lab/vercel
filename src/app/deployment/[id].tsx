import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getCachedVercelToken } from '@/lib/vercel-token';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  Modal,
  TextInput,
  Share,
  AppState,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import {
  CheckCircle2,
  Circle,
  GitCommit,
  ExternalLink,
  Terminal,
  Clock,
  Globe,
  XCircle,
  RotateCw,
  Rocket,
  RotateCcw,
  Share2,
  Plus,
  X,
  Sparkles,
  AlertTriangle,
  Copy,
} from 'lucide-react-native';
import { GeistButton, GeistCard, GeistText, StatusBadge, useTheme } from '../../components/GeistUI';
import { Toast, ToastType } from '../../components/Toast';
import { useUserContext } from '../../context/UserContext';
import { resolveDeploymentDomains } from '../../utils/domainResolver';

interface DeploymentData {
  id: string;
  name: string;
  url: string;
  readyState: 'INITIALIZING' | 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  target: string;
  createdAt: number;
  meta?: {
    githubCommitRef?: string;
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitAuthorName?: string;
  };
  aliases?: string[];
  errorMessage?: string;
  errorCode?: string;
}

export default function DeploymentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  // Deployment State
  const [deployment, setDeployment] = useState<DeploymentData | null>(null);
  const [progressStep, setProgressStep] = useState(0); // 0: Queued, 1: Cloning, 2: Building, 3: Domains, 4: Ready
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; code?: string } | null>(null);

  // Operational Modals & States
  const [redeployModalOpen, setRedeployModalOpen] = useState(false);
  const [clearCache, setClearCache] = useState(false);
  const [redeployTarget, setRedeployTarget] = useState<'production' | 'preview'>('production');
  const [redeploying, setRedeploying] = useState(false);

  const [aliasModalOpen, setAliasModalOpen] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [assigningAlias, setAssigningAlias] = useState(false);

  const [promoting, setPromoting] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  // Timer for elapsed build time
  useEffect(() => {
    if (isDone) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isDone]);

  // Fetch real deployment from Vercel API with continuous polling for active builds
  const fetchDeploymentDetails = useCallback(async () => {
    const token = getCachedVercelToken();
    if (!token) return null;

    try {
      const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
      const { getDeployment } = require('../../lib/vercel-api');
      const res = await getDeployment(id as string, queryParam);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || errorData?.message || `Vercel error (${res.status})`;
        const errCode = errorData?.error?.code || errorData?.code || 'DEPLOYMENT_ERROR';
        return { isFetchError: true, message: errMsg, code: errCode };
      }

      const dep = await res.json();
      return dep;
    } catch (err: any) {
      console.warn('Network error fetching deployment:', err);
      return { isFetchError: true, message: err.message || 'Network error', code: 'NETWORK_ERROR' };
    }
  }, [id, activeScope]);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: any = null;

    async function loadAndSync() {
      const token = getCachedVercelToken();

      if (!token) {
        runLiveSimulation();
        return;
      }

      const dep = await fetchDeploymentDetails();

      if (!isMounted) return;

      if (dep?.isFetchError) {
        setIsDone(true);
        setErrorDetails({
          message: dep.message,
          code: dep.code,
        });
        setDeployment({
          id: id as string,
          name: id as string,
          url: `${id}.vercel.app`,
          readyState: 'ERROR',
          target: 'production',
          createdAt: Date.now(),
        });
        return;
      }

      if (dep) {
        const rawState = (dep.readyState || dep.state || 'BUILDING').toUpperCase();
        const isFailed = rawState === 'ERROR' || rawState === 'FAILED' || rawState === 'CANCELED';
        const isSuccess = rawState === 'READY';

        const errMsg =
          dep.errorMessage ||
          dep.error?.message ||
          dep.buildingError ||
          (isFailed ? 'The build process encountered an error and failed.' : undefined);

        const errCode = dep.errorCode || dep.error?.code || (isFailed ? 'BUILD_FAILED' : undefined);

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

        setDeployment({
          id: dep.id || dep.uid || (id as string),
          name: dep.name || 'project',
          url: dep.url || `${dep.name || id}.vercel.app`,
          readyState: isFailed ? (rawState === 'CANCELED' ? 'CANCELED' : 'ERROR') : isSuccess ? 'READY' : 'BUILDING',
          target: dep.target || 'production',
          createdAt: dep.createdAt || 0,
          meta: dep.meta,
          aliases: extractAliases(dep),
          errorMessage: errMsg,
          errorCode: errCode,
        });

        if (isFailed) {
          setIsDone(true);
          setProgressStep(2);
          setErrorDetails({
            message: errMsg || 'Deployment build failed on Vercel.',
            code: errCode,
          });
          showToast(`Deployment Failed: ${errCode || 'BUILD_ERROR'}`, 'error');
        } else if (isSuccess) {
          setIsDone(true);
          setProgressStep(4);
        } else {
          // Still building / queued - Poll every 2.5s
          setProgressStep(2);
          if (!pollInterval) {
            pollInterval = setInterval(async () => {
              if (!isMounted) return;
              const updated = await fetchDeploymentDetails();
              if (updated && !updated.isFetchError) {
                const state = (updated.readyState || updated.state || 'BUILDING').toUpperCase();
                if (state === 'READY' || state === 'ERROR' || state === 'FAILED' || state === 'CANCELED') {
                  clearInterval(pollInterval);
                  loadAndSync();
                }
              }
            }, 2500);
          }
        }
      }
    }

    function runLiveSimulation() {
      if (!isMounted) return;
      setDeployment({
        id: id as string,
        name: 'my-vercel-app',
        url: `${id}.vercel.app`,
        readyState: 'BUILDING',
        target: 'production',
        createdAt: 0,
        meta: {
          githubCommitRef: 'main',
          githubCommitSha: '7f3a1b2',
          githubCommitMessage: 'feat: live build deployment tracking',
          githubCommitAuthorName: 'Developer',
        },
      });

      const t1 = setTimeout(() => {
        if (isMounted) setProgressStep(1);
      }, 1500);

      const t2 = setTimeout(() => {
        if (isMounted) setProgressStep(2);
      }, 3500);

      const t3 = setTimeout(() => {
        if (isMounted) setProgressStep(3);
      }, 6500);

      const t4 = setTimeout(() => {
        if (isMounted) {
          setProgressStep(4);
          setIsDone(true);
          setDeployment((prev) => (prev ? { ...prev, readyState: 'READY' } : null));
          showToast('Deployment Ready! Assigned domain is active.');
        }
      }, 8500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }

    loadAndSync();

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      } else if (isMounted && !isDone) {
        loadAndSync();
      }
    });

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      appStateSub.remove();
    };
  }, [id, fetchDeploymentDetails, isDone]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins > 0 ? `${mins}m ` : ''}${remainder}s`;
  };

  const createdDateStr = deployment?.createdAt
    ? new Date(deployment.createdAt).toLocaleString()
    : 'Just now';

  const isFailed = deployment?.readyState === 'ERROR' || !!errorDetails;
  const isCanceled = deployment?.readyState === 'CANCELED';
  const isReady = deployment?.readyState === 'READY' || (!isFailed && progressStep >= 4);

  const currentStatus = isFailed
    ? 'Failed'
    : isCanceled
    ? 'Canceled'
    : isReady
    ? 'Ready'
    : progressStep === 0
    ? 'Queued'
    : progressStep === 1
    ? 'Cloning'
    : 'Building';

  const domainInfo = useMemo(() => {
    return resolveDeploymentDomains(
      deployment?.aliases,
      deployment?.url || (id as string),
      deployment?.name || '',
      deployment?.target || 'production'
    );
  }, [deployment, id]);

  const fullUrl = `https://${domainInfo.primaryPublicDomain || deployment?.url || `${id}.vercel.app`}`;

  const handleCopyUrl = async () => {
    await Clipboard.setStringAsync(fullUrl);
    showToast('Public URL copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: deployment?.name || 'Vercel Deployment',
        message: `Check out ${deployment?.name || 'deployment'}: ${fullUrl}`,
        url: fullUrl,
      });
    } catch {
      handleCopyUrl();
    }
  };

  const handleVisit = async (domainToOpen?: string) => {
    const target = domainToOpen
      ? (domainToOpen.startsWith('http') ? domainToOpen : `https://${domainToOpen}`)
      : fullUrl;
    try {
      if (Platform.OS === 'web') {
        window.open(target, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(target);
      }
    } catch {
      Linking.openURL(target).catch((err) => console.error(err));
    }
  };

  // 1. Redeploy Functionality
  const executeRedeploy = async () => {
    setRedeploying(true);
    const token = getCachedVercelToken();

    try {
      if (!token) {
        setTimeout(() => {
          setRedeploying(false);
          setRedeployModalOpen(false);
          const fakeId = Math.random().toString(16).substring(2, 8);
          showToast(`Redeploying ${deployment?.name || 'project'}...`);
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
        name: deployment?.name,
        deploymentId: deployment?.id,
        target: redeployTarget,
      };

      const { createDeployment } = require('../../lib/vercel-api');
      const res = await createDeployment('?' + queryParams.toString(), payload);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Failed to trigger redeployment');
      }

      showToast('Redeployment triggered successfully!', 'success');
      setRedeployModalOpen(false);
      setRedeploying(false);

      const newId = data.id || data.uid || data.url;
      router.push(`/deployment/${newId}`);
    } catch (err: any) {
      console.error('Redeploy error:', err);
      setRedeploying(false);
      showToast(`Redeploy Failed: ${err.message}`, 'error');
      Alert.alert('Redeploy Failed', err.message);
    }
  };

  // 2. Promote to Production Functionality
  const handlePromoteToProduction = () => {
    Alert.alert(
      'Promote to Production',
      `Promote deployment (${deployment?.id?.substring(0, 7)}) to Production? All production domains will be reassigned to this build.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          style: 'default',
          onPress: async () => {
            setPromoting(true);
            const token = getCachedVercelToken();

            try {
              if (token && deployment?.name) {
                const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
                const { promoteDeployment } = require('../../lib/vercel-api');
                const res = await promoteDeployment(deployment.name, deployment.id, queryParam);

                if (!res.ok) {
                  const errorData = await res.json().catch(() => ({}));
                  throw new Error(errorData?.error?.message || errorData?.message || 'Promote failed');
                }
              }

              setDeployment((prev) => (prev ? { ...prev, target: 'production' } : null));
              showToast('Deployment Promoted to Production!', 'success');
            } catch (err: any) {
              console.error('Promote error:', err);
              showToast(`Promote failed: ${err.message}`, 'error');
              Alert.alert('Promote Failed', err.message);
            } finally {
              setPromoting(false);
            }
          },
        },
      ]
    );
  };

  // 3. Rollback to this Version
  const handleRollback = () => {
    Alert.alert(
      'Rollback Production Traffic',
      `Instantly route all production traffic back to this verified build (${deployment?.id?.substring(0, 7)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rollback Traffic',
          style: 'destructive',
          onPress: async () => {
            setRollingBack(true);
            const token = getCachedVercelToken();

            try {
              if (token && deployment?.name) {
                const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
                const { rollbackDeployment } = require('../../lib/vercel-api');
                await rollbackDeployment(deployment.name, deployment.id, queryParam);
              }

              showToast('Production traffic restored to this deployment!', 'success');
            } catch (err: any) {
              console.error('Rollback error:', err);
              showToast(`Rollback failed: ${err.message}`, 'error');
            } finally {
              setRollingBack(false);
            }
          },
        },
      ]
    );
  };

  // 4. Cancel Active Deployment
  const handleCancel = () => {
    Alert.alert(
      'Cancel Deployment',
      'Are you sure you want to cancel this in-progress deployment?',
      [
        { text: 'Keep Building', style: 'cancel' },
        {
          text: 'Cancel Deployment',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            const token = getCachedVercelToken();

            try {
              if (token && deployment?.id) {
                const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
                const { cancelDeployment } = require('../../lib/vercel-api');
                await cancelDeployment(deployment.id, queryParam);
              }

              setIsDone(true);
              setDeployment((prev) => (prev ? { ...prev, readyState: 'CANCELED' } : null));
              showToast('Deployment was cancelled', 'error');
            } catch (err: any) {
              console.error('Cancel error:', err);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  // 5. Assign Custom Domain Alias
  const handleAssignAlias = async () => {
    if (!newAlias.trim()) {
      showToast('Please enter an alias domain', 'error');
      return;
    }

    setAssigningAlias(true);
    const token = getCachedVercelToken();

    try {
      if (token && deployment?.id) {
        const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
        const { createAlias } = require('../../lib/vercel-api');
        const res = await createAlias(deployment.id, queryParam, newAlias.trim());

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || errorData?.message || 'Failed to assign domain');
        }
      }

      setDeployment((prev) =>
        prev
          ? {
              ...prev,
              aliases: [...(prev.aliases || []), newAlias.trim()],
            }
          : null
      );

      showToast(`Assigned alias "${newAlias.trim()}"`, 'success');
      setNewAlias('');
      setAliasModalOpen(false);
    } catch (err: any) {
      console.error('Alias error:', err);
      showToast(`Alias assignment failed: ${err.message}`, 'error');
      Alert.alert('Alias Failed', err.message);
    } finally {
      setAssigningAlias(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <GeistText weight="bold" style={{ fontSize: 26 }}>
              Deployment
            </GeistText>
            <StatusBadge status={currentStatus as any} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <View
              style={[
                styles.targetBadge,
                {
                  backgroundColor:
                    deployment?.target === 'production' ? theme.success + '1A' : theme.surface,
                  borderColor:
                    deployment?.target === 'production' ? theme.success + '40' : theme.border,
                },
              ]}
            >
              <GeistText
                mono
                style={{
                  fontSize: 12,
                  color: deployment?.target === 'production' ? theme.success : theme.text,
                }}
              >
                {deployment?.target || 'production'}
              </GeistText>
            </View>
            <GeistText secondary>·</GeistText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <GitCommit size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <GeistText mono secondary style={{ fontSize: 13 }}>
                {deployment?.meta?.githubCommitRef || 'main'}
              </GeistText>
            </View>
            <GeistText secondary>·</GeistText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <GeistText mono secondary style={{ fontSize: 13 }}>
                {formatTime(elapsedSeconds)}
              </GeistText>
            </View>
          </View>
        </View>

        {/* Action Header Controls */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={[styles.headerBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Share2 size={15} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setRedeployModalOpen(true)}
            style={[styles.headerBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <RotateCw size={15} color={theme.text} />
            <GeistText weight="500" style={{ fontSize: 13, marginLeft: 6 }}>
              Redeploy
            </GeistText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Prominent Failure Banner if Deployment Failed */}
      {isFailed && (
        <View
          style={[
            styles.failureBanner,
            {
              borderColor: theme.error,
              backgroundColor: theme.error + '14',
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <AlertTriangle size={22} color={theme.error} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <GeistText weight="bold" style={{ color: theme.error, fontSize: 16 }}>
                  Deployment Failed
                </GeistText>
                {errorDetails?.code && (
                  <View style={[styles.errorCodePill, { backgroundColor: theme.error + '26', borderColor: theme.error + '60' }]}>
                    <GeistText mono style={{ color: theme.error, fontSize: 11 }}>
                      {errorDetails.code}
                    </GeistText>
                  </View>
                )}
              </View>

              <GeistText style={{ fontSize: 14, color: theme.text, marginBottom: 14, lineHeight: 20 }}>
                {errorDetails?.message || deployment?.errorMessage || 'An error occurred during build execution. Please check the terminal logs for diagnostics.'}
              </GeistText>

              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  style={[styles.failureBtn, { backgroundColor: theme.error }]}
                  onPress={() => {
                    router.push({
                      pathname: `/deployment/${id}/logs` as any,
                      params: { error: errorDetails?.message || 'Build Error' },
                    });
                  }}
                >
                  <Terminal size={14} color="#fff" style={{ marginRight: 6 }} />
                  <GeistText weight="600" style={{ color: '#fff', fontSize: 13 }}>
                    View Build Error Logs
                  </GeistText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.failureBtnOutline, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={() => {
                    setClearCache(true);
                    setRedeployModalOpen(true);
                  }}
                >
                  <RotateCw size={14} color={theme.text} style={{ marginRight: 6 }} />
                  <GeistText weight="600" style={{ fontSize: 13 }}>
                    Redeploy (Clear Cache)
                  </GeistText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Promote to Production Banner for Previews */}
      {!isFailed && deployment?.target !== 'production' && (
        <GeistCard style={[styles.promoteCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <Rocket size={18} color={theme.text} />
              <View style={{ flex: 1 }}>
                <GeistText weight="600" style={{ fontSize: 15 }}>
                  Promote to Production
                </GeistText>
                <GeistText secondary style={{ fontSize: 13, marginTop: 2 }}>
                  Assign your main production domains to this preview build.
                </GeistText>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.promoteBtn, { backgroundColor: theme.text }]}
              activeOpacity={0.7}
              onPress={handlePromoteToProduction}
              disabled={promoting}
            >
              {promoting ? (
                <ActivityIndicator size="small" color={theme.background} />
              ) : (
                <GeistText weight="600" style={{ color: theme.background, fontSize: 13 }}>
                  Promote
                </GeistText>
              )}
            </TouchableOpacity>
          </View>
        </GeistCard>
      )}

      {/* Live Public Website Banner (Anonymous Access) */}
      {isReady && domainInfo.primaryPublicDomain ? (
        <GeistCard style={{ marginBottom: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <GeistText weight="600" style={{ fontSize: 12, color: theme.textSecondary }}>
                  PUBLIC LIVE DOMAIN
                </GeistText>
                <View style={{ backgroundColor: theme.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <GeistText style={{ fontSize: 10, color: theme.text, fontWeight: '600' }}>
                    ANONYMOUS
                  </GeistText>
                </View>
              </View>
              <GeistText mono weight="bold" numberOfLines={1} style={{ fontSize: 15, color: theme.text }}>
                https://{domainInfo.primaryPublicDomain}
              </GeistText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={handleCopyUrl}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.smallActionBtn, { borderColor: theme.border, backgroundColor: theme.card, height: 32, paddingHorizontal: 10, justifyContent: 'center' }]}
              >
                <Copy size={14} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleVisit(domainInfo.primaryPublicDomain)}
                activeOpacity={0.7}
                style={[styles.visitLiveBtn, { backgroundColor: theme.text, height: 32, paddingHorizontal: 14, justifyContent: 'center' }]}
              >
                <GeistText weight="600" style={{ color: theme.background, fontSize: 13 }}>
                  Visit Site
                </GeistText>
                <ExternalLink size={14} color={theme.background} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        </GeistCard>
      ) : null}

      {/* Live Build Progress Card */}
      <GeistCard style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <View
          style={{
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Terminal size={18} color={theme.text} />
            <GeistText weight="600" style={{ fontSize: 17 }}>
              Build Timeline
            </GeistText>
          </View>
          {isFailed ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <XCircle size={15} color={theme.error} />
              <GeistText mono style={{ fontSize: 12, color: theme.error, fontWeight: '600' }}>
                Build Failed
              </GeistText>
            </View>
          ) : !isDone ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ActivityIndicator size="small" color={theme.textSecondary} />
              <GeistText mono style={{ fontSize: 12, color: theme.textSecondary }}>
                Building...
              </GeistText>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color={theme.textSecondary} />
              <GeistText mono style={{ fontSize: 12, color: theme.textSecondary }}>
                Completed
              </GeistText>
            </View>
          )}
        </View>

        <View style={styles.timeline}>
          {/* Step 0: Setup */}
          <View style={[styles.timelineItem, { borderLeftColor: theme.border }]}>
            {progressStep > 0 ? (
              <CheckCircle2 color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : isFailed ? (
              <XCircle color={theme.error} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <ActivityIndicator size="small" color={theme.textSecondary} style={[styles.icon, { backgroundColor: theme.card }]} />
            )}
            <View style={styles.timelineContent}>
              <View style={styles.timelineRow}>
                <GeistText weight={progressStep === 0 ? '600' : 'normal'} style={progressStep === 0 ? { color: theme.text } : { color: theme.textSecondary }}>System Setup & Configuration</GeistText>
                {progressStep > 0 && <GeistText secondary mono style={{ fontSize: 12 }}>1s</GeistText>}
              </View>
            </View>
          </View>

          {/* Step 1: Cloning */}
          <View style={[styles.timelineItem, { borderLeftColor: theme.border }]}>
            {progressStep > 1 ? (
              <CheckCircle2 color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep === 1 && !isFailed ? (
              <ActivityIndicator size="small" color={theme.textSecondary} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : isFailed && progressStep === 1 ? (
              <XCircle color={theme.error} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <Circle color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card, opacity: 0.3 }]} />
            )}
            <View style={[styles.timelineContent, progressStep < 1 && { opacity: 0.5 }]}>
              <View style={styles.timelineRow}>
                <GeistText weight={progressStep === 1 ? '600' : 'normal'} style={progressStep === 1 ? { color: theme.text } : { color: theme.textSecondary }}>Cloning Repository</GeistText>
                {progressStep > 1 && <GeistText secondary mono style={{ fontSize: 12 }}>2s</GeistText>}
              </View>
            </View>
          </View>

          {/* Step 2: Building */}
          <View style={[styles.timelineItem, { borderLeftColor: theme.border }]}>
            {isFailed ? (
              <XCircle color={theme.error} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep > 2 ? (
              <CheckCircle2 color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep === 2 ? (
              <ActivityIndicator size="small" color={theme.textSecondary} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <Circle color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card, opacity: 0.3 }]} />
            )}
            <View style={[styles.timelineContent, progressStep < 2 && !isFailed && { opacity: 0.5 }]}>
              <View style={styles.timelineRow}>
                <GeistText weight={progressStep === 2 ? '600' : 'normal'} style={isFailed ? { color: theme.error } : progressStep === 2 ? { color: theme.text } : { color: theme.textSecondary }}>
                  {isFailed ? 'Building & Optimization (Failed)' : 'Building & Optimization'}
                </GeistText>
                {isFailed ? (
                  <GeistText mono style={{ fontSize: 12, color: theme.error }}>Failed</GeistText>
                ) : progressStep > 2 ? (
                  <GeistText secondary mono style={{ fontSize: 12 }}>3s</GeistText>
                ) : null}
              </View>
            </View>
          </View>

          {/* Step 3: Assigning Domains */}
          <View style={[styles.timelineItem, { borderLeftColor: theme.border }]}>
            {isFailed ? (
              <Circle color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card, opacity: 0.3 }]} />
            ) : progressStep > 3 ? (
              <CheckCircle2 color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep === 3 ? (
              <ActivityIndicator size="small" color={theme.textSecondary} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <Circle color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card, opacity: 0.3 }]} />
            )}
            <View style={[styles.timelineContent, (progressStep < 3 || isFailed) && { opacity: 0.5 }]}>
              <View style={styles.timelineRow}>
                <GeistText weight={progressStep === 3 ? '600' : 'normal'} style={progressStep === 3 ? { color: theme.text } : { color: theme.textSecondary }}>Assigning Domains & SSL</GeistText>
                {progressStep > 3 && !isFailed && <GeistText secondary mono style={{ fontSize: 12 }}>1s</GeistText>}
              </View>
            </View>
          </View>

          {/* Step 4: Ready */}
          <View style={[styles.timelineItem, { borderLeftColor: 'transparent', paddingBottom: 0 }]}>
            {isFailed ? (
              <XCircle color={theme.error} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep >= 4 ? (
              <CheckCircle2 color={theme.text} size={22} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <Circle color={theme.textSecondary} size={22} style={[styles.icon, { backgroundColor: theme.card, opacity: 0.3 }]} />
            )}
            <View style={[styles.timelineContent, (progressStep < 4 || isFailed) && { opacity: 0.5 }]}>
              <View style={styles.timelineRow}>
                <GeistText weight={isReady ? '600' : 'normal'} style={isFailed ? { color: theme.error } : isReady ? { color: theme.text } : { color: theme.textSecondary }}>
                  {isFailed ? 'Deployment Failed' : 'Deployment Live & Ready'}
                </GeistText>
                {isReady && <GeistText secondary mono style={{ fontSize: 12 }}>Active</GeistText>}
                {isFailed && <GeistText mono style={{ fontSize: 12, color: theme.error }}>Error</GeistText>}
              </View>
              {isReady && (
                <View style={{ marginTop: 12, gap: 8 }}>
                  <View style={styles.infoRow}>
                    <GeistText secondary style={styles.infoLabel}>Framework</GeistText>
                    <GeistText style={[styles.infoValue, { textTransform: 'capitalize' }]}>{(deployment as any)?.project?.framework || 'N/A'}</GeistText>
                  </View>
                  <View style={styles.infoRow}>
                    <GeistText secondary style={styles.infoLabel}>Created By</GeistText>
                    <GeistText style={styles.infoValue}>{(deployment as any)?.creator?.username || (deployment as any)?.meta?.githubCommitAuthorName || 'Unknown'}</GeistText>
                  </View>
                  <View style={styles.infoRow}>
                    <GeistText secondary style={styles.infoLabel}>Created</GeistText>
                    <GeistText style={styles.infoValue}>{deployment?.createdAt ? new Date(deployment.createdAt).toLocaleString() : 'N/A'}</GeistText>
                  </View>
                  <View style={styles.infoRow}>
                    <GeistText secondary style={styles.infoLabel}>Branch</GeistText>
                    <GeistText style={styles.infoValue}>{deployment?.meta?.githubCommitRef || 'main'}</GeistText>
                  </View>
                  <View style={styles.infoRow}>
                    <GeistText secondary style={styles.infoLabel}>Commit Message</GeistText>
                    <GeistText style={styles.infoValue} numberOfLines={2}>{deployment?.meta?.githubCommitMessage || 'N/A'}</GeistText>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </GeistCard>

      {/* Deployment Metadata & Domains Card */}
      <GeistCard style={{ marginBottom: 24, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <GeistText weight="600" style={{ fontSize: 16 }}>
            Source & Domains
          </GeistText>

          {!isFailed && (
            <TouchableOpacity
              style={[styles.smallActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setAliasModalOpen(true)}
            >
              <Plus size={13} color={theme.text} style={{ marginRight: 4 }} />
              <GeistText weight="500" style={{ fontSize: 12 }}>
                Add Domain Alias
              </GeistText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaRow}>
            <GeistText secondary style={styles.metaLabel}>Commit</GeistText>
            <View style={{ flex: 1 }}>
              <GeistText weight="500" numberOfLines={1}>
                {deployment?.meta?.githubCommitMessage || 'Initial Deployment'}
              </GeistText>
              <GeistText mono secondary style={{ fontSize: 12, marginTop: 2 }}>
                {deployment?.meta?.githubCommitSha || (id as string).substring(0, 7)}
              </GeistText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.metaRow}>
            <GeistText secondary style={styles.metaLabel}>Created</GeistText>
            <GeistText secondary mono style={{ fontSize: 13 }}>
              {createdDateStr}
            </GeistText>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.metaRow}>
            <GeistText secondary style={styles.metaLabel}>Deployment</GeistText>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => handleVisit(domainInfo.deploymentUrl)}
                activeOpacity={0.7}
                style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}
              >
                <GeistText 
                  mono 
                  numberOfLines={1} 
                  ellipsizeMode="middle"
                  style={{ color: theme.text, fontSize: 13, marginRight: 6, textAlign: 'right', flexShrink: 1 }}
                >
                  {domainInfo.deploymentUrl}
                </GeistText>
                <ExternalLink size={13} color={theme.textSecondary} style={{ flexShrink: 0 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await Clipboard.setStringAsync(`https://${domainInfo.deploymentUrl}`);
                  showToast('Deployment URL copied to clipboard');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ paddingTop: 3 }}
              >
                <Copy size={13} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Assigned Public Domains */}
          {domainInfo.allDomains && domainInfo.allDomains.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={[styles.metaRow, { flexDirection: 'column', gap: 8 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <GeistText secondary style={styles.metaLabel}>
                    Domains ({domainInfo.allDomains.length})
                  </GeistText>
                  <GeistText secondary style={{ fontSize: 11 }}>
                    Accessible by anonymous visitors
                  </GeistText>
                </View>
                <View style={{ width: '100%', gap: 8 }}>
                  {domainInfo.allDomains.map((alias) => (
                    <View
                      key={alias}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        borderWidth: 1,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleVisit(alias)}
                        activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}
                      >
                        <Globe size={13} color={theme.textSecondary} style={{ marginRight: 8 }} />
                        <GeistText mono numberOfLines={1} style={{ fontSize: 13, color: theme.text, flex: 1, fontWeight: '500' }}>
                          {alias}
                        </GeistText>
                        <ExternalLink size={13} color={theme.textSecondary} style={{ marginLeft: 6 }} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={async () => {
                          await Clipboard.setStringAsync(`https://${alias}`);
                          showToast('Domain copied to clipboard');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ padding: 4 }}
                      >
                        <Copy size={13} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </GeistCard>

      {/* Bottom Actions */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <GeistButton
            title={isFailed ? "Error Logs" : "Build Logs"}
            onPress={() => {
              router.push({
                pathname: `/deployment/${id}/logs` as any,
                params: isFailed ? { error: errorDetails?.message || 'Build Error' } : {},
              });
            }}
            style={{ flex: 1 }}
          />

          {!isFailed && (
            <GeistButton
              title="Visit Site"
              onPress={handleVisit}
              secondary
              style={{ flex: 1 }}
            />
          )}

          {isFailed && (
            <GeistButton
              title="Redeploy"
              onPress={() => {
                setClearCache(true);
                setRedeployModalOpen(true);
              }}
              secondary
              style={{ flex: 1 }}
            />
          )}
        </View>

        {((!isFailed && deployment?.target === 'production') || (!isDone && !isFailed)) && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {!isFailed && deployment?.target === 'production' && (
              <GeistButton
                title={rollingBack ? "Rolling Back..." : "Rollback Traffic"}
                onPress={handleRollback}
                secondary
                style={{ flex: 1 }}
              />
            )}

            {!isDone && !isFailed && (
              <GeistButton
                title={cancelling ? "Cancelling..." : "Cancel Deployment"}
                onPress={handleCancel}
                secondary
                style={{ flex: 1, borderColor: theme.error, backgroundColor: theme.error + '10' }}
                textStyle={{ color: theme.error }}
              />
            )}
          </View>
        )}
      </View>

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
                Trigger a new build from this exact deployment commit.
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

      {/* Assign Domain Alias Modal */}
      <Modal
        visible={aliasModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !assigningAlias && setAliasModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Globe size={18} color={theme.text} />
                <GeistText weight="600" style={{ fontSize: 16 }}>
                  Assign Domain Alias
                </GeistText>
              </View>
              <TouchableOpacity onPress={() => !assigningAlias && setAliasModalOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <GeistText secondary style={{ fontSize: 13, marginBottom: 16 }}>
                Assign a custom domain or alias directly to this deployment.
              </GeistText>

              <TextInput
                value={newAlias}
                onChangeText={setNewAlias}
                placeholder="e.g. preview-v2.yourdomain.com"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                style={[
                  styles.aliasInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                  onPress={() => setAliasModalOpen(false)}
                  disabled={assigningAlias}
                >
                  <GeistText weight="500" style={{ fontSize: 13 }}>Cancel</GeistText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: theme.text }]}
                  onPress={handleAssignAlias}
                  disabled={assigningAlias || !newAlias.trim()}
                >
                  {assigningAlias ? (
                    <ActivityIndicator size="small" color={theme.background} />
                  ) : (
                    <GeistText weight="600" style={{ color: theme.background, fontSize: 13 }}>
                      Assign Domain
                    </GeistText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 48,
  },
  header: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  failureBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 18,
    marginBottom: 24,
  },
  errorCodePill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  failureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  failureBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  promoteCard: {
    marginBottom: 20,
    padding: 16,
  },
  promoteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  targetBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeline: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingLeft: 36,
  },
  timelineItem: {
    borderLeftWidth: 2,
    paddingLeft: 20,
    paddingBottom: 28,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: -12,
    top: 0,
  },
  timelineContent: {
    flex: 1,
    marginTop: -2,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaGrid: {
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  metaLabel: {
    width: 90,
    fontSize: 13,
  },
  divider: {
    height: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  livePublicBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  visitLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  iconActionBtn: {
    height: 44,
    width: 44,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  aliasInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 13,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  infoLabel: {
    width: 110,
    flexShrink: 0,
  },
  infoValue: {
    flex: 1,
  },
});
