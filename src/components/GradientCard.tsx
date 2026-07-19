import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';

interface GradientCardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: string[];
  borderColor?: string;
  titleColor?: string;
}

export function GradientCard({
  title,
  children,
  style,
  gradient,
  borderColor,
  titleColor,
}: GradientCardProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark' || mode === 'system';

  const defaultGradient = isDark
    ? ['#1E1B3A', '#16132E']
    : ['#FFFFFF', '#F5EEFF'];

  const resolvedGradient = gradient ?? defaultGradient;
  const resolvedBorder = borderColor ?? (isDark ? '#3A3060' : '#E8DAFB');

  return (
    <LinearGradient
      colors={resolvedGradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor: resolvedBorder }, style]}
    >
      {title && (
        <Text
          style={[
            styles.title,
            { color: titleColor ?? colors.inkSoft },
          ]}
        >
          {title}
        </Text>
      )}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing(3),
  },
});
