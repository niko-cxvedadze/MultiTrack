import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en.json'
import ka from '@/locales/ka.json'

export const languages = [
  { code: 'ka', name: 'ქართული' },
  { code: 'en', name: 'English' },
] as const

export type LanguageCode = (typeof languages)[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ka: { translation: ka },
    },
    fallbackLng: 'ka',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
