import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GeistText, GeistCard, StatusBadge, useTheme } from '../../../components/GeistUI';
import { GitCommit, GitPullRequest } from 'lucide-react-native';
import { vercel } from '../../../api/vercel';

export default function PreviewsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();

  const [previews, setPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreviews() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
        const result = await vercel.deployments.getDeployments({ projectId: id as string, target: 'preview' });
        setPreviews((result as any)?.deployments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPreviews();
  }, [id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
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
          previews.map((preview, idx) => {
            const status = preview.readyState === 'READY' ? 'Ready' : (preview.readyState === 'ERROR' ? 'Failed' : 'Building');
            const timeAgo = Math.round((Date.now() - preview.createdAt) / 1000 / 60);
            const timeStr = timeAgo < 60 ? `${timeAgo}m` : `${Math.round(timeAgo/60)}h`;

            return (
              <GeistCard key={preview.uid} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <GitCommit color={theme.text} size={14} style={{ marginRight: 6 }} />
                    <GeistText weight="500">{preview.meta?.githubCommitRef || 'N/A'}</GeistText>
                  </View>
                  <StatusBadge status={status} />
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <GitPullRequest color={theme.textSecondary} size={12} style={{ marginRight: 4 }} />
                    <GeistText secondary mono style={{ fontSize: 12 }}>PR {preview.meta?.githubPrId || 'N/A'}</GeistText>
                    <GeistText secondary style={{ marginHorizontal: 6 }}>·</GeistText>
                    <GeistText secondary style={{ fontSize: 13 }}>{timeStr} ago</GeistText>
                  </View>
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
  }
});
