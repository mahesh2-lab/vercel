import { Platform } from 'react-native';

export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
};

export const radii = {
  sm: 6,
  md: 12,
  lg: 16,
  full: 9999,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 24,
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
