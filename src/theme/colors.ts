export const themes = {
  light: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    card: '#FFFFFF',
    text: '#171717',
    textSecondary: '#666666',
    border: '#EBEBEB',
    primary: '#171717',
    primaryText: '#FFFFFF',
    success: '#0070F3',
    error: '#EF4444',
    info: '#3B82F6',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    background: '#000000',
    surface: '#0A0A0A',
    card: '#000000',
    text: '#EDEDED',
    textSecondary: '#A1A1A1',
    border: '#2E2E2E',
    primary: '#EDEDED',
    primaryText: '#000000',
    success: '#3291FF',
    error: '#EF4444',
    info: '#3B82F6',
    shadow: 'rgba(255, 255, 255, 0.05)',
  }
};

export type Theme = typeof themes.light;
