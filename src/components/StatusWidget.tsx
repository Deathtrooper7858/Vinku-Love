import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from './Card';
import { radius, spacing, GRADIENTS } from '../theme';
import { useTheme } from '../context/ThemeProvider';

export type ManualStatus = 'libre' | 'ocupado' | 'durmiendo' | 'silencio';

export const STATUS_OPTIONS: { key: ManualStatus; label: string; emoji: string; gradient: string[] }[] = [
  { key: 'libre', label: 'Libre', emoji: '🟢', gradient: GRADIENTS.statusFree },
  { key: 'ocupado', label: 'Ocupado', emoji: '🟠', gradient: GRADIENTS.statusBusy },
  { key: 'durmiendo', label: 'Durmiendo', emoji: '😴', gradient: GRADIENTS.statusSleep },
  { key: 'silencio', label: 'En silencio', emoji: '🔕', gradient: GRADIENTS.statusSilent },
];

function statusLabel(key: string | null): string {
  return STATUS_OPTIONS.find((s) => s.key === key)?.label ?? 'Sin estado';
}
function statusEmoji(key: string | null): string {
  return STATUS_OPTIONS.find((s) => s.key === key)?.emoji ?? '⚪';
}
function statusGradient(key: string | null): string[] {
  return STATUS_OPTIONS.find((s) => s.key === key)?.gradient ?? ['#4B5563', '#374151'];
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
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  
  return (
    <Card title="Estado" style={{ width: '100%' }}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.who}>Tú</Text>
          <View style={styles.statusPill}>
            <LinearGradient
              colors={statusGradient(myStatus)}
              style={styles.statusDot}
            />
            <Text style={styles.statusLine}>{statusLabel(myStatus)}</Text>
          </View>
          {myBattery != null && (
            <View style={styles.batteryRow}>
              <Text style={{ fontSize: 10 }}>⚡</Text>
              <View style={styles.batteryTrack}>
                <LinearGradient
                  colors={myBattery > 20 ? GRADIENTS.statusFree : GRADIENTS.danger}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.batteryFill, { width: `${myBattery}%` }]}
                />
              </View>
              <Text style={styles.batteryText}>{myBattery}%</Text>
            </View>
          )}
        </View>
        
        <View style={styles.col}>
          <Text style={styles.who}>Pareja</Text>
          <View style={styles.statusPill}>
            <LinearGradient
              colors={statusGradient(partnerStatus)}
              style={styles.statusDot}
            />
            <Text style={styles.statusLine}>{statusLabel(partnerStatus)}</Text>
          </View>
          {partnerBattery != null && (
            <View style={styles.batteryRow}>
              <Text style={{ fontSize: 10 }}>⚡</Text>
              <View style={styles.batteryTrack}>
                <LinearGradient
                  colors={partnerBattery > 20 ? GRADIENTS.statusFree : GRADIENTS.danger}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.batteryFill, { width: `${partnerBattery}%` }]}
                />
              </View>
              <Text style={styles.batteryText}>{partnerBattery}%</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.picker}>
        {STATUS_OPTIONS.map((s) => {
          const isSelected = myStatus === s.key;
          return (
            <Pressable key={s.key} onPress={() => onChangeStatus(s.key)}>
              <LinearGradient
                colors={isSelected ? s.gradient : [colors.surfaceAlt, colors.surfaceAlt]}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, isSelected && { color: '#FFF' }]}>
                  {s.emoji} {s.label}
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing(4) },
  col: { alignItems: 'center', flex: 1 },
  who: { fontSize: 12, fontWeight: '800', color: colors.inkSoft, marginBottom: spacing(2), textTransform: 'uppercase', letterSpacing: 1 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
    marginBottom: spacing(2),
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLine: { fontSize: 13, fontWeight: '700', color: colors.ink },
  batteryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  batteryTrack: { width: 40, height: 4, backgroundColor: colors.line, borderRadius: 2, overflow: 'hidden' },
  batteryFill: { height: '100%', borderRadius: 2 },
  batteryText: { fontSize: 10, color: colors.inkSoft, fontWeight: '700' },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  chipSelected: { borderColor: 'transparent' },
  chipText: { fontSize: 11, color: colors.ink, fontWeight: '800' },
});
