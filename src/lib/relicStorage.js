import { DEMO_RELICS } from '../data/mockRelics.js'

const DEMO_USER_ID = 'user_demo_001'

function key(userId) { return `am_relics_${userId}` }

export function getRelics(userId) {
  try {
    const raw = localStorage.getItem(key(userId))
    if (raw) return JSON.parse(raw)
    // Seed demo relics on first load for the demo user
    if (userId === DEMO_USER_ID) {
      localStorage.setItem(key(userId), JSON.stringify(DEMO_RELICS))
      return DEMO_RELICS
    }
    return []
  } catch { return [] }
}

export function saveRelics(userId, relics) {
  localStorage.setItem(key(userId), JSON.stringify(relics))
}

export function addRelic(userId, relic) {
  const relics = getRelics(userId)
  const updated = [relic, ...relics]
  saveRelics(userId, updated)
  return updated
}

export function updateRelic(userId, id, patch) {
  const relics = getRelics(userId).map(r => r.id === id ? { ...r, ...patch } : r)
  saveRelics(userId, relics)
  return relics
}

export function deleteRelic(userId, id) {
  const relics = getRelics(userId).filter(r => r.id !== id)
  saveRelics(userId, relics)
  return relics
}
