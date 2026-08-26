import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    height: verticalScale(44),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: moderateScale(15),
  },
});

