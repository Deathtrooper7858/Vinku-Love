import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from './Card';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';

export type Note = { id: string; fromMe: boolean; text: string };

export function NotesWidget({
  notes,
  onSend,
}: {
  notes: Note[];
  onSend: (text: string) => void;
}) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [draft, setDraft] = useState('');

  function submit() {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft('');
  }

  return (
    <Card title="Notas para tu pareja" style={{ width: '100%' }}>
      {notes.length === 0 ? (
        <Text style={styles.empty}>Aún no hay notas. Escribe la primera 💌</Text>
      ) : (
        <FlatList
          data={[...notes].reverse()}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 150, marginBottom: spacing(3) }}
          renderItem={({ item }) => (
            <View style={styles.noteItem}>
              <Text style={[styles.tag, { color: item.fromMe ? colors.coralDark : colors.tealDark }]}>
                {item.fromMe ? 'Tú' : 'Pareja'}:
              </Text>
              <Text style={styles.noteText}>{item.text}</Text>
            </View>
          )}
        />
      )}
      <View style={styles.formRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Escribe algo lindo..."
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          maxLength={140}
          onSubmitEditing={submit}
        />
        <Pressable onPress={submit} style={styles.sendBtn}>
          <Text style={styles.sendText}>Enviar</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  empty: { fontSize: 12, color: colors.inkSoft, textAlign: 'center', paddingVertical: spacing(2) },
  noteItem: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing(2.5),
    marginBottom: spacing(2),
    flexDirection: 'row',
    gap: 6,
  },
  tag: { fontWeight: '800', fontSize: 12 },
  noteText: { color: colors.ink, fontSize: 13, flexShrink: 1 },
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
  sendBtn: {
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: colors.bg, fontWeight: '800', fontSize: 13 },
});
