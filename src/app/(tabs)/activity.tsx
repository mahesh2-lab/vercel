import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GeistText, GeistCard, StatusBadge, useTheme, GeistButton } from '../../components/GeistUI';
import { vercel } from '../../api/vercel';

export default function ActivityScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeployments() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
        const result = await vercel.deployments.getDeployments({});
        setDeployments((result as any)?.deployments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDeployments();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Deployments</GeistText>
      </View>

      <View style={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.text} style={{ marginTop: 40 }} />
        ) : deployments.length === 0 ? (
          <GeistText secondary style={{ textAlign: 'center', marginTop: 40 }}>No deployments found.</GeistText>
        ) : (
          deployments.map((dep) => {
            const status = dep.readyState === 'READY' ? 'Ready' : (dep.readyState === 'ERROR' ? 'Failed' : 'Building');
            const timeAgo = Math.round((Date.now() - dep.createdAt) / 1000 / 60);
            const timeStr = timeAgo < 60 ? `${timeAgo}m` : `${Math.round(timeAgo/60)}h`;
            
            return (
              <GeistCard
                key={dep.uid}
                style={styles.card}
                onPress={() => router.push(`/deployment/${dep.uid}/logs`)}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <GeistText weight="600">{dep.name}</GeistText>
                    <GeistText secondary style={{ marginHorizontal: 6 }}>/</GeistText>
                    <GeistText mono>{dep.uid.substring(0, 7)}</GeistText>
                  </View>
                  <StatusBadge status={status} />
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <GeistText secondary mono style={{ fontSize: 12 }}>{dep.target || 'production'}</GeistText>
                    <GeistText secondary style={{ marginHorizontal: 6 }}>·</GeistText>
                    <GeistText secondary mono style={{ fontSize: 12 }}>{dep.meta?.githubCommitRef || 'main'}</GeistText>
                    <GeistText secondary style={{ marginHorizontal: 6 }}>·</GeistText>
                    <GeistText secondary mono style={{ fontSize: 12 }}>{timeStr}</GeistText>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
