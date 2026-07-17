import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { HomeScreen } from '../screens/HomeScreen';
import { MuralScreen } from '../screens/MuralScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { PetScreen } from '../screens/PetScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  now: '🏠',
  mural: '📝',
  plans: '🗓️',
  pet: '🐣',
  settings: '⚙️',
};

export function RootTabs() {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const systemScheme = useColorScheme();
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme !== 'light');

  const navTheme: Theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.surface,
      border: colors.line,
      primary: colors.teal,
      text: colors.ink,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.teal,
          tabBarInactiveTintColor: colors.inkFaint,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="now" options={{ title: t('home.title', 'Ahora') }} component={HomeScreen} />
        <Tab.Screen name="mural" options={{ title: t('mural.title', 'Mural') }} component={MuralScreen} />
        <Tab.Screen name="plans" options={{ title: t('plans.title', 'Planes') }} component={PlansScreen} />
        <Tab.Screen name="pet" options={{ title: t('pet.title', 'Mascota') }} component={PetScreen} />
        <Tab.Screen name="settings" options={{ title: t('settings.title', 'Ajustes') }} component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
