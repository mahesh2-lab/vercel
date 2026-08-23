import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput, GeistRow } from '../../../../components/GeistUI';
import { vercel } from '../../../../api/vercel';

export default function ProjectGitScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) {
          setRepo(`${id} (git repository)`);
          return;
        }

        const result = await vercel.projects.getProject({ idOrName: id as string });
        const proj = (result as any)?.project || (result as any)?.object || result;
        const gitRepo = proj?.link?.repo || proj?.link?.org ? `${proj?.link?.org}/${proj?.link?.repo}` : `${proj?.name || id}`;
        setRepo(gitRepo);
      } catch (e) {
        console.warn('Could not fetch project git details:', e);
        setRepo(`${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Git</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Manage Git connection and deploy hooks.</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Connected Repository</GeistText>
        {loading ? (
          <ActivityIndicator size="small" color={theme.text} style={{ marginVertical: 12 }} />
        ) : (
          <GeistInput 
            value={repo}
            onChangeText={setRepo}
            style={{ marginBottom: 16 }}
          />
        )}
        <GeistButton title="Disconnect" secondary onPress={() => {}} />
      </GeistCard>

      <GeistText weight="600" style={{ marginBottom: 12 }}>Deploy Hooks</GeistText>
      <GeistCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 16 }}>
          <GeistRow label="Production Hook" description="Triggers a deployment to main" value="Revoke" />
          <GeistRow label="Staging Hook" description="Triggers a deployment to staging" value="Revoke" />
        </View>
      </GeistCard>
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
});
