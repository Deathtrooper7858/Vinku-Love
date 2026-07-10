import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, radius, spacing } from '../theme';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function CoupleSetupScreen({
  userId,
  onCoupleReady,
}: {
  userId: string;
  onCoupleReady: (coupleId: string) => void;
}) {
  const [mode, setMode] = useState<'choose' | 'created' | 'join'>('choose');
  const [myCode, setMyCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCoupleId, setPendingCoupleId] = useState<string | null>(null);

  async function createCouple() {
    setLoading(true);
    setError(null);
    try {
      const code = generateCode();
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .insert({ invite_code: code })
        .select()
        .single();
      if (coupleError) throw coupleError;

      const { error: memberError } = await supabase
        .from('couple_members')
        .insert({ couple_id: couple.id, profile_id: userId });
      if (memberError) throw memberError;

      setMyCode(code);
      setPendingCoupleId(couple.id);
      setMode('created');

      // Espera a que la pareja se una (polling ligero)
      const interval = setInterval(async () => {
        const { data: members } = await supabase
          .from('couple_members')
          .select('profile_id')
          .eq('couple_id', couple.id);
        if (members && members.length >= 2) {
          clearInterval(interval);
          onCoupleReady(couple.id);
        }
      }, 3000);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo crear la pareja.');
    } finally {
      setLoading(false);
    }
  }

  async function joinCouple() {
    setLoading(true);
    setError(null);
    try {
      const code = joinCode.trim().toUpperCase();
      const { data: couple, error: findError } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', code)
        .single();
      if (findError || !couple) {
        setError('Código no encontrado. Verifícalo con tu pareja.');
        setLoading(false);
        return;
      }
      const { error: memberError } = await supabase
        .from('couple_members')
        .insert({ couple_id: couple.id, profile_id: userId });
      if (memberError) throw memberError;

      onCoupleReady(couple.id);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo unir a la pareja.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'created') {
    return (
      <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Comparte este código</Text>
        <Text style={styles.subtitle}>Tu pareja debe ingresarlo para conectarse contigo</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{myCode}</Text>
        </View>
        <ActivityIndicator color={colors.teal} style={{ marginTop: spacing(6) }} />
        <Text style={styles.waiting}>Esperando a que tu pareja se una...</Text>
      </View>
    );
  }

  if (mode === 'join') {
    return (
      <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Ingresa el código</Text>
        <Text style={styles.subtitle}>El que te compartió tu pareja</Text>
        <TextInput
          value={joinCode}
          onChangeText={setJoinCode}
          placeholder="EJ: A3F7K9"
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="characters"
          maxLength={6}
          style={styles.input}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.primaryBtn} onPress={joinCouple} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.primaryBtnText}>Conectar</Text>}
        </Pressable>
        <Pressable onPress={() => setMode('choose')}>
          <Text style={styles.switchText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Conéctate con tu pareja</Text>
      <Text style={styles.subtitle}>Uno crea el código, el otro lo ingresa. Así de simple.</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.primaryBtn} onPress={createCouple} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.primaryBtnText}>Crear código</Text>}
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={() => setMode('join')}>
        <Text style={styles.secondaryBtnText}>Tengo un código</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', paddingHorizontal: spacing(6) },
  logo: { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center', marginBottom: spacing(3) },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: spacing(2) },
  subtitle: { fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginBottom: spacing(8) },
  codeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing(6),
    alignItems: 'center',
  },
  codeText: { fontSize: 34, fontWeight: '800', color: colors.gold, letterSpacing: 6 },
  waiting: { color: colors.inkSoft, fontSize: 12, textAlign: 'center', marginTop: spacing(3), fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
    color: colors.ink,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: spacing(3),
  },
  error: { color: colors.danger, fontSize: 12, marginBottom: spacing(3), textAlign: 'center' },
  primaryBtn: {
    backgroundColor: colors.coral,
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  primaryBtnText: { color: colors.bg, fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryBtnText: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  switchText: { color: colors.inkSoft, textAlign: 'center', fontSize: 12, fontWeight: '700', marginTop: spacing(3) },
});
