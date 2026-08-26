import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    padding: scale(16),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(24),
  },
  list: {
    gap: scale(16),
  },
  card: {
    padding: scale(16),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: scale(10),
    marginTop: verticalScale(14),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
  },
  promoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(6),
    borderWidth: 1,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(6),
    borderWidth: 1,
  },
});

