// ─── Central storage key registry ─────────────────────────────────
// Import from here — never hardcode these strings elsewhere.

export const USERS_KEY      = 'am_users'
export const SESSION_KEY    = 'am_session'
export const RELICS_KEY     = (userId) => `am_relics_${userId}`
export const ACTION_LOG_KEY = (userId) => `am_log_${userId}`
export const THEME_KEY      = 'am_theme'      // 'light' | 'dark' | 'auto'
export const LANG_KEY       = 'am_lang'       // 'es' | 'en'

// IndexedDB
export const IDB_NAME       = 'archivo_muerto_db'
export const IDB_VERSION    = 1
export const IDB_STORE      = 'attachments'
