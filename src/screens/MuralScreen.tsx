import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { spacing, GRADIENTS } from '../theme';
import { useCouple } from '../context/CoupleContext';
import { NotesWidget, Note } from '../components/NotesWidget';
import { DailyQuestionCard } from '../components/DailyQuestionCard';
import { getPromptForDate } from '../data/dailyPrompts';
import { notifyPartner } from '../lib/notifications';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function MuralScreen() {
  const { userId, coupleId } = useCouple();
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const { t } = useTranslation();

  const [notes, setNotes] = useState<Note[]>([]);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);

  const { text: promptText, dateKey } = getPromptForDate(new Date());

  const load = useCallback(async () => {
    const { data: noteRows } = await supabase
      .from('notes')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (noteRows) setNotes(noteRows.map((n) => ({ id: n.id, fromMe: n.profile_id === userId, text: n.text })));

    const { data: answers } = await supabase
      .from('daily_answers')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('prompt_date', dateKey);
    if (answers) {
      const mine = answers.find((a) => a.profile_id === userId);
      const theirs = answers.find((a) => a.profile_id !== userId);
      setMyAnswer(mine?.answer ?? null);
      setPartnerAnswer(theirs?.answer ?? null);
    }
  }, [coupleId, userId, dateKey]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`mural-${coupleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          setNotes((prev) => [...prev, { id: row.id, fromMe: row.profile_id === userId, text: row.text }]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'daily_answers', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          if (row.prompt_date !== dateKey) return;
          if (row.profile_id === userId) setMyAnswer(row.answer);
          else setPartnerAnswer(row.answer);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, userId, dateKey, load]);

  async function sendNote(text: string) {
    setNotes((prev) => [...prev, { id: `temp-${Date.now()}`, fromMe: true, text }]);
    await supabase.from('notes').insert({ couple_id: coupleId, profile_id: userId, text });
    await supabase.rpc('increment_pet_xp', { p_couple_id: coupleId, p_amount: 3 });
    notifyPartner({
      senderId: userId,
      coupleId,
      title: t('mural.notif.noteTitle', '📝 Nueva nota'),
      body: text.length > 60 ? text.slice(0, 57) + '…' : text,
      data: { screen: 'Mural' },
    });
  }

  async function submitAnswer(text: string) {
    setMyAnswer(text);
    await supabase.from('daily_answers').insert({
      couple_id: coupleId,
      profile_id: userId,
      prompt_date: dateKey,
      answer: text,
    });
    await supabase.rpc('increment_pet_xp', { p_couple_id: coupleId, p_amount: 5 });
    notifyPartner({
      senderId: userId,
      coupleId,
      title: t('mural.notif.dailyTitle', '🌟 Pregunta del día'),
      body: t('mural.notif.dailyBody', 'Tu pareja ya respondió. ¡Responde tú para ver ambas respuestas!'),
      data: { screen: 'Mural' },
    });
  }

  return (
    <LinearGradient colors={isDark ? GRADIENTS.bgDark : GRADIENTS.bgLight} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.header}>
          {t('mural.title', 'El Mural')}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginBottom: spacing(3) }}>
          <DailyQuestionCard
            promptText={promptText}
            myAnswer={myAnswer}
            partnerAnswered={!!partnerAnswer}
            partnerAnswerText={partnerAnswer}
            onSubmit={submitAnswer}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <NotesWidget notes={notes} onSend={sendNote} />
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: spacing(4), paddingTop: Platform.OS === 'ios' ? spacing(12) : spacing(10), paddingBottom: spacing(24) },
  header: { color: colors.ink, fontSize: 24, fontWeight: '900', marginBottom: spacing(4) },
});
