import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Image, Text } from 'react-native';
import { Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { supabase } from './src/lib/supabase';
import { registerPushToken } from './src/lib/notifications';
import { colors } from './src/theme';
import { AuthScreen } from './src/screens/AuthScreen';
import { CoupleSetupScreen } from './src/screens/CoupleSetupScreen';
import { RootTabs } from './src/navigation/RootTabs';
import { CoupleProvider } from './src/context/CoupleContext';
import './src/lib/i18n';
import { ThemeProvider } from './src/context/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [checkingCouple, setCheckingCouple] = useState(true);
  const notifListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setCheckingCouple(false);
      return;
    }
    setCheckingCouple(true);
    supabase
      .from('couple_members')
      .select('couple_id')
      .eq('profile_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setCoupleId(data?.couple_id ?? null);
        setCheckingCouple(false);
      });
  }, [session?.user?.id]);

  // Registrar token de push cuando hay sesión + pareja
  useEffect(() => {
    if (!session?.user?.id || !coupleId) return;
    registerPushToken(session.user.id);

    // Listener: notificación recibida con app en primer plano (solo log; ya se muestra por setNotificationHandler)
    notifListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Vinku-love] Notificación recibida:', notification.request.content.title);
    });

    // Listener: usuario tocó la notificación (se puede navegar a una pantalla específica)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Vinku-love] Notificación tocada:', response.notification.request.content.data);
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [session?.user?.id, coupleId]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <Text style={styles.slogan}>Conectando corazones</Text>
        <ActivityIndicator color={colors.teal} size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (session === null) return <AuthScreen />;

  if (checkingCouple) {
    return (
      <View style={styles.loading}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <Text style={styles.slogan}>Conectando corazones</Text>
        <ActivityIndicator color={colors.teal} size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!coupleId) {
    return <CoupleSetupScreen userId={session.user.id} onCoupleReady={setCoupleId} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <CoupleProvider userId={session.user.id} coupleId={coupleId}>
          <RootTabs />
        </CoupleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 16 },
  slogan: { color: colors.ink, fontSize: 16, fontWeight: '500', textAlign: 'center', opacity: 0.8 },
});
