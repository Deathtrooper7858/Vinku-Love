import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';

export function Card({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing(4),
      borderWidth: 1,
      borderColor: colors.line,
    },
    title: {
      fontSize: 11,
      fontWeight: '800' as const,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as const,
      color: colors.inkSoft,
      marginBottom: spacing(3),
    },
  }), [colors]);
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}


