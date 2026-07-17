import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCouple } from '../context/CoupleContext';
import { Card } from '../components/Card';
import { Pet, stageForXp } from '../components/Pet';
import { ACCESSORY_CATALOG, accessoryEmoji } from '../data/accessories';

export function PetScreen() {
  const { coupleId } = useCouple();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [xp, setXp] = useState(0);
  const [equipped, setEquipped] = useState<string | null>(null);
  const [owned, setOwned] = useState<string[]>([]);

  const load = useCallback(async () => {
    const { data: couple } = await supabase.from('couples').select('*').eq('id', coupleId).single();
    if (couple) {
      setXp(couple.pet_xp ?? 0);
      setEquipped(couple.equipped_accessory ?? null);
    }
    const { data: accessories } = await supabase
      .from('pet_accessories_owned')
      .select('accessory_key')
      .eq('couple_id', coupleId);
    if (accessories) setOwned(accessories.map((a) => a.accessory_key));
  }, [coupleId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`pet-${coupleId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          setXp(row.pet_xp ?? 0);
          setEquipped(row.equipped_accessory ?? null);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pet_accessories_owned', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          setOwned((prev) => (prev.includes(row.accessory_key) ? prev : [...prev, row.accessory_key]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, load]);

  const stage = stageForXp(xp);
  const pct =
    stage.key === 'adult'
      ? 100
      : Math.min(100, Math.round(((xp - stage.prevThreshold) / (stage.threshold - stage.prevThreshold)) * 100));

  async function buyAccessory(key: string, cost: number) {
    if (owned.includes(key)) {
      // ya la tienen: solo equipar/desequipar
      await supabase
        .from('couples')
        .update({ equipped_accessory: equipped === key ? null : key })
        .eq('id', coupleId);
      return;
    }
    if (xp < cost) return; // no alcanza el XP
    await supabase.from('pet_accessories_owned').insert({ couple_id: coupleId, accessory_key: key });
    await supabase.rpc('increment_pet_xp', { p_couple_id: coupleId, p_amount: -cost });
    await supabase.from('couples').update({ equipped_accessory: key }).eq('id', coupleId);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.header}>
        {t('pet.title', 'Migo')}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.petStageBox}>
        <View>
          <Pet stage={stage.key} size={160} />
          {accessoryEmoji(equipped) && <Text style={styles.bigAccessory}>{accessoryEmoji(equipped)}</Text>}
        </View>
        <Text style={styles.stageLabel}>{stage.label}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.xpLabel}>
          {stage.key === 'adult' ? `${xp} XP · ${t('pet.maxLevel', 'nivel máximo')}` : `${xp} / ${stage.threshold} XP`}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={{ width: '100%' }}>
        <Card title={t('pet.shopTitle', 'Tienda de accesorios')} style={{ width: '100%' }}>
        <Text style={styles.shopHint}>
          Los accesorios se compran con el XP acumulado por los dos. Toca uno que ya tengan para
          equiparlo o quitarlo.
        </Text>
        <View style={styles.grid}>
          {ACCESSORY_CATALOG.map((acc) => {
            const isOwned = owned.includes(acc.key);
            const isEquipped = equipped === acc.key;
            const canAfford = xp >= acc.cost;
            return (
              <Pressable
                key={acc.key}
                onPress={() => buyAccessory(acc.key, acc.cost)}
                disabled={!isOwned && !canAfford}
                style={[
                  styles.accessoryCard,
                  isEquipped && styles.accessoryCardEquipped,
                  !isOwned && !canAfford && { opacity: 0.4 },
                ]}
              >
                <Text style={{ fontSize: 28 }}>{acc.emoji}</Text>
                <Text style={styles.accessoryLabel}>{acc.label}</Text>
                <Text style={styles.accessoryCost}>
                  {isOwned ? (isEquipped ? t('pet.equipped', 'Equipado ✓') : t('pet.tapToEquip', 'Tocar para usar')) : `${acc.cost} XP`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
      </Animated.View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(12), alignItems: 'center' },
  header: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: spacing(4), alignSelf: 'flex-start' },
  petStageBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing(6),
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing(4),
  },
  bigAccessory: { position: 'absolute', top: -8, right: -8, fontSize: 34 },
  stageLabel: { color: colors.ink, fontWeight: '800', fontSize: 18, marginTop: spacing(3) },
  track: {
    width: '100%',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginTop: spacing(3),
  },
  fill: { height: '100%', backgroundColor: colors.teal, borderRadius: radius.pill },
  xpLabel: { fontSize: 11, color: colors.inkSoft, fontWeight: '700', marginTop: spacing(2) },
  shopHint: { color: colors.inkSoft, fontSize: 11.5, marginBottom: spacing(3), lineHeight: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) },
  accessoryCard: {
    width: '47%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  accessoryCardEquipped: { borderColor: colors.gold, backgroundColor: '#2A2410' },
  accessoryLabel: { color: colors.ink, fontWeight: '700', fontSize: 12, marginTop: spacing(1.5) },
  accessoryCost: { color: colors.gold, fontWeight: '800', fontSize: 11, marginTop: 4 },
});
