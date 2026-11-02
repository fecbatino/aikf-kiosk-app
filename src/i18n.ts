import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importiere Übersetzungsdateien
import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';
import translationFR from './locales/fr/translation.json';
import translationAR from './locales/ar/translation.json';
import legal from './locales/legal.json';

const resources = {
  en: { translation: translationEN, legal: { content: legal.en } },
  de: { translation: translationDE, legal: { content: legal.de } },
  fr: { translation: translationFR, legal: { content: legal.fr } },
  ar: { translation: translationAR, legal: { content: legal.ar } },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "de",
    fallbackLng: "de", // Standard-Sprache

    keySeparator: false, // Wir verwenden keine Keys mit Punkten

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;