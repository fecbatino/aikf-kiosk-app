import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importiere Übersetzungsdateien
import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';
import translationFR from './locales/fr/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
  en: { translation: translationEN },
  de: { translation: translationDE },
  fr: { translation: translationFR },
  ar: { translation: translationAR },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "de", // Standard-Sprache

    keySeparator: false, // Wir verwenden keine Keys mit Punkten

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;