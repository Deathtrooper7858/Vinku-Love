import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export function AuthScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError(t('auth.errorEmailPassword', 'Escribe tu correo y contraseña.'));
      return;
    }
    if (mode === 'signUp' && !name.trim()) {
      setError(t('auth.errorName', 'Escribe tu nombre.'));
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signUp') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: name.trim(),
            },
          },
        });
        if (signUpError) throw signUpError;
        // El perfil se creará automáticamente en Supabase usando un Trigger.
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (e: any) {
      setError(e.message ?? t('auth.errorGeneric', 'Algo salió mal. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center' }}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.slogan}>{t('auth.slogan', 'Every heartbeat together.')}</Text>
        <Text style={styles.subtitle}>
          {mode === 'signUp' ? t('auth.createAccount', 'Crea tu cuenta para conectarte con tu pareja') : t('auth.signIn', 'Inicia sesión')}
        </Text>
      </Animated.View>

      {mode === 'signUp' && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <TextInput
            placeholder={t('auth.namePlaceholder', 'Tu nombre')}
            placeholderTextColor={colors.inkFaint}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </Animated.View>
      )}
      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <TextInput
          placeholder={t('auth.email', 'Correo')}
          placeholderTextColor={colors.inkFaint}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <TextInput
          placeholder={t('auth.password', 'Contraseña')}
          placeholderTextColor={colors.inkFaint}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </Animated.View>

      {error && <Animated.Text entering={FadeIn} style={styles.error}>{error}</Animated.Text>}

      <Animated.View entering={FadeInDown.delay(250).springify()}>
        <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.primaryBtnText}>{mode === 'signUp' ? t('auth.createBtn', 'Crear cuenta') : t('auth.enterBtn', 'Entrar')}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}>
          <Text style={styles.switchText}>
            {mode === 'signUp' ? t('auth.alreadyHaveAccount', '¿Ya tienes cuenta? Inicia sesión') : t('auth.noAccount', '¿No tienes cuenta? Regístrate')}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    paddingHorizontal: spacing(6),
  },
  logo: { width: 110, height: 110, resizeMode: 'contain', alignSelf: 'center', marginBottom: spacing(2) },
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
