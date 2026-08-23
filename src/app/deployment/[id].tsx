import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GeistText, GeistCard, StatusBadge, useTheme, GeistButton } from '../../components/GeistUI';
import { GitCommit, CheckCircle2, Circle } from 'lucide-react-native';
import { vercel } from '../../api/vercel';
import * as Linking from 'expo-linking';

export default function DeploymentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [deployment, setDeployment] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchStatus() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
        const result = await vercel.deployments.getDeployment({ idOrUrl: id as string });
        const data = (result as any)?.deployment || result;
        setDeployment(data);        
        const state = data?.readyState || 'QUEUED';
        if (state === 'READY' || state === 'CANCELED' || state === 'ERROR') {
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
        clearInterval(interval);
      }
    }

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const overallStatus = deployment ? deployment.readyState : 'Loading...';
  const branch = deployment?.meta?.githubCommitRef || '';
  const author = deployment?.meta?.githubCommitAuthorName || '';
  const target = deployment ? (deployment.target === 'production' ? 'Production' : 'Preview') : '';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <GeistText weight="bold" style={{ fontSize: 22, marginBottom: 8 }} numberOfLines={2}>
            {deployment?.url ? deployment.url : (deployment?.name || `Deployment: ${id}`)}
          </GeistText>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            {deployment ? (
              <>
                <GeistText secondary mono style={{ fontSize: 13, textTransform: 'capitalize' }}>{target}</GeistText>
                <GeistText secondary>·</GeistText>
                <GitCommit size={14} color={theme.textSecondary} />
                <GeistText secondary mono style={{ fontSize: 13 }}>{branch}</GeistText>
                <GeistText secondary>·</GeistText>
                <GeistText secondary mono style={{ fontSize: 13 }}>{author}</GeistText>
              </>
            ) : (
              <ActivityIndicator size="small" color={theme.textSecondary} />
            )}
          </View>
        </View>
        <StatusBadge status={overallStatus} />
      </View>

      <GeistCard style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <GeistText weight="600" style={{ fontSize: 18 }}>Deployment Info</GeistText>
        </View>
        
        <View style={{ padding: 24, gap: 16 }}>
          {deployment ? (
            <>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Domain</GeistText>
                <GeistText style={styles.infoValue}>{deployment.url || 'N/A'}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Aliases</GeistText>
                <GeistText style={styles.infoValue}>{deployment.alias?.length > 0 ? deployment.alias.join(', ') : 'None'}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>State</GeistText>
                <GeistText style={styles.infoValue}>{deployment.readyState || 'QUEUED'}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Environment</GeistText>
                <GeistText style={[styles.infoValue, { textTransform: 'capitalize' }]}>{target}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Framework</GeistText>
                <GeistText style={[styles.infoValue, { textTransform: 'capitalize' }]}>{deployment.project?.framework || 'N/A'}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Created By</GeistText>
                <GeistText style={styles.infoValue}>{deployment.creator?.username || author}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Created</GeistText>
                <GeistText style={styles.infoValue}>{deployment.createdAt ? new Date(deployment.createdAt).toLocaleString() : 'N/A'}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Branch</GeistText>
                <GeistText style={styles.infoValue}>{branch}</GeistText>
              </View>
              <View style={styles.infoRow}>
                <GeistText secondary style={styles.infoLabel}>Commit Message</GeistText>
                <GeistText style={styles.infoValue}>{deployment.meta?.githubCommitMessage || 'N/A'}</GeistText>
              </View>
            </>
          ) : (
            <ActivityIndicator size="small" color={theme.text} />
          )}
        </View>
      </GeistCard>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <GeistButton 
          title="View Build Logs" 
          onPress={() => router.push(`/deployment/${id}/logs`)}
          secondary
          style={{ flex: 1 }}
        />
        <GeistButton 
          title="Visit URL" 
          onPress={() => {
            if (deployment?.url) Linking.openURL(`https://${deployment.url}`);
          }}
          secondary
          style={{ flex: 1, opacity: deployment?.url ? 1 : 0.5 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
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
  }
});
