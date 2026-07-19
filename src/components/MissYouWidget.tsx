import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from './Card';
import { radius, spacing, GRADIENTS } from '../theme';
import { HAPTIC_PATTERNS, HapticPatternKey } from '../lib/haptics';
import { useTheme } from '../context/ThemeProvider';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

export function MissYouWidget({
  total,
  onTap,
  disabled,
}: {
  total: number;
  onTap: (pattern: HapticPatternKey) => void;
  disabled?: boolean;
}) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const [pattern, setPattern] = useState<HapticPatternKey>('soft');
  
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handleTap = () => {
    scale.value = withSequence(withSpring(0.9), withSpring(1.1), withSpring(1));
    onTap(pattern);
  };

  return (
    <Card title="Te extraño" style={{ flex: 1 }}>
      <Text style={styles.count}>{total}</Text>
      <Text style={styles.sub}>veces en total</Text>

      <View style={styles.patternRow}>
        {HAPTIC_PATTERNS.map((p) => {
          const isSelected = pattern === p.key;
          return (
            <Pressable key={p.key} onPress={() => setPattern(p.key)}>
              <LinearGradient
                colors={isSelected ? GRADIENTS.gold : [colors.surfaceAlt, colors.surfaceAlt]}
                style={[styles.patternChip, isSelected && styles.patternChipSelected]}
              >
                <Text style={{ fontSize: 13 }}>{p.emoji}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handleTap}
          disabled={disabled}
          style={({ pressed }) => [
            pressed && { opacity: 0.9 },
            disabled && { opacity: 0.5 },
          ]}
        >
          <LinearGradient
            colors={GRADIENTS.heart}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>💌 Enviar</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Card>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  count: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.coral,
    textAlign: 'center',
    marginTop: spacing(1),
    textShadowColor: isDark ? 'rgba(255, 107, 157, 0.3)' : 'transparent',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  sub: {
    fontSize: 12,
    color: colors.inkSoft,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing(4),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing(4),
  },
  patternChip: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  patternChipSelected: {
    borderColor: 'transparent',
    transform: [{ scale: 1.1 }],
  },
  btn: {
    borderRadius: radius.pill,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
