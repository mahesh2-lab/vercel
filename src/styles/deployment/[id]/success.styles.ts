import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(24),
  },
  urlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(99),
    borderWidth: 1,
    marginBottom: verticalScale(40),
  },
  previewCard: {
    width: '100%',
    aspectRatio: 16/9,
    borderWidth: 1,
    borderRadius: scale(8),
    overflow: 'hidden',
    marginBottom: verticalScale(40),
  },
  browserBar: {
    height: verticalScale(24),
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    gap: scale(6),
  },
  browserDot: {
    width: scale(8),
    height: verticalScale(8),
    borderRadius: scale(4),
    backgroundColor: '#EAEAEA', // Will be subtle on both themes
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(24),
  },
  mockSkeleton: {
    height: verticalScale(8),
    borderRadius: scale(4),
    marginBottom: verticalScale(8),
  },
  actions: {
    width: '100%',
  }
});
