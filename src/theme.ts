export const darkColors = {
  bg: '#0D0D1A',
  bgGradientTop: '#12121F',
  surface: '#1A1A2E',
  surfaceAlt: '#22223A',
  line: '#2E2E4A',
  ink: '#F0ECFF',
  inkSoft: '#9B96C0',
  inkFaint: '#5C587A',
  coral: '#FF6B9D',
  coralDark: '#E0507A',
  teal: '#4ECDC4',
  tealDark: '#35A89F',
  gold: '#FFD166',
  danger: '#FF6B6B',
  purple: '#A78BFA',
  purpleDark: '#7C5CFA',
  pink: '#F472B6',
  blue: '#60A5FA',
};

export const lightColors = {
  bg: '#FDF4FF',
  bgGradientTop: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F5EEFF',
  line: '#E8DAFB',
  ink: '#1A0D2E',
  inkSoft: '#6B4D8A',
  inkFaint: '#9B7AB5',
  coral: '#E0507A',
  coralDark: '#C03060',
  teal: '#2A9C90',
  tealDark: '#1A7A70',
  gold: '#D4A017',
  danger: '#E54B4B',
  purple: '#7C5CFA',
  purpleDark: '#5B3DD4',
  pink: '#D946AB',
  blue: '#3B82F6',
};

// Keep a default export for backwards compatibility during migration
export const colors = darkColors;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const typography = {
  display: {
    fontWeight: '800' as const,
  },
  body: {
    fontWeight: '600' as const,
  },
};

// Gradient presets
export const GRADIENTS = {
  // Backgrounds
  bgDark: ['#0D0D1A', '#1A0D2E', '#0D1A2E'] as [string, string, ...string[]],
  bgLight: ['#FDF4FF', '#F0E6FF', '#E8F4FF'] as [string, string, ...string[]],

  // Cards
  cardPrimary: ['#1E1B3A', '#2A2050'] as [string, string, ...string[]],
  cardLove: ['#2A1A2E', '#1E0A1E'] as [string, string, ...string[]],
  cardChat: ['#0F2027', '#203A43', '#2C5364'] as [string, string, ...string[]],

  // Accents
  coral: ['#FF6B9D', '#FF8C69'] as [string, string, ...string[]],
  teal: ['#4ECDC4', '#44B8B0'] as [string, string, ...string[]],
  gold: ['#FFD166', '#FFAB1A'] as [string, string, ...string[]],
  purple: ['#A78BFA', '#7C5CFA'] as [string, string, ...string[]],
  pink: ['#F472B6', '#EC4899'] as [string, string, ...string[]],
  blue: ['#60A5FA', '#3B82F6'] as [string, string, ...string[]],

  // Streak
  streak: ['#FF6B9D', '#A78BFA', '#4ECDC4'] as [string, string, ...string[]],

  // Status colors
  statusFree: ['#4ADE80', '#22C55E'] as [string, string, ...string[]],
  statusBusy: ['#FB923C', '#F97316'] as [string, string, ...string[]],
  statusSleep: ['#818CF8', '#6366F1'] as [string, string, ...string[]],
  statusSilent: ['#94A3B8', '#64748B'] as [string, string, ...string[]],

  // Heart button
  heart: ['#FF6B9D', '#E0507A'] as [string, string, ...string[]],
};
