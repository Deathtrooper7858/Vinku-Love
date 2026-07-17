import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import es from '../locales/es.json';

const LANGUAGE_STORAGE_KEY = '@vinku_love_language';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  
  // Use saved language or device language, fallback to 'es'
  const deviceLanguage = getLocales()[0]?.languageCode;
  const language = savedLanguage || deviceLanguage || 'es';

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });
};

initI18n();

export default i18n;

export const changeLanguage = async (lng: string) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  i18n.changeLanguage(lng);
};
