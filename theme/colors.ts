export const colors = {
  light: {
    // Primary Colors
    primary: '#14b8a6',
    primaryLight: '#2dd4bf',
    primaryDark: '#0d9488',
    primaryHover: '#0d9488',

    // Secondary Colors
    secondary: '#8e9ba7',
    secondaryLight: '#c2cbd3',
    secondaryDark: '#6a737c',
    secondaryHover: '#8e9ba7',

    // Error Colors
    error: '#dc2626',
    errorLight: '#ef4444',
    errorDark: '#b91c1c',
    errorHover: '#991b1b',

    // Success Colors
    success: '#16a34a',
    successLight: '#22c55e',
    successDark: '#15803d',
    successHover: '#166534',

    // Info Colors
    info: '#0ea5e9',
    infoLight: '#38bdf8',
    infoDark: '#0284c7',
    infoHover: '#0369a1',

    // Warning Colors
    warning: '#ea580c',
    warningLight: '#f97316',
    warningDark: '#c2410c',
    warningDarker: '#9a3412',
    warningHover: '#9a3412',

    // Text Colors
    textPrimary: '#171717',
    textSecondary: '#525252',
    textTertiary: '#737373',
    textInverse: '#ffffff',
    textMuted: '#a3a3a3',

    // Border Colors
    borderPrimary: '#e5e7eb',
    borderSecondary: '#d1d5db',
    borderDark: '#9ca3af',

    // Background Colors
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',
    backgroundDark: '#171717',
    backgroundDarkSecondary: '#262626',
    backgroundDarkTertiary: '#404040',
  },
  dark: {
    // Primary Colors - Dark
    primary: '#14b8a6',
    primaryLight: '#2dd4bf',
    primaryDark: '#0d9488',
    primaryHover: '#0d9488',

    // Secondary Colors - Dark
    secondary: '#c2cbd3',
    secondaryLight: '#e2e6ea',
    secondaryDark: '#8e9ba7',
    secondaryHover: '#c2cbd3',

    // Error Colors - Dark Mode
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
    errorHover: '#f87171',

    // Success Colors - Dark Mode
    success: '#22c55e',
    successLight: '#4ade80',
    successDark: '#16a34a',
    successHover: '#4ade80',

    // Info Colors - Dark Mode
    info: '#38bdf8',
    infoLight: '#7dd3fc',
    infoDark: '#0ea5e9',
    infoHover: '#7dd3fc',

    // Warning Colors - Dark Mode
    warning: '#f97316',
    warningLight: '#fb923c',
    warningDark: '#ea580c',
    warningDarker: '#ea580c',
    warningHover: '#fb923c',

    // Text Colors - Dark Mode
    textPrimary: '#fafafa',
    textSecondary: '#e5e5e5',
    textTertiary: '#d4d4d4',
    textInverse: '#171717',
    textMuted: '#a3a3a3',

    // Border Colors - Dark Mode
    borderPrimary: '#404040',
    borderSecondary: '#525252',
    borderDark: '#737373',

    // Background Colors - Dark Mode
    backgroundPrimary: '#0a0a0a',
    backgroundSecondary: '#171717',
    backgroundTertiary: '#262626',
    backgroundDark: '#0a0a0a',
    backgroundDarkSecondary: '#171717',
    backgroundDarkTertiary: '#262626',
  },
} as const;

export type ThemeColors = typeof colors.light | typeof colors.dark;
export type ThemeMode = 'light' | 'dark';
