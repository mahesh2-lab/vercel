import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GeistText, GeistCard, StatusBadge, useTheme, GeistInput } from '../../../components/GeistUI';
import { ArrowLeft, Search, GitCommit, Tag } from 'lucide-react-native';
import { vercel } from '../../../api/vercel';

export default function ProjectDeploymentsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeployments() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
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

  const getStatus = (dep: any) => {
    const state = dep.readyState || 'READY';
    if (state === 'READY') return 'Ready';
    if (state === 'ERROR') return 'Failed';
    return 'Building';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Deployments</GeistText>
      </View>

      <GeistCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center' }}>
          <Search size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
          <GeistInput 
            placeholder="Search deployments..."
            style={{ borderWidth: 0, backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 0, flex: 1, fontSize: 16 }}
          />
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : deployments.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <GeistText secondary>No deployments found.</GeistText>
          </View>
        ) : (
          <View>
            {deployments.map((dep: any, index: number) => (
              <TouchableOpacity 
                key={dep.uid || dep.id}
                style={[styles.deploymentRow, { borderBottomWidth: index === deployments.length - 1 ? 0 : 1, borderBottomColor: theme.border }]}
                onPress={() => router.push(`/deployment/${dep.uid || dep.id}`)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1, marginRight: 12 }}>
                    <GeistText weight="500" style={{ fontSize: 16, marginRight: 12 }}>{dep.url || 'No URL'}</GeistText>
                    <View style={[styles.envBadge, { backgroundColor: dep.target === 'production' ? (theme.success + '26') : theme.surface, borderColor: dep.target === 'production' ? (theme.success + '40') : theme.border }]}>
                      <GeistText style={{ fontSize: 12, color: dep.target === 'production' ? theme.success : theme.text }}>
                        {dep.target === 'production' ? 'Production' : 'Preview'}
                      </GeistText>
                    </View>
                  </View>
                  <StatusBadge status={getStatus(dep)} />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <GitCommit color={theme.textSecondary} size={14} style={{ marginRight: 6 }} />
                    <GeistText mono secondary style={{ fontSize: 13 }}>
                      {dep.meta?.githubCommitRef || 'main'}
                    </GeistText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Tag color={theme.textSecondary} size={14} style={{ marginRight: 6 }} />
                    <GeistText mono secondary style={{ fontSize: 13 }}>
                      {dep.meta?.githubCommitSha?.substring(0, 7) || dep.uid?.substring(0, 7) || 'N/A'}
                    </GeistText>
                  </View>
                  <GeistText mono secondary style={{ fontSize: 13 }}>
                    {dep.createdAt ? new Date(dep.createdAt).toLocaleDateString() : 'Just now'}
                  </GeistText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </GeistCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  deploymentRow: {
    padding: 24,
  },
  envBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  }
});
