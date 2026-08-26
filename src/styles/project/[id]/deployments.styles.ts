import { StyleSheet } from 'react-native';
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
    marginBottom: verticalScale(24),
  },
  deploymentRow: {
    padding: scale(20),
  },
  envBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: radii.md,
    borderWidth: 1,
  },
  rowActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(6),
    borderWidth: 1,
  },
});

