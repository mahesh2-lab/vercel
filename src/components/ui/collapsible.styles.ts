import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../styles/theme';

export const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.two,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: spacing.four,
    height: spacing.four,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: spacing.three,
    borderRadius: spacing.three,
    marginLeft: spacing.four,
    padding: spacing.four,
  },
});

