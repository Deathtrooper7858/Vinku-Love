import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors, radius, spacing } from '../theme';

const MOODS = ['🥰', '😊', '😐', '😔', '😴', '😤', '🥳'];

export function MoodWidget({
  myMood,
  partnerMood,
  onPick,
}: {
  myMood: string | null;
  partnerMood: string | null;
  onPick: (emoji: string) => void;
}) {
  return (
    <Card title="Estado de ánimo" style={{ flex: 1 }}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.who}>Tú</Text>
          <Text style={styles.emoji}>{myMood ?? '😐'}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.who}>Pareja</Text>
          <Text style={styles.emoji}>{partnerMood ?? '😐'}</Text>
        </View>
      </View>
      <View style={styles.picker}>
        {MOODS.map((m) => (
          <Pressable
            key={m}
            onPress={() => onPick(m)}
            style={[styles.moodBtn, myMood === m && styles.moodBtnSelected]}
          >
            <Text style={{ fontSize: 16 }}>{m}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  col: { alignItems: 'center' },
  who: { fontSize: 11, fontWeight: '800', color: colors.inkSoft, marginBottom: spacing(1.5) },
  emoji: { fontSize: 30 },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing(3),
  },
  moodBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBtnSelected: {
    backgroundColor: colors.gold,
  },
});
