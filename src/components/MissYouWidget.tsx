import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors, radius, spacing } from '../theme';
import { HAPTIC_PATTERNS, HapticPatternKey } from '../lib/haptics';

export function MissYouWidget({
  total,
  onTap,
  disabled,
}: {
  total: number;
  onTap: (pattern: HapticPatternKey) => void;
  disabled?: boolean;
}) {
  const [pattern, setPattern] = useState<HapticPatternKey>('soft');

  return (
    <Card title="Te extraño" style={{ flex: 1 }}>
      <Text style={styles.count}>{total}</Text>
      <Text style={styles.sub}>veces en total</Text>

      <View style={styles.patternRow}>
        {HAPTIC_PATTERNS.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => setPattern(p.key)}
            style={[styles.patternChip, pattern === p.key && styles.patternChipSelected]}
          >
            <Text style={{ fontSize: 13 }}>{p.emoji}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => onTap(pattern)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          pressed && { transform: [{ scale: 0.96 }] },
          disabled && { opacity: 0.5 },
        ]}
      >
        <Text style={styles.btnText}>💌  Enviar</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.coralDark,
    textAlign: 'center',
    marginTop: spacing(1),
  },
  sub: {
    fontSize: 11,
    color: colors.inkSoft,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing(3),
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing(3),
  },
  patternChip: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternChipSelected: {
    backgroundColor: colors.gold,
  },
  btn: {
    backgroundColor: colors.coral,
    borderRadius: radius.md,
    paddingVertical: spacing(3),
    alignItems: 'center',
  },
  btnText: {
    color: '#1A1210',
    fontWeight: '800',
    fontSize: 14,
  },
});
