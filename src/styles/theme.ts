import { Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const spacing = {
  half: scale(2),
  one: scale(4),
  two: scale(8),
  three: scale(16),
  four: scale(24),
  five: scale(32),
  six: scale(64),
  xs: scale(4),
  sm: scale(8),
  md: scale(14),
  lg: scale(18),
  xl: scale(24),
  xxl: scale(28),
};

export const radii = {
  sm: scale(6),
  md: scale(12),
  lg: scale(16),
  full: 9999,
};

export const typography = {
  sizes: {
    xs: moderateScale(12),
    sm: moderateScale(13),
    md: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(24),
  },
  letterSpacing: {
    tight: -0.2,
    normal: 0.2,
    wide: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

