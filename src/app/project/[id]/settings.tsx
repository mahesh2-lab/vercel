import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert, TouchableOpacity, Platform, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GeistText, useTheme, GeistButton } from '../../../components/GeistUI';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { vercel } from '../../../api/vercel';

export default function ProjectSettingsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
        const result = await vercel.projects.getProject({ idOrName: id as string });
        setProject((result as any)?.project || (result as any)?.object || result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Settings</GeistText>
      </View>

      <View style={styles.grid}>
        <ScrollView 
          horizontal={Platform.OS !== 'web'} 
          showsHorizontalScrollIndicator={false}
          style={styles.sidebar}
          contentContainerStyle={styles.sidebarContent}
        >
          <TouchableOpacity style={[styles.sidebarItem, { backgroundColor: theme.surface }]}>
            <GeistText weight="500" style={{ color: theme.text }}>General</GeistText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <GeistText weight="500" secondary>Git</GeistText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <GeistText weight="500" secondary>Build & Development</GeistText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push(`/project/${id}/env`)}>
            <GeistText weight="500" secondary>Environment Variables</GeistText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push(`/project/${id}/previews`)}>
            <GeistText weight="500" secondary>Preview Deployments</GeistText>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.text} style={{ marginTop: 40 }} />
          ) : (
            <>
              <View style={styles.section}>
                <GeistText weight="600" style={{ fontSize: 18, marginBottom: 4 }}>Project Name</GeistText>
                <GeistText secondary style={{ marginBottom: 16 }}>Used to identify your Project on the Dashboard.</GeistText>
                
                <View style={{ flexDirection: 'row', gap: 12, maxWidth: 400 }}>
                  <TextInput 
                    value={project?.name || (id as string)}
                    editable={false}
                    style={[styles.input, { borderColor: theme.border, color: theme.text, flex: 1, paddingHorizontal: 12, opacity: 0.7 }]}
                  />
                  <GeistButton title="Save" onPress={() => {}} style={{ paddingHorizontal: 16 }} />
                </View>
              </View>

              <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 32 }]}>
                <GeistText weight="600" style={{ fontSize: 18, marginBottom: 4 }}>Framework Preset</GeistText>
                <GeistText secondary style={{ marginBottom: 16 }}>Vercel automatically configures the build settings for most frameworks.</GeistText>
                
                <View style={[styles.input, { borderColor: theme.border, maxWidth: 400, justifyContent: 'center', paddingHorizontal: 12, opacity: 0.7 }]}>
                  <GeistText>{project?.framework || 'Other'}</GeistText>
                  {Platform.OS === 'web' && <ChevronDown size={20} color={theme.textSecondary} style={{ position: 'absolute', right: 12 }} />}
                </View>
              </View>

              <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 32 }]}>
                <GeistText weight="600" style={{ color: theme.error, fontSize: 18, marginBottom: 16 }}>Danger Zone</GeistText>
                
                <View style={[styles.dangerBox, { borderColor: theme.error + '80', backgroundColor: theme.error + '0A' }]}>
                  <View style={{ flex: 1, marginRight: 16, marginBottom: Platform.OS === 'web' ? 0 : 16 }}>
                    <GeistText weight="500" style={{ fontSize: 16, marginBottom: 4 }}>Delete Project</GeistText>
                    <GeistText secondary style={{ fontSize: 14 }}>
                      The project will be permanently deleted, including its deployments and domains. This action is irreversible.
                    </GeistText>
                  </View>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => {
                      Alert.alert('Delete Project', `Are you sure you want to delete ${id}? This action is irreversible.`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => router.push('/') },
                      ]);
                    }}
                    style={[styles.deleteButton, { backgroundColor: theme.error }]}
                  >
                    <GeistText weight="500" style={{ color: '#fff' }}>Delete Project</GeistText>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
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
  grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 32,
  },
  sidebar: {
    width: Platform.OS === 'web' ? 240 : '100%',
    flexGrow: 0,
    marginBottom: Platform.OS === 'web' ? 0 : 24,
  },
  sidebarContent: {
    gap: 8,
    paddingBottom: Platform.OS === 'web' ? 0 : 8,
  },
  sidebarItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    gap: 32,
  },
  section: {
    marginBottom: 32,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
  },
  dangerBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    justifyContent: 'space-between',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignSelf: Platform.OS === 'web' ? 'center' : 'flex-start',
  }
});
