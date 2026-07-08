import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Battery from 'expo-battery';
import { supabase } from '../lib/supabase';
import { colors, radius, spacing } from '../theme';
import { useCouple } from '../context/CoupleContext';
import { MoodWidget } from '../components/MoodWidget';
import { MissYouWidget } from '../components/MissYouWidget';
import { PetWidget } from '../components/PetWidget';
import { StatusWidget, ManualStatus } from '../components/StatusWidget';
import { HapticPatternKey, playHapticPattern } from '../lib/haptics';
import { notifyPartner } from '../lib/notifications';

export function HomeScreen() {
  const { userId, coupleId } = useCouple();
  const [myMood, setMyMood] = useState<string | null>(null);
  const [partnerMood, setPartnerMood] = useState<string | null>(null);
  const [missYouTotal, setMissYouTotal] = useState(0);
  const [petXp, setPetXp] = useState(0);
  const [equippedAccessory, setEquippedAccessory] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState(1);

  const [myBattery, setMyBattery] = useState<number | null>(null);
  const [myStatus, setMyStatus] = useState<ManualStatus | null>(null);
  const [partnerBattery, setPartnerBattery] = useState<number | null>(null);
  const [partnerStatus, setPartnerStatus] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    const { data: moodRows } = await supabase
      .from('moods')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (moodRows) {
      const mine = moodRows.find((m) => m.profile_id === userId);
      const theirs = moodRows.find((m) => m.profile_id !== userId);
      if (mine) setMyMood(mine.emoji);
      if (theirs) setPartnerMood(theirs.emoji);
    }

    const { count } = await supabase
      .from('missyou_taps')
      .select('*', { count: 'exact', head: true })
      .eq('couple_id', coupleId);
    setMissYouTotal(count ?? 0);

    const { data: couple } = await supabase.from('couples').select('*').eq('id', coupleId).single();
    if (couple) {
      setPetXp(couple.pet_xp ?? 0);
      setEquippedAccessory(couple.equipped_accessory ?? null);
      const created = new Date(couple.created_at);
      const days = Math.max(1, Math.ceil((Date.now() - created.getTime()) / 86400000));
      setStreakDays(days);
    }

    const { data: statusRows } = await supabase.from('member_status').select('*').eq('couple_id', coupleId);
    if (statusRows) {
      const mine = statusRows.find((s) => s.profile_id === userId);
      const theirs = statusRows.find((s) => s.profile_id !== userId);
      if (mine) setMyStatus(mine.manual_status);
      if (theirs) {
        setPartnerStatus(theirs.manual_status);
        setPartnerBattery(theirs.battery_level);
      }
    }
  }, [coupleId, userId]);

  useEffect(() => {
    loadInitial();

    const channel = supabase
      .channel(`couple-${coupleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'moods', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          if (row.profile_id === userId) setMyMood(row.emoji);
          else setPartnerMood(row.emoji);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'missyou_taps', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          setMissYouTotal((prev) => prev + 1);
          const row = payload.new as any;
          if (row.profile_id !== userId) playHapticPattern(row.pattern ?? 'soft');
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          setPetXp(row.pet_xp ?? 0);
          setEquippedAccessory(row.equipped_accessory ?? null);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'member_status', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;
          if (row.profile_id === userId) setMyStatus(row.manual_status);
          else {
            setPartnerStatus(row.manual_status);
            setPartnerBattery(row.battery_level);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, userId, loadInitial]);

  // Batería real del dispositivo, reportada automáticamente
  useEffect(() => {
    let sub: any;
    (async () => {
      const level = await Battery.getBatteryLevelAsync();
      const pct = Math.round(level * 100);
      setMyBattery(pct);
      await upsertStatus({ battery_level: pct });
      sub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
        const p = Math.round(batteryLevel * 100);
        setMyBattery(p);
        upsertStatus({ battery_level: p });
      });
    })();
    return () => sub?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId]);

  async function upsertStatus(fields: { battery_level?: number; manual_status?: ManualStatus }) {
    await supabase
      .from('member_status')
      .upsert({ couple_id: coupleId, profile_id: userId, ...fields, updated_at: new Date().toISOString() });
  }

  async function pickMood(emoji: string) {
    setMyMood(emoji);
    await supabase.from('moods').insert({ couple_id: coupleId, profile_id: userId, emoji });
    await supabase.rpc('increment_pet_xp', { p_couple_id: coupleId, p_amount: 5 });
    notifyPartner({
      senderId: userId,
      coupleId,
      title: 'Nuevo estado de ánimo 💭',
      body: `Tu pareja cambió su ánimo a ${emoji}`,
      data: { screen: 'Ahora' },
    });
  }

  async function tapMissYou(pattern: HapticPatternKey) {
    setMissYouTotal((prev) => prev + 1);
    playHapticPattern(pattern);
    await supabase.from('missyou_taps').insert({ couple_id: coupleId, profile_id: userId, pattern });
    await supabase.rpc('increment_pet_xp', { p_couple_id: coupleId, p_amount: 2 });
    const patternLabel: Record<string, string> = { soft: '🤍', double: '💞', sos: '📡' };
    notifyPartner({
      senderId: userId,
      coupleId,
      title: '💌 Te extraña',
      body: `Tu pareja te mandó un toque ${patternLabel[pattern] ?? ''}`,
      data: { screen: 'Ahora' },
    });
  }

  async function changeStatus(status: ManualStatus) {
    setMyStatus(status);
    await upsertStatus({ manual_status: status });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topbar}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brandName}>♥ Vinku-love</Text>
              <Text style={styles.slogan}>Every heartbeat together.</Text>
            </View>
          </View>
        </View>

        <View style={styles.streakBanner}>
          <View>
            <Text style={styles.streakLabel}>Días juntos en la app</Text>
            <Text style={styles.streakNum}>{streakDays}</Text>
          </View>
          <Text style={{ fontSize: 26 }}>🔥</Text>
        </View>

        <View style={{ marginBottom: spacing(3) }}>
          <StatusWidget
            myBattery={myBattery}
            myStatus={myStatus}
            partnerBattery={partnerBattery}
            partnerStatus={partnerStatus}
            onChangeStatus={changeStatus}
          />
        </View>

        <View style={styles.row}>
          <MoodWidget myMood={myMood} partnerMood={partnerMood} onPick={pickMood} />
        </View>

        <View style={[styles.row, { gap: spacing(3) }]}>
          <MissYouWidget total={missYouTotal} onTap={tapMissYou} />
          <PetWidget xp={petXp} equippedAccessory={equippedAccessory} />
        </View>

        <Text style={styles.footNote}>Sincronizado en vivo con tu pareja a través de Supabase Realtime.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(12) },
  topbar: { marginBottom: spacing(4) },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: colors.ink, fontWeight: '800', fontSize: 19 },
  slogan: { fontSize: 11, fontWeight: '600', color: colors.coral, fontStyle: 'italic' },
  streakBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(4),
  },
  streakLabel: { fontSize: 11, color: colors.inkSoft, fontWeight: '700', marginBottom: 2 },
  streakNum: { fontSize: 24, fontWeight: '800', color: colors.coralDark },
  row: { flexDirection: 'row', marginBottom: spacing(3) },
  footNote: { textAlign: 'center', color: colors.inkFaint, fontSize: 10.5, marginTop: spacing(4) },
});
