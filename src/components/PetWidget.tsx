import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { Pet, stageForXp } from './Pet';
import { radius, spacing } from '../theme';
import { accessoryEmoji } from '../data/accessories';
import { useTheme } from '../context/ThemeProvider';

export function PetWidget({ xp, equippedAccessory }: { xp: number; equippedAccessory?: string | null }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const stage = stageForXp(xp);
  const pct =
    stage.key === 'adult'
      ? 100
      : Math.min(100, Math.round(((xp - stage.prevThreshold) / (stage.threshold - stage.prevThreshold)) * 100));
  const accEmoji = accessoryEmoji(equippedAccessory);

  return (
    <Card title="Su mascota" style={{ flex: 1 }}>
      <View style={styles.wrap}>
        <View>
          <Pet stage={stage.key} size={88} />
          {accEmoji && <Text style={styles.accessory}>{accEmoji}</Text>}
        </View>
        <Text style={styles.stageLabel}>{stage.label}</Text>
        <Text style={styles.petName}>Migo</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.xpLabel}>
          {stage.key === 'adult' ? `${xp} XP · nivel máximo` : `${xp} / ${stage.threshold} XP`}
        </Text>
      </View>
    </Card>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  wrap: { alignItems: 'center' },
  accessory: { position: 'absolute', top: -6, right: -6, fontSize: 22 },
  stageLabel: { color: colors.ink, fontWeight: '800', fontSize: 15, marginTop: spacing(1) },
  petName: { color: colors.inkSoft, fontWeight: '700', fontSize: 11, marginBottom: spacing(2) },
  track: {
    width: '100%',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: radius.pill,
  },
  xpLabel: { fontSize: 10, color: colors.inkSoft, fontWeight: '700', marginTop: spacing(1.5) },
});
