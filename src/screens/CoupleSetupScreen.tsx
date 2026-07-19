import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { radius, spacing, GRADIENTS } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function CoupleSetupScreen({
  userId,
  onCoupleReady,
}: {
  userId: string;
  onCoupleReady: (coupleId: string, isSolo: boolean) => void;
}) {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const [setupMode, setSetupMode] = useState<'choose' | 'created' | 'join'>('choose');
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
      const { data: coupleId, error } = await supabase.rpc('create_couple', { p_invite_code: code });
      
      if (error) throw error;

      setMyCode(code);
      setPendingCoupleId(coupleId);
      setSetupMode('created');

      const interval = setInterval(async () => {
        const { data: members } = await supabase
          .from('couple_members')
          .select('profile_id')
          .eq('couple_id', coupleId);
        if (members && members.length >= 2) {
          clearInterval(interval);
          onCoupleReady(coupleId, false);
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
      const { data: coupleId, error } = await supabase.rpc('join_couple', { p_invite_code: code });
      
      if (error) throw error;

      onCoupleReady(coupleId, false);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo unir a la pareja.');
    } finally {
      setLoading(false);
    }
  }

  if (setupMode === 'created') {
    return (
      <LinearGradient colors={isDark ? GRADIENTS.bgDark : GRADIENTS.bgLight} style={styles.container}>
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center' }}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>{t('setup.shareCode', 'Comparte este código')}</Text>
          <Text style={styles.subtitle}>{t('setup.shareCodeSub', 'Tu pareja debe ingresarlo para conectarse contigo')}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <LinearGradient colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.2)'] as [string, string] : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.5)'] as [string, string]} style={styles.codeBox}>
            <Text style={styles.codeText}>{myCode}</Text>
          </LinearGradient>
        </Animated.View>
        <ActivityIndicator color={colors.teal} style={{ marginTop: spacing(6) }} />
        <Text style={styles.waiting}>{t('setup.waiting', 'Esperando a que tu pareja se una...')}</Text>
        
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Pressable 
            style={[styles.primaryBtn, { marginTop: spacing(8) }]} 
            onPress={() => pendingCoupleId && onCoupleReady(pendingCoupleId, true)}
          >
            <LinearGradient colors={GRADIENTS.purple} style={styles.primaryGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
              <Text style={styles.primaryBtnText}>{t('setup.enterSolo', 'Entrar a la app mientras espero')}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    );
  }

  if (setupMode === 'join') {
    return (
      <LinearGradient colors={isDark ? GRADIENTS.bgDark : GRADIENTS.bgLight} style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1, justifyContent: 'center'}}>
          <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center' }}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>{t('setup.enterCode', 'Ingresa el código')}</Text>
            <Text style={styles.subtitle}>{t('setup.enterCodeSub', 'El que te compartió tu pareja')}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
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
              <LinearGradient colors={GRADIENTS.purple} style={styles.primaryGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>{t('setup.connect', 'Conectar')}</Text>}
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setSetupMode('choose')}>
              <Text style={styles.switchText}>{t('setup.goBack', 'Volver')}</Text>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={isDark ? GRADIENTS.bgDark : GRADIENTS.bgLight} style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center' }}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>{t('setup.title', 'Conéctate con tu pareja')}</Text>
        <Text style={styles.subtitle}>{t('setup.subtitle', 'Uno crea el código, el otro lo ingresa. Así de simple.')}</Text>
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Pressable style={styles.primaryBtn} onPress={createCouple} disabled={loading}>
          <LinearGradient colors={GRADIENTS.purple} style={styles.primaryGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>{t('setup.createCode', 'Crear código')}</Text>}
          </LinearGradient>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => setSetupMode('join')}>
          <Text style={styles.secondaryBtnText}>{t('setup.haveCode', 'Tengo un código')}</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing(6) },
  logo: { width: 120, height: 120, resizeMode: 'contain', alignSelf: 'center', marginBottom: spacing(3) },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink, textAlign: 'center', marginBottom: spacing(2) },
  subtitle: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginBottom: spacing(8), fontWeight: '600' },
  codeBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingVertical: spacing(6),
    alignItems: 'center',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  codeText: { fontSize: 40, fontWeight: '900', color: colors.coral, letterSpacing: 8 },
  waiting: { color: colors.inkSoft, fontSize: 13, textAlign: 'center', marginTop: spacing(3), fontWeight: '800' },
  input: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
    color: colors.ink,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: spacing(3),
    fontWeight: '800',
  },
  error: { color: colors.danger, fontSize: 12, marginBottom: spacing(3), textAlign: 'center', fontWeight: '800' },
  primaryBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing(3),
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
  secondaryBtn: {
    borderRadius: radius.pill,
    paddingVertical: spacing(3.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  },
  secondaryBtnText: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  switchText: { color: colors.inkSoft, textAlign: 'center', fontSize: 13, fontWeight: '800', marginTop: spacing(4) },
});
