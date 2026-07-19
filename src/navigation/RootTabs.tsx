import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeProvider';
import { HomeScreen } from '../screens/HomeScreen';
import { MuralScreen } from '../screens/MuralScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { PetScreen } from '../screens/PetScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  now: '🏠',
  mural: '📝',
  chat: '💬',
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
      background: 'transparent',
      card: 'transparent',
      border: 'transparent',
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
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={isDark ? ['rgba(26,26,46,0.9)', 'rgba(18,18,31,0.95)'] : ['rgba(255,255,255,0.9)', 'rgba(245,238,255,0.95)']}
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarIcon: ({ focused }) => (
            <View style={{ transform: [{ scale: focused ? 1.2 : 1 }] }}>
              <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name]}</Text>
            </View>
          ),
        })}
      >
        <Tab.Screen name="now" options={{ title: t('home.title', 'Ahora') }} component={HomeScreen} />
        <Tab.Screen name="mural" options={{ title: t('mural.title', 'Mural') }} component={MuralScreen} />
        <Tab.Screen name="chat" options={{ title: t('chat.title', 'Chat') }} component={ChatScreen} />
        <Tab.Screen name="plans" options={{ title: t('plans.title', 'Planes') }} component={PlansScreen} />
        <Tab.Screen name="pet" options={{ title: t('pet.title', 'Mascota') }} component={PetScreen} />
        <Tab.Screen name="settings" options={{ title: t('settings.title', 'Ajustes') }} component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
