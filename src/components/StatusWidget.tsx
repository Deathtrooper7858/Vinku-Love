import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';

export type ManualStatus = 'libre' | 'ocupado' | 'durmiendo' | 'silencio';

export const STATUS_OPTIONS: { key: ManualStatus; label: string; emoji: string }[] = [
  { key: 'libre', label: 'Libre', emoji: '🟢' },
  { key: 'ocupado', label: 'Ocupado', emoji: '🟠' },
  { key: 'durmiendo', label: 'Durmiendo', emoji: '😴' },
  { key: 'silencio', label: 'En silencio', emoji: '🔕' },
];

function statusLabel(key: string | null): string {
  return STATUS_OPTIONS.find((s) => s.key === key)?.label ?? 'Sin estado';
}
function statusEmoji(key: string | null): string {
  return STATUS_OPTIONS.find((s) => s.key === key)?.emoji ?? '⚪';
}

export function StatusWidget({
  myBattery,
  myStatus,
  partnerBattery,
  partnerStatus,
  onChangeStatus,
}: {
  myBattery: number | null;
  myStatus: string | null;
  partnerBattery: number | null;
  partnerStatus: string | null;
  onChangeStatus: (status: ManualStatus) => void;
}) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  return (
    <Card title="Estado" style={{ width: '100%' }}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.who}>Tú</Text>
          <Text style={styles.statusLine}>
            {statusEmoji(myStatus)} {statusLabel(myStatus)}
          </Text>
          {myBattery != null && <Text style={styles.battery}>🔋 {myBattery}%</Text>}
        </View>
        <View style={styles.col}>
          <Text style={styles.who}>Pareja</Text>
          <Text style={styles.statusLine}>
            {statusEmoji(partnerStatus)} {statusLabel(partnerStatus)}
          </Text>
          {partnerBattery != null && <Text style={styles.battery}>🔋 {partnerBattery}%</Text>}
        </View>
      </View>
      <View style={styles.picker}>
        {STATUS_OPTIONS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => onChangeStatus(s.key)}
            style={[styles.chip, myStatus === s.key && styles.chipSelected]}
          >
            <Text style={styles.chipText}>
              {s.emoji} {s.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing(3) },
  col: { alignItems: 'center' },
  who: { fontSize: 11, fontWeight: '800', color: colors.inkSoft, marginBottom: spacing(1) },
  statusLine: { fontSize: 13, fontWeight: '700', color: colors.ink },
  battery: { fontSize: 11, color: colors.inkSoft, marginTop: 2, fontWeight: '700' },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  chip: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  chipSelected: { backgroundColor: colors.teal },
  chipText: { fontSize: 11, color: colors.ink, fontWeight: '700' },
});
