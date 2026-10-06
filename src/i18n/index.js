import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es/common.json'
import en from './locales/en/common.json'
import { LANG_KEY } from '../constants/storageKeys.js'

function readStoredLang() {
  try {
    const raw = localStorage.getItem(LANG_KEY)
    return raw === 'es' || raw === 'en' ? raw : 'es'
  } catch { return 'es' }
}

i18n.use(initReactI18next).init({
  resources: {
    es: { common: es },
    en: { common: en },
  },
  lng: readStoredLang(),
  fallbackLng: 'es',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export function setLanguage(lang) {
  i18n.changeLanguage(lang)
  try { localStorage.setItem(LANG_KEY, lang) } catch {}
}

export default i18n
