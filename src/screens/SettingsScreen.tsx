import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../lib/i18n';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { t, i18n } = useTranslation();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';

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
    // Clear any sensitive cached preferences before signing out
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem('@vinku_love_theme_mode');
      // Note: Language preference is intentionally kept so the user doesn't have to reset it
    } catch (_) {}
    await supabase.auth.signOut();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.header}>
        {t('settings.title', 'Settings')}
      </Animated.Text>

      {/* --- Theme --- */}
      <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.theme', 'Theme')}</Text>
        <View style={styles.optionRow}>
          {(['dark', 'light', 'system'] as const).map((m) => (
            <Pressable
              key={m}
              style={[styles.optionChip, mode === m && styles.optionChipActive]}
              onPress={() => handleSetMode(m)}
            >
              <Text style={[styles.optionText, mode === m && styles.optionTextActive]}>
                {m === 'dark'
                  ? `🌙 ${t('settings.darkMode', 'Dark')}`
                  : m === 'light'
                  ? `☀️ ${t('settings.lightMode', 'Light')}`
                  : `📱 ${t('settings.systemMode', 'System')}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* --- Language --- */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionLabel}>{t('settings.language', 'Language')}</Text>
        <View style={styles.optionRow}>
          {(['es', 'en'] as const).map((lng) => (
            <Pressable
              key={lng}
              style={[styles.optionChip, currentLang === lng && styles.optionChipActive]}
              onPress={() => handleSetLanguage(lng)}
            >
              <Text style={[styles.optionText, currentLang === lng && styles.optionTextActive]}>
                {lng === 'es' ? `🇪🇸 ${t('settings.spanish', 'Español')}` : `🇺🇸 ${t('settings.english', 'English')}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* --- Sign out --- */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>{t('settings.signOut', 'Sign out')}</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: spacing(4), paddingBottom: spacing(12) },
    header: {
      color: colors.ink,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: spacing(6),
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing(4),
      marginBottom: spacing(4),
    },
    sectionLabel: {
      color: colors.inkSoft,
      fontSize: 11,
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
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.line,
    },
    optionChipActive: {
      backgroundColor: colors.teal,
      borderColor: colors.teal,
    },
    optionText: {
      color: colors.inkSoft,
      fontWeight: '700',
      fontSize: 13,
    },
    optionTextActive: {
      color: '#0A1F1C',
    },
    signOutBtn: {
      backgroundColor: colors.danger,
      borderRadius: radius.md,
      paddingVertical: spacing(3),
      alignItems: 'center',
    },
    signOutText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 14,
    },
  });
