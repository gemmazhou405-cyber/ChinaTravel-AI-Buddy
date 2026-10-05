import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import campaignEn from './campaign/en.json';
import campaignZh from './campaign/zh.json';

const savedLanguage = typeof window !== 'undefined' ? window.localStorage?.getItem('chinaease-lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { ...en, campaign: campaignEn },
    zh: { translation: {}, campaign: campaignZh },
    fr,
    de,
    es,
    ja,
    ko,
  },
  lng: savedLanguage || 'en',
  fallbackLng: 'en',
  fallbackNS: 'translation',
  interpolation: { escapeValue: false },
});

export default i18n;
