import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    padding: scale(16),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(24),
  },
});
