import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../styles/theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.five,
    alignItems: 'center',
    gap: spacing.two,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});

