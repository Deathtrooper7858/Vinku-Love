import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from './Card';
import { radius, spacing, GRADIENTS } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

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
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <Card title="Estado de ánimo" style={{ flex: 1 }}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.who}>Tú</Text>
          <Animated.View key={myMood} entering={FadeIn.springify()} layout={Layout.springify()}>
            <Text style={styles.emoji}>{myMood ?? '😐'}</Text>
          </Animated.View>
        </View>
        <View style={styles.col}>
          <Text style={styles.who}>Pareja</Text>
          <Animated.View key={partnerMood} entering={FadeIn.springify()} layout={Layout.springify()}>
            <Text style={styles.emoji}>{partnerMood ?? '😐'}</Text>
          </Animated.View>
        </View>
      </View>
      <View style={styles.picker}>
        {MOODS.map((m) => {
          const isSelected = myMood === m;
          return (
            <Pressable key={m} onPress={() => onPick(m)}>
              <LinearGradient
                colors={isSelected ? GRADIENTS.gold : [colors.surfaceAlt, colors.surfaceAlt]}
                style={[styles.moodBtn, isSelected && styles.moodBtnSelected]}
              >
                <Text style={{ fontSize: 16 }}>{m}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  col: { alignItems: 'center' },
  who: { fontSize: 12, fontWeight: '800', color: colors.inkSoft, marginBottom: spacing(2), textTransform: 'uppercase', letterSpacing: 1 },
  emoji: { fontSize: 36, textShadowColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 8 },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing(4),
  },
  moodBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  moodBtnSelected: {
    borderColor: 'transparent',
    transform: [{ scale: 1.1 }],
  },
});
