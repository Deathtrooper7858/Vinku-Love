import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { radius, spacing, GRADIENTS } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../lib/i18n';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCouple } from '../context/CoupleContext';

export function SettingsScreen() {
  const { userId } = useCouple();
  const { colors, mode, setMode } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';

  const [loadingUnlink, setLoadingUnlink] = useState(false);

  const handleSetMode = (m: 'light' | 'dark' | 'system') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(m);
  };

  const handleSetLanguage = (lng: 'en' | 'es') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    changeLanguage(lng);
  };

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem('@vinku_love_theme_mode');
    } catch (_) {}
    await supabase.auth.signOut();
  };

  const handleUnlink = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      t('settings.unlinkTitle', 'Romper vínculo'),
      t('settings.unlinkBody', '¿Estás seguro de que quieres romper el vínculo con tu pareja? Tendrás que volver a invitarla o ingresar su código.'),
      [
        { text: t('common.cancel', 'Cancelar'), style: 'cancel' },
        { 
          text: t('settings.unlinkConfirm', 'Sí, romper vínculo'), 
          style: 'destructive',
          onPress: async () => {
            setLoadingUnlink(true);
            const { error } = await supabase
              .from('couple_members')
              .delete()
              .eq('user_id', userId);
            
            setLoadingUnlink(false);
            if (!error) {
              // Sign out to force re-evaluation of couple state from scratch
              await supabase.auth.signOut();
            } else {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={isDark ? GRADIENTS.bgDark : GRADIENTS.bgLight} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.header}>
          {t('settings.title', 'Settings')}
        </Animated.Text>

        {/* --- Theme --- */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.theme', 'Theme')}</Text>
          <View style={styles.optionRow}>
            {(['dark', 'light', 'system'] as const).map((m) => {
              const isActive = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => handleSetMode(m)}
                >
                  <LinearGradient
                    colors={isActive ? GRADIENTS.teal : [colors.surfaceAlt, colors.surfaceAlt]}
                    style={[styles.optionChip, isActive && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {m === 'dark'
                        ? `🌙 ${t('settings.darkMode', 'Dark')}`
                        : m === 'light'
                        ? `☀️ ${t('settings.lightMode', 'Light')}`
                        : `📱 ${t('settings.systemMode', 'System')}`}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* --- Language --- */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language', 'Language')}</Text>
          <View style={styles.optionRow}>
            {(['es', 'en'] as const).map((lng) => {
              const isActive = currentLang === lng;
              return (
                <Pressable
                  key={lng}
                  onPress={() => handleSetLanguage(lng)}
                >
                  <LinearGradient
                    colors={isActive ? GRADIENTS.teal : [colors.surfaceAlt, colors.surfaceAlt]}
                    style={[styles.optionChip, isActive && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {lng === 'es' ? `🇪🇸 ${t('settings.spanish', 'Español')}` : `🇺🇸 ${t('settings.english', 'English')}`}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* --- Actions --- */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Pressable style={styles.actionBtn} onPress={handleSignOut}>
            <LinearGradient colors={GRADIENTS.purple} style={styles.actionGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
              <Text style={styles.actionText}>{t('settings.signOut', 'Cerrar sesión')}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable 
            style={[styles.actionBtn, { marginTop: spacing(3) }]} 
            onPress={handleUnlink}
            disabled={loadingUnlink}
          >
            <LinearGradient colors={[colors.danger, colors.danger]} style={styles.actionGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
              <Text style={styles.actionText}>
                {loadingUnlink ? 'Cargando...' : t('settings.unlink', '💔 Romper vínculo')}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    screen: { flex: 1 },
    scroll: { padding: spacing(4), paddingTop: Platform.OS === 'ios' ? spacing(12) : spacing(10), paddingBottom: spacing(24) },
    header: {
      color: colors.ink,
      fontSize: 24,
      fontWeight: '900',
      marginBottom: spacing(6),
    },
    section: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      padding: spacing(4),
      marginBottom: spacing(4),
    },
    sectionLabel: {
      color: colors.inkSoft,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: spacing(3),
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionChip: {
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    optionChipActive: {
      borderColor: 'transparent',
    },
    optionText: {
      color: colors.inkSoft,
      fontWeight: '800',
      fontSize: 13,
    },
    optionTextActive: {
      color: '#FFF',
    },
    actionBtn: {
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    actionGradient: {
      paddingVertical: spacing(3.5),
      alignItems: 'center',
    },
    actionText: {
      color: '#fff',
      fontWeight: '900',
      fontSize: 15,
      letterSpacing: 0.5,
    },
  });
