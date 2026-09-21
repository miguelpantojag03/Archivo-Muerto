// ─── Storage helpers ───────────────────────────────────────────────
// Thin wrappers so the rest of the app never touches localStorage directly.

export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function storageSet(key, value, persistent = true) {
  const store = persistent ? localStorage : sessionStorage
  store.setItem(key, JSON.stringify(value))
}

export function storageRemove(key) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

export function storageGetLocal(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}

export function storageSetLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
