import { StyleSheet, Platform } from "react-native";
import { spacing, radii, typography } from '../../../styles/theme';

export const styles = StyleSheet.create({
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
    borderRadius: radii.md,
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
    borderRadius: radii.md,
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
