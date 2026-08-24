import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GitCommit, GitPullRequest, Rocket, ExternalLink } from 'lucide-react-native';
import { vercel } from '../../../api/vercel';
import { GeistCard, GeistText, StatusBadge, useTheme } from '../../../components/GeistUI';
import { Toast, ToastType } from '../../../components/Toast';
import { useUserContext } from '../../../context/UserContext';
import { getCachedVercelToken } from '../../../lib/vercel-token';

export default function PreviewsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  const [previews, setPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    async function fetchPreviews() {
      try {
        if (!getCachedVercelToken()) return;
        const result = await vercel.deployments.getDeployments({ projectId: id as string, target: 'preview' });
        const list = (result as any)?.deployments || [];
        const now = Date.now();
        const formatted = list.map((preview: any) => {
          const status = preview.readyState === 'READY' ? 'Ready' : (preview.readyState === 'ERROR' ? 'Failed' : 'Building');
          const timeAgo = Math.round((now - (preview.createdAt || now)) / 1000 / 60);
          const timeStr = timeAgo < 60 ? `${timeAgo}m` : `${Math.round(timeAgo / 60)}h`;
          return {
            ...preview,
            computedStatus: status,
            computedTimeStr: timeStr,
          };
        });
        setPreviews(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPreviews();
  }, [id]);

  const handlePromote = (preview: any) => {
    Alert.alert(
      'Promote Preview to Production',
      `Promote ${preview.meta?.githubCommitRef || 'preview'} (${preview.url || preview.uid}) to Production?`,
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
                await fetch(`https://api.vercel.com/v10/projects/${id}/promote/${preview.uid || preview.id}${queryParam}`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
              }

              showToast('Preview Promoted to Production!', 'success');
              setPreviews((prev) => prev.filter((p) => (p.uid || p.id) !== (preview.uid || preview.id)));
            } catch (err: any) {
              showToast(`Promote failed: ${err.message}`, 'error');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Previews</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>
          Preview deployments are separate from Production.
        </GeistText>
      </View>

      <View style={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.text} style={{ marginTop: 40 }} />
        ) : previews.length === 0 ? (
          <GeistText secondary style={{ textAlign: 'center', marginTop: 40 }}>No preview deployments found.</GeistText>
        ) : (
          previews.map((preview) => {
            const previewId = preview.uid || preview.id;
            return (
              <GeistCard key={previewId} style={styles.card}>
                <TouchableOpacity
                  onPress={() => router.push(`/deployment/${previewId}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
                      <GitCommit color={theme.text} size={14} style={{ marginRight: 6 }} />
                      <GeistText weight="600" style={{ fontSize: 15 }}>
                        {preview.meta?.githubCommitRef || 'N/A'}
                      </GeistText>
                      {preview.url && (
                        <GeistText secondary mono style={{ fontSize: 12, marginLeft: 8 }}>
                          ({preview.url})
                        </GeistText>
                      )}
                    </View>
                    <StatusBadge status={preview.computedStatus} />
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.footerInfo}>
                      <GitPullRequest color={theme.textSecondary} size={12} style={{ marginRight: 4 }} />
                      <GeistText secondary mono style={{ fontSize: 12 }}>PR {preview.meta?.githubPrId || 'N/A'}</GeistText>
                      <GeistText secondary style={{ marginHorizontal: 6 }}>·</GeistText>
                      <GeistText secondary style={{ fontSize: 13 }}>{preview.computedTimeStr} ago</GeistText>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Quick Actions */}
                <View style={[styles.cardActions, { borderTopColor: theme.border + '50' }]}>
                  <TouchableOpacity
                    style={[styles.promoteBtn, { backgroundColor: '#0070F315', borderColor: '#0070F3' }]}
                    onPress={() => handlePromote(preview)}
                  >
                    <Rocket size={12} color="#0070F3" style={{ marginRight: 5 }} />
                    <GeistText weight="600" style={{ color: '#0070F3', fontSize: 12 }}>
                      Promote to Production
                    </GeistText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.linkBtn, { borderColor: theme.border }]}
                    onPress={() => router.push(`/deployment/${previewId}`)}
                  >
                    <ExternalLink size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                    <GeistText secondary style={{ fontSize: 12 }}>
                      Details
                    </GeistText>
                  </TouchableOpacity>
                </View>
              </GeistCard>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  list: {
    gap: 16,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  promoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
});
