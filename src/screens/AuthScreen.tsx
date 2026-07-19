import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { radius, spacing, GRADIENTS } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export function AuthScreen() {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const [modeAuth, setModeAuth] = useState<'signIn' | 'signUp'>('signIn');
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
    if (modeAuth === 'signUp' && !name.trim()) {
      setError(t('auth.errorName', 'Escribe tu nombre.'));
      return;
    }
    setLoading(true);
    try {
      if (modeAuth === 'signUp') {
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
    <LinearGradient colors={isDark ? GRADIENTS.bgDark : GRADIENTS.bgLight} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center' }}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.slogan}>{t('auth.slogan', 'Every heartbeat together.')}</Text>
          <Text style={styles.subtitle}>
            {modeAuth === 'signUp' ? t('auth.createAccount', 'Crea tu cuenta para conectarte con tu pareja') : t('auth.signIn', 'Inicia sesión')}
          </Text>
        </Animated.View>

        {modeAuth === 'signUp' && (
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
            <LinearGradient colors={GRADIENTS.purple} style={styles.primaryGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>{modeAuth === 'signUp' ? t('auth.createBtn', 'Crear cuenta') : t('auth.enterBtn', 'Entrar')}</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => setModeAuth(modeAuth === 'signUp' ? 'signIn' : 'signUp')}>
            <Text style={styles.switchText}>
              {modeAuth === 'signUp' ? t('auth.alreadyHaveAccount', '¿Ya tienes cuenta? Inicia sesión') : t('auth.noAccount', '¿No tienes cuenta? Regístrate')}
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing(6),
  },
  logo: { width: 120, height: 120, resizeMode: 'contain', alignSelf: 'center', marginBottom: spacing(2) },
  slogan: { fontSize: 15, fontWeight: '600', color: colors.coral, textAlign: 'center', marginBottom: spacing(4), fontStyle: 'italic' },
  subtitle: { fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginBottom: spacing(8), fontWeight: '700' },
  input: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
    color: colors.ink,
    marginBottom: spacing(3),
    fontSize: 15,
  },
  error: { color: colors.danger, fontSize: 12, marginBottom: spacing(3), textAlign: 'center', fontWeight: '800' },
  primaryBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing(2),
    marginBottom: spacing(5),
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryGradient: {
    paddingVertical: spacing(3.5),
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  switchText: { color: colors.inkSoft, textAlign: 'center', fontSize: 13, fontWeight: '800' },
});
