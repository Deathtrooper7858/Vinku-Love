import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
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
      const { data: coupleId, error } = await supabase.rpc('create_couple', { p_invite_code: code });
      
      if (error) throw error;

      setMyCode(code);
      setPendingCoupleId(coupleId);
      setMode('created');

      // Espera a que la pareja se una (polling ligero)
      const interval = setInterval(async () => {
        const { data: members } = await supabase
          .from('couple_members')
          .select('profile_id')
          .eq('couple_id', coupleId);
        if (members && members.length >= 2) {
          clearInterval(interval);
          onCoupleReady(coupleId);
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

      onCoupleReady(coupleId);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo unir a la pareja.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'created') {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center' }}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>{t('setup.shareCode', 'Comparte este código')}</Text>
          <Text style={styles.subtitle}>{t('setup.shareCodeSub', 'Tu pareja debe ingresarlo para conectarse contigo')}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.codeBox}>
          <Text style={styles.codeText}>{myCode}</Text>
        </Animated.View>
        <ActivityIndicator color={colors.teal} style={{ marginTop: spacing(6) }} />
        <Text style={styles.waiting}>{t('setup.waiting', 'Esperando a que tu pareja se una...')}</Text>
      </View>
    );
  }

  if (mode === 'join') {
    return (
      <View style={styles.container}>
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
            {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.primaryBtnText}>{t('setup.connect', 'Conectar')}</Text>}
          </Pressable>
          <Pressable onPress={() => setMode('choose')}>
            <Text style={styles.switchText}>{t('setup.goBack', 'Volver')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center' }}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>{t('setup.title', 'Conéctate con tu pareja')}</Text>
        <Text style={styles.subtitle}>{t('setup.subtitle', 'Uno crea el código, el otro lo ingresa. Así de simple.')}</Text>
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Pressable style={styles.primaryBtn} onPress={createCouple} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.primaryBtnText}>{t('setup.createCode', 'Crear código')}</Text>}
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => setMode('join')}>
          <Text style={styles.secondaryBtnText}>{t('setup.haveCode', 'Tengo un código')}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
