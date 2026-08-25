import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../styles/theme';

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
    marginTop: -32,
  },
  wordmark: {
    fontSize: 14,
    letterSpacing: 4,
    opacity: 0.9,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 17,
    borderRadius: radii.md,
    minHeight: 52,
  },
  helperText: {
    textAlign: "center",
    fontSize: 12.5,
    letterSpacing: 0.2,
    opacity: 0.4,
    marginTop: 2,
  },
});
