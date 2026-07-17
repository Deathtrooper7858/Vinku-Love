import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useCouple } from '../context/CoupleContext';
import { Card } from '../components/Card';

type Segment = 'citas' | 'calendario' | 'gastos' | 'capsula';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'citas', label: 'Citas' },
  { key: 'calendario', label: 'Calendario' },
  { key: 'gastos', label: 'Gastos' },
  { key: 'capsula', label: 'Cápsula' },
];

export function PlansScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [segment, setSegment] = useState<Segment>('citas');

  return (
    <View style={styles.screen}>
      <View style={styles.segmentRow}>
        {SEGMENTS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => setSegment(s.key)}
            style={[styles.segmentChip, segment === s.key && styles.segmentChipActive]}
          >
            <Text style={[styles.segmentText, segment === s.key && styles.segmentTextActive]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      {segment === 'citas' && <BucketListPanel />}
      {segment === 'calendario' && <CalendarPanel />}
      {segment === 'gastos' && <ExpensesPanel />}
      {segment === 'capsula' && <CapsulePanel />}
    </View>
  );
}

// ---------- Citas pendientes (Bucket list) ----------
function BucketListPanel() {
  const { userId, coupleId } = useCouple();
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('bucket_list_items')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    if (data) setItems(data);
  }, [coupleId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`bucket-${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bucket_list_items', filter: `couple_id=eq.${coupleId}` },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, load]);

  async function addItem() {
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    await supabase.from('bucket_list_items').insert({ couple_id: coupleId, created_by: userId, title });
  }

  async function toggleDone(item: any) {
    await supabase.from('bucket_list_items').update({ done: !item.done }).eq('id', item.id);
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScroll}>
      <Card title="Cosas por hacer juntos" style={{ width: '100%' }}>
        <View style={styles.formRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ej: Ver el atardecer en la playa"
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
            onSubmitEditing={addItem}
          />
          <Pressable onPress={addItem} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>
        {items.length === 0 && <Text style={styles.empty}>Aún no hay planes. Agreguen el primero 💫</Text>}
        {items.map((item) => (
          <Pressable key={item.id} style={styles.listRow} onPress={() => toggleDone(item)}>
            <Text style={{ fontSize: 16 }}>{item.done ? '✅' : '⬜️'}</Text>
            <Text style={[styles.listText, item.done && styles.listTextDone]}>{item.title}</Text>
          </Pressable>
        ))}
      </Card>
    </ScrollView>
  );
}

// ---------- Calendario de eventos importantes ----------
function CalendarPanel() {
  const { userId, coupleId } = useCouple();
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('couple_id', coupleId)
      .order('event_date', { ascending: true });
    if (data) setEvents(data);
  }, [coupleId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`calendar-${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_events', filter: `couple_id=eq.${coupleId}` },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, load]);

  async function addEvent() {
    if (!title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return;
    await supabase
      .from('calendar_events')
      .insert({ couple_id: coupleId, created_by: userId, title: title.trim(), event_date: date.trim() });
    setTitle('');
    setDate('');
  }

  function daysUntil(dateStr: string): string {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return 'Hoy 🎉';
    if (diff < 0) return `Hace ${Math.abs(diff)} días`;
    return `Faltan ${diff} días`;
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScroll}>
      <Card title="Eventos importantes" style={{ width: '100%' }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Aniversario"
          placeholderTextColor={colors.inkFaint}
          style={[styles.input, { marginBottom: spacing(2) }]}
        />
        <View style={styles.formRow}>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
          />
          <Pressable onPress={addEvent} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>
        {events.length === 0 && <Text style={styles.empty}>Sin eventos aún.</Text>}
        {events.map((ev) => (
          <View key={ev.id} style={styles.listRow}>
            <Text style={{ fontSize: 16 }}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.listText}>{ev.title}</Text>
              <Text style={styles.eventSub}>{daysUntil(ev.event_date)}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

// ---------- Gastos compartidos ----------
function ExpensesPanel() {
  const { userId, coupleId } = useCouple();
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    if (data) setExpenses(data);
  }, [coupleId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`expenses-${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `couple_id=eq.${coupleId}` },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, load]);

  async function addExpense() {
    const value = parseFloat(amount.replace(',', '.'));
    if (!desc.trim() || isNaN(value) || value <= 0) return;
    await supabase.from('expenses').insert({
      couple_id: coupleId,
      paid_by: userId,
      description: desc.trim(),
      amount: value,
    });
    setDesc('');
    setAmount('');
  }

  const myTotal = expenses.filter((e) => e.paid_by === userId).reduce((s, e) => s + Number(e.amount), 0);
  const partnerTotal = expenses.filter((e) => e.paid_by !== userId).reduce((s, e) => s + Number(e.amount), 0);
  const diff = myTotal - partnerTotal;
  const balanceText =
    diff === 0
      ? 'Están a mano'
      : diff > 0
      ? `Tu pareja te debe ${(diff / 2).toFixed(2)}`
      : `Le debes a tu pareja ${(Math.abs(diff) / 2).toFixed(2)}`;

  return (
    <ScrollView contentContainerStyle={styles.panelScroll}>
      <Card title="Balance" style={{ width: '100%', marginBottom: spacing(3) }}>
        <Text style={styles.balanceText}>{balanceText}</Text>
      </Card>
      <Card title="Registrar gasto" style={{ width: '100%' }}>
        <TextInput
          value={desc}
          onChangeText={setDesc}
          placeholder="Ej: Cena de ayer"
          placeholderTextColor={colors.inkFaint}
          style={[styles.input, { marginBottom: spacing(2) }]}
        />
        <View style={styles.formRow}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Monto"
            placeholderTextColor={colors.inkFaint}
            keyboardType="numeric"
            style={styles.input}
          />
          <Pressable onPress={addExpense} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>
        {expenses.map((e) => (
          <View key={e.id} style={styles.listRow}>
            <Text style={{ fontSize: 16 }}>{e.paid_by === userId ? '🧍‍♂️' : '🧍‍♀️'}</Text>
            <Text style={styles.listText}>
              {e.description} · {Number(e.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

// ---------- Cápsula del tiempo ----------
function CapsulePanel() {
  const { userId, coupleId } = useCouple();
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [entries, setEntries] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const loadUrls = useCallback(async (entriesList: any[]) => {
    const pathsToSign = entriesList.map((e) => e.photo_path).filter(Boolean);
    if (pathsToSign.length === 0) return;

    const { data } = await supabase.storage.from('vinku-love-media').createSignedUrls(pathsToSign, 3600);
    if (data) {
      const urls: Record<string, string> = {};
      data.forEach((d) => {
        if (d.signedUrl && d.path) urls[d.path] = d.signedUrl;
      });
      setPhotoUrls((prev) => ({ ...prev, ...urls }));
    }
  }, []);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('capsule_entries')
      .select('*')
      .eq('couple_id', coupleId)
      .order('unlock_at', { ascending: true });
    if (data) {
      setEntries(data);
      loadUrls(data);
    }
  }, [coupleId, loadUrls]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`capsule-${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'capsule_entries', filter: `couple_id=eq.${coupleId}` },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, load]);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
  }

  async function saveEntry() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(unlockDate.trim())) return;
    if (!text.trim() && !photoUri) return;
    setSaving(true);
    try {
      let photoPath: string | null = null;
      if (photoUri) {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const fileName = `${coupleId}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('vinku-love-media')
          .upload(fileName, blob, { contentType: 'image/jpeg' });
        if (!uploadError) photoPath = fileName;
      }
      await supabase.from('capsule_entries').insert({
        couple_id: coupleId,
        profile_id: userId,
        text: text.trim() || null,
        photo_path: photoPath,
        unlock_at: `${unlockDate.trim()}T00:00:00Z`,
      });
      setText('');
      setUnlockDate('');
      setPhotoUri(null);
    } finally {
      setSaving(false);
    }
  }

  // Eliminamos publicUrl porque ahora usamos photoUrls con URLs firmadas

  return (
    <ScrollView contentContainerStyle={styles.panelScroll}>
      <Card title="Nueva cápsula" style={{ width: '100%', marginBottom: spacing(3) }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe una nota para el futuro..."
          placeholderTextColor={colors.inkFaint}
          style={[styles.input, { marginBottom: spacing(2), minHeight: 50 }]}
          multiline
        />
        <Pressable onPress={pickPhoto} style={styles.photoBtn}>
          <Text style={styles.photoBtnText}>{photoUri ? 'Foto seleccionada ✓' : '📷 Agregar foto (opcional)'}</Text>
        </Pressable>
        <TextInput
          value={unlockDate}
          onChangeText={setUnlockDate}
          placeholder="Se abre el: AAAA-MM-DD"
          placeholderTextColor={colors.inkFaint}
          style={[styles.input, { marginTop: spacing(2), marginBottom: spacing(2) }]}
        />
        <Pressable onPress={saveEntry} style={styles.addBtnWide} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.addBtnWideText}>Guardar cápsula</Text>}
        </Pressable>
      </Card>

      {entries.map((e) => {
        const locked = new Date(e.unlock_at).getTime() > Date.now();
        return (
          <Card key={e.id} title={locked ? 'Bloqueada' : 'Cápsula'} style={{ width: '100%', marginBottom: spacing(3) }}>
            {locked ? (
              <Text style={styles.lockedText}>🔒 Se abre el {e.unlock_at.slice(0, 10)}</Text>
            ) : (
              <>
                {e.photo_path && photoUrls[e.photo_path] && (
                  <Image source={{ uri: photoUrls[e.photo_path] }} style={styles.capsuleImage} />
                )}
                {e.text && <Text style={styles.capsuleText}>{e.text}</Text>}
              </>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: spacing(4),
    paddingBottom: 0,
  },
  segmentChip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  segmentChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  segmentText: { color: colors.inkSoft, fontWeight: '800', fontSize: 12 },
  segmentTextActive: { color: '#0A1F1C' },
  panelScroll: { padding: spacing(4), paddingBottom: spacing(12) },
  formRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    color: colors.ink,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.line,
  },
  addBtn: {
    width: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.bg, fontWeight: '800', fontSize: 18 },
  addBtnWide: { backgroundColor: colors.coral, borderRadius: radius.sm, paddingVertical: spacing(3), alignItems: 'center' },
  addBtnWideText: { color: '#1A1210', fontWeight: '800', fontSize: 13 },
  empty: { color: colors.inkSoft, fontSize: 12, textAlign: 'center', paddingVertical: spacing(3) },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing(2.5),
    marginTop: spacing(2),
  },
  listText: { color: colors.ink, fontSize: 13, flexShrink: 1 },
  listTextDone: { textDecorationLine: 'line-through', color: colors.inkFaint },
  eventSub: { color: colors.gold, fontSize: 11, fontWeight: '700', marginTop: 2 },
  balanceText: { color: colors.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  photoBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: spacing(2.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  photoBtnText: { color: colors.inkSoft, fontWeight: '700', fontSize: 12 },
  lockedText: { color: colors.inkSoft, fontSize: 13, fontWeight: '700', textAlign: 'center', paddingVertical: spacing(2) },
  capsuleImage: { width: '100%', height: 180, borderRadius: radius.sm, marginBottom: spacing(2) },
  capsuleText: { color: colors.ink, fontSize: 13 },
});
