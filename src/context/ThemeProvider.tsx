import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, radius, spacing, typography } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: typeof darkColors;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  colors: darkColors,
  radius,
  spacing,
  typography,
});

const THEME_STORAGE_KEY = '@vinku_love_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load saved theme
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedMode) => {
      if (savedMode) {
        setModeState(savedMode as ThemeMode);
      }
    });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const activeTheme = mode === 'system' ? systemColorScheme : mode;
  const colors = activeTheme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors, radius, spacing, typography }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
