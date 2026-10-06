import i18n from '../i18n/index.js'

const LOCALE_MAP = { es: 'es-ES', en: 'en-US' }

// Locale-aware short date, e.g. "12 mar 2026" (es) vs "Mar 12, 2026" (en)
export function formatDate(value) {
  if (!value) return '—'
  try {
    if (!String(value).includes('T')) return value // already a pre-formatted display string
    const d = new Date(value)
    return new Intl.DateTimeFormat(LOCALE_MAP[i18n.language] || 'es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
  } catch { return value }
}
