import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GeistText, GeistCard, StatusBadge, useTheme, GeistButton } from '../../components/GeistUI';
import { GitCommit, Folder, Globe } from 'lucide-react-native';
import { vercel } from '../../api/vercel';

export default function ProjectsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) {
          setError('No EXPO_PUBLIC_VERCEL_TOKEN found in .env');
          setLoading(false);
          return;
        }
        
        // Vercel SDK getProjects
        const result = await vercel.projects.getProjects({
          limit: '100',
        });
        // Depending on SDK version, it might be result.projects or result.object.projects
        const list = (result as any)?.projects || (result as any)?.object?.projects || (result as any)?.result?.projects || [];
        setProjects(list);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const getStatus = (proj: any) => {
    const state = proj.latestDeployments?.[0]?.readyState || 'READY';
    if (state === 'READY') return 'Ready';
    if (state === 'ERROR') return 'Failed';
    return 'Building';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <GeistText weight="bold" style={{ fontSize: 28 }}>Projects</GeistText>
        </View>
        <GeistButton title="Add New..." onPress={() => router.push('/deploy')} />
      </View>

      {error ? (
        <View style={{ padding: 24, backgroundColor: theme.surface, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}>
          <GeistText style={{ color: theme.error }}>{error}</GeistText>
        </View>
      ) : loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      ) : projects.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <GeistText secondary>No projects found.</GeistText>
        </View>
      ) : (
        <View style={styles.projectList}>
          {projects.map((project: any) => (
            <GeistCard
              key={project.id || project.name}
              style={styles.card}
              onPress={() => router.push(`/project/${project.id || project.name}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Folder size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                  <GeistText weight="bold" style={{ fontSize: 18 }}>{project.name}</GeistText>
                </View>
                <StatusBadge status={getStatus(project)} />
              </View>
              <GeistText secondary style={styles.description} numberOfLines={2}>
                {project.framework ? `Framework: ${project.framework}` : 'Vercel Project'}
              </GeistText>
              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <GitCommit size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />
                  <GeistText secondary mono style={{ fontSize: 13 }}>
                    {project.targets?.production?.meta?.githubCommitRef || 'main'}
                  </GeistText>
                  <GeistText secondary style={{ marginHorizontal: 6 }}>·</GeistText>
                  <GeistText secondary mono style={{ fontSize: 13 }}>
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Just now'}
                  </GeistText>
                </View>
              </View>
            </GeistCard>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  projectList: {
    gap: 16,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
  },
  card: {
    padding: 24,
    flex: Platform.OS === 'web' ? 1 : undefined,
    minWidth: Platform.OS === 'web' ? 300 : '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    marginBottom: 24,
    lineHeight: 20,
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
