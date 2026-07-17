export const darkColors = {
  bg: '#12121A',
  bgGradientTop: '#181822',
  surface: '#1C1C27',
  surfaceAlt: '#22222F',
  line: '#2A2A38',
  ink: '#F4F1FA',
  inkSoft: '#9C97AE',
  inkFaint: '#655F78',
  coral: '#FF8B7E',
  coralDark: '#E86A5C',
  teal: '#3FBFB0',
  tealDark: '#2A9C90',
  gold: '#FFC55C',
  danger: '#FF6B6B',
};

export const lightColors = {
  bg: '#F4F1FA',
  bgGradientTop: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F1FA',
  line: '#E5E0F1',
  ink: '#12121A',
  inkSoft: '#655F78',
  inkFaint: '#9C97AE',
  coral: '#FF6B5B', // Slightly darker for better contrast on light
  coralDark: '#E85A4C',
  teal: '#2A9C90', // Slightly darker for better contrast on light
  tealDark: '#1A7A70',
  gold: '#E5A530',
  danger: '#E54B4B',
};

// Keep a default export for backwards compatibility during migration, but encourage using the theme provider
export const colors = darkColors;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
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
