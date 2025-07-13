import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import de from './locales/de.json';
import en from './locales/en.json';

const resources = {
  de: {
    translation: de
  },
  en: {
    translation: en
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    lng: 'de', // Default language (German as primary)
    fallbackLng: 'de', // Fallback language
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n;