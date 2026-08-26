import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../styles/theme';

export const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeSnippet: {
    borderRadius: spacing.two,
    paddingVertical: spacing.half,
    paddingHorizontal: spacing.two,
  },
});

