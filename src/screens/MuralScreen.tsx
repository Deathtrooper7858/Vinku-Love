import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, spacing } from '../theme';
import { useCouple } from '../context/CoupleContext';
import { NotesWidget, Note } from '../components/NotesWidget';
import { DailyQuestionCard } from '../components/DailyQuestionCard';
import { getPromptForDate } from '../data/dailyPrompts';
import { notifyPartner } from '../lib/notifications';

export function MuralScreen() {
  const { userId, coupleId } = useCouple();
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
      title: '📝 Nueva nota',
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
      title: '🌟 Pregunta del día',
      body: 'Tu pareja ya respondió. ¡Responde tú para ver ambas respuestas!',
      data: { screen: 'Mural' },
    });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>El Mural</Text>
        <View style={{ marginBottom: spacing(3) }}>
          <DailyQuestionCard
            promptText={promptText}
            myAnswer={myAnswer}
            partnerAnswered={!!partnerAnswer}
            partnerAnswerText={partnerAnswer}
            onSubmit={submitAnswer}
          />
        </View>
        <NotesWidget notes={notes} onSend={sendNote} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(12) },
  header: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: spacing(4) },
});
