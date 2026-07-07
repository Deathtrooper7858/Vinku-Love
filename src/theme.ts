export const colors = {
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
