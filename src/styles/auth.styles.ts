import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../styles/theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: "space-between",
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    marginTop: verticalScale(-32),
  },
  wordmark: {
    fontSize: moderateScale(14),
    letterSpacing: 4,
    opacity: 0.9,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  input: {
    height: verticalScale(52),
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: scale(16),
    fontSize: moderateScale(16),
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(9),
    paddingVertical: scale(17),
    borderRadius: radii.md,
    minHeight: verticalScale(52),
  },
  helperText: {
    textAlign: "center",
    fontSize: 12.5,
    letterSpacing: 0.2,
    opacity: 0.4,
    marginTop: verticalScale(2),
  },
});

