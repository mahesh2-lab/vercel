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
  formGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: scale(16),
  },
  formCol: {
    flex: 1,
  },
  input: {
    height: verticalScale(40),
    borderWidth: 1,
    borderRadius: scale(6),
    paddingHorizontal: scale(12),
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(6),
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: 1,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
  },
  actionIconBtn: {
    padding: scale(6),
    borderRadius: scale(4),
  }
});
