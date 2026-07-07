import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { HomeScreen } from '../screens/HomeScreen';
import { MuralScreen } from '../screens/MuralScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { PetScreen } from '../screens/PetScreen';

const Tab = createBottomTabNavigator();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.line,
    primary: colors.teal,
    text: colors.ink,
  },
};

const TAB_ICONS: Record<string, string> = {
  Ahora: '🏠',
  Mural: '📝',
  Planes: '🗓️',
  Mascota: '🐣',
};

export function RootTabs() {
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
        <Tab.Screen name="Ahora" component={HomeScreen} />
        <Tab.Screen name="Mural" component={MuralScreen} />
        <Tab.Screen name="Planes" component={PlansScreen} />
        <Tab.Screen name="Mascota" component={PetScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
