import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from './Card';
import { colors, radius, spacing } from '../theme';

export function DailyQuestionCard({
  promptText,
  myAnswer,
  partnerAnswered,
  partnerAnswerText,
  onSubmit,
}: {
  promptText: string;
  myAnswer: string | null;
  partnerAnswered: boolean;
  partnerAnswerText: string | null;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!draft.trim()) return;
    setSending(true);
    await onSubmit(draft.trim());
    setSending(false);
  }

  const bothAnswered = !!myAnswer && partnerAnswered;

  return (
    <Card title="Pregunta del día" style={{ width: '100%' }}>
      <Text style={styles.prompt}>{promptText}</Text>

      {!myAnswer && (
        <>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Escribe tu respuesta..."
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
            multiline
          />
          <Pressable style={styles.submitBtn} onPress={submit} disabled={sending}>
            {sending ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.submitText}>Responder</Text>}
          </Pressable>
        </>
      )}

      {myAnswer && !bothAnswered && (
        <View style={styles.waitingBox}>
          <Text style={styles.waitingText}>Ya respondiste 🎉</Text>
          <Text style={styles.waitingSub}>
            Tu respuesta se revela cuando tu pareja también responda.
          </Text>
        </View>
      )}

      {bothAnswered && (
        <View style={styles.revealRow}>
          <View style={styles.revealCol}>
            <Text style={styles.revealWho}>Tú</Text>
            <Text style={styles.revealText}>{myAnswer}</Text>
          </View>
          <View style={styles.revealCol}>
            <Text style={styles.revealWho}>Pareja</Text>
            <Text style={styles.revealText}>{partnerAnswerText}</Text>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  prompt: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: spacing(3), lineHeight: 21 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing(3),
    color: colors.ink,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: spacing(3),
    borderWidth: 1,
    borderColor: colors.line,
  },
  submitBtn: {
    backgroundColor: colors.teal,
    borderRadius: radius.sm,
    paddingVertical: spacing(2.5),
    alignItems: 'center',
  },
  submitText: { color: '#0A1F1C', fontWeight: '800', fontSize: 13 },
  waitingBox: { alignItems: 'center', paddingVertical: spacing(2) },
  waitingText: { color: colors.ink, fontWeight: '800', fontSize: 14, marginBottom: 4 },
  waitingSub: { color: colors.inkSoft, fontSize: 12, textAlign: 'center' },
  revealRow: { flexDirection: 'row', gap: spacing(3) },
  revealCol: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing(3) },
  revealWho: { fontSize: 11, fontWeight: '800', color: colors.gold, marginBottom: 4 },
  revealText: { color: colors.ink, fontSize: 13 },
});
