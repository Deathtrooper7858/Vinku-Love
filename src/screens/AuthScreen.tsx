import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, radius, spacing } from '../theme';

export function AuthScreen() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Escribe tu correo y contraseña.');
      return;
    }
    if (mode === 'signUp' && !name.trim()) {
      setError('Escribe tu nombre.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signUp') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            display_name: name.trim(),
          });
          if (profileError) throw profileError;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (e: any) {
      setError(e.message ?? 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>♥ Vinku-love</Text>
      <Text style={styles.slogan}>Every heartbeat together.</Text>
      <Text style={styles.subtitle}>
        {mode === 'signUp' ? 'Crea tu cuenta para conectarte con tu pareja' : 'Inicia sesión'}
      </Text>

      {mode === 'signUp' && (
        <TextInput
          placeholder="Tu nombre"
          placeholderTextColor={colors.inkFaint}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}
      <TextInput
        placeholder="Correo"
        placeholderTextColor={colors.inkFaint}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={colors.inkFaint}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={styles.primaryBtnText}>{mode === 'signUp' ? 'Crear cuenta' : 'Entrar'}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}>
        <Text style={styles.switchText}>
          {mode === 'signUp' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    paddingHorizontal: spacing(6),
  },
  brand: { fontSize: 28, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: spacing(1) },
  slogan: { fontSize: 14, fontWeight: '600', color: colors.coral, textAlign: 'center', marginBottom: spacing(4), fontStyle: 'italic' },
  subtitle: { fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginBottom: spacing(8) },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
    color: colors.ink,
    marginBottom: spacing(3),
    fontSize: 14,
  },
  error: { color: colors.danger, fontSize: 12, marginBottom: spacing(3), textAlign: 'center' },
  primaryBtn: {
    backgroundColor: colors.coral,
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    marginTop: spacing(2),
    marginBottom: spacing(4),
  },
  primaryBtnText: { color: colors.bg, fontWeight: '800', fontSize: 15 },
  switchText: { color: colors.inkSoft, textAlign: 'center', fontSize: 12, fontWeight: '700' },
});
