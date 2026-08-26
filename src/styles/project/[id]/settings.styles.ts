import { StyleSheet, Platform } from "react-native";
import { spacing, radii, typography } from '../../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    padding: scale(24),
    maxWidth: scale(1200),
    width: '100%',
    alignSelf: 'center',
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(32),
  },
  grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: scale(32),
  },
  sidebar: {
    width: Platform.OS === 'web' ? 240 : '100%',
    flexGrow: 0,
    marginBottom: Platform.OS === 'web' ? 0 : 24,
  },
  sidebarContent: {
    gap: scale(8),
    paddingBottom: Platform.OS === 'web' ? 0 : 8,
  },
  sidebarItem: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(6),
  },
  content: {
    flex: 1,
    gap: scale(32),
  },
  section: {
    marginBottom: verticalScale(32),
  },
  input: {
    height: verticalScale(40),
    borderWidth: 1,
    borderRadius: scale(6),
  },
  dangerBox: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: scale(24),
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    justifyContent: 'space-between',
  },
  deleteButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: scale(6),
    alignSelf: Platform.OS === 'web' ? 'center' : 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(16),
  },
  modalCard: {
    width: '100%',
    maxWidth: scale(480),
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: 1,
  },
  confirmInput: {
    height: verticalScale(42),
    borderWidth: 1,
    borderRadius: scale(6),
    paddingHorizontal: scale(12),
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: moderateScale(14),
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: scale(6),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
  },
  modalDeleteBtn: {
    borderRadius: scale(6),
    paddingHorizontal: scale(18),
    paddingVertical: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: scale(80),
  },
});

