// ─── AI Key Storage ───────────────────────────────────────────────
// The API key is stored in localStorage so the user only enters it once.
// ⚠️ For production, route API calls through your own backend proxy
//    so the key is never exposed to the browser.

const AI_KEY_STORAGE = 'am_ai_key'

export function getAIKey()       { return localStorage.getItem(AI_KEY_STORAGE) ?? '' }
export function setAIKey(key)    { localStorage.setItem(AI_KEY_STORAGE, key.trim()) }
export function clearAIKey()     { localStorage.removeItem(AI_KEY_STORAGE) }
export function hasAIKey()       { return !!getAIKey() }
