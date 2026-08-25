import React, { useState, useEffect } from 'react';
import { getCachedVercelToken } from '@/lib/vercel-token';
import {
  ScrollView,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, AlertTriangle, X } from 'lucide-react-native';
import { GeistText, useTheme, GeistButton, GeistSpinner } from '../../../components/GeistUI';
import { Toast, ToastType } from '../../../components/Toast';
import { vercel } from '../../../api/vercel';
import { useUserContext } from '../../../context/UserContext';

export default function ProjectSettingsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  const projectName = project?.name || (id as string);

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!getCachedVercelToken()) return;
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

  const executeDeleteProject = async () => {
    setDeleting(true);
    const token = getCachedVercelToken();

    if (!token) {
      setDeleting(false);
      showToast('Missing VERCEL_TOKEN to delete project', 'error');
      return;
    }

    try {
      const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
      const { deleteProject } = require('../../../lib/vercel-api');
      const res = await deleteProject(projectName, queryParam);

      if (!res.ok && res.status !== 204) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || errorData?.message || `Failed to delete (${res.status})`;
        throw new Error(msg);
      }

      showToast(`Project "${projectName}" was deleted`, 'success');
      setDeleteModalVisible(false);

      setTimeout(() => {
        setDeleting(false);
        router.replace('/');
      }, 500);
    } catch (err: any) {
      console.error('Delete project error:', err);
      setDeleting(false);
      showToast(`Delete failed: ${err.message || 'Unknown error'}`, 'error');
      Alert.alert('Delete Failed', err.message || 'Could not delete project from Vercel.');
    }
  };

  const handleDeletePress = () => {
    setConfirmName('');
    setDeleteModalVisible(true);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

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
          <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push(`/project/${id}/settings/git`)}>
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
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <GeistSpinner size={36} color={theme.text} />
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <GeistText weight="600" style={{ fontSize: 18, marginBottom: 4 }}>Project Name</GeistText>
                <GeistText secondary style={{ marginBottom: 16 }}>Used to identify your Project on the Dashboard.</GeistText>
                
                <View style={{ flexDirection: 'row', gap: 12, maxWidth: 400 }}>
                  <TextInput 
                    value={projectName}
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
                    onPress={handleDeletePress}
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color={theme.error} />
                <GeistText weight="600" style={{ fontSize: 16 }}>
                  Delete Project
                </GeistText>
              </View>
              <TouchableOpacity onPress={() => !deleting && setDeleteModalVisible(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <GeistText style={{ fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
                Are you sure you want to delete <GeistText weight="bold">{projectName}</GeistText>? This will permanently delete all deployments, domains, and environment variables.
              </GeistText>

              <GeistText secondary style={{ fontSize: 13, marginBottom: 8 }}>
                To confirm, type <GeistText weight="600" mono>{projectName}</GeistText> in the box below:
              </GeistText>

              <TextInput
                value={confirmName}
                onChangeText={setConfirmName}
                placeholder={projectName}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                style={[
                  styles.confirmInput,
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
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={deleting}
                >
                  <GeistText weight="500" style={{ fontSize: 14 }}>Cancel</GeistText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalDeleteBtn,
                    {
                      backgroundColor: theme.error,
                      opacity: confirmName.trim() === projectName && !deleting ? 1 : 0.5,
                    },
                  ]}
                  onPress={executeDeleteProject}
                  disabled={confirmName.trim() !== projectName || deleting}
                >
                  {deleting ? (
                    <GeistSpinner size="small" color="#fff" />
                  ) : (
                    <GeistText weight="600" style={{ color: '#fff', fontSize: 14 }}>
                      Delete
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
    maxWidth: 480,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  confirmInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalDeleteBtn: {
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
});
