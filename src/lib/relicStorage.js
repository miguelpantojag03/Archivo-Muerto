import { DEMO_RELICS }         from '../data/mockRelics.js'
import { RELICS_KEY }          from '../constants/storageKeys.js'

const DEMO_USER_ID = 'user_demo_001'

// ── Migration: ensure legacy relics have the new fields ────────────
function migrate(relic) {
  return {
    // New fields with safe defaults so old data keeps working
    status:      relic.status      ?? (relic.revived ? 'revived' : 'archived'),
    tags:        relic.tags        ?? [],
    notes:       relic.notes       ?? '',
    responsible: relic.responsible ?? '',
    createdAt:   relic.createdAt   ?? relic.created   ?? new Date().toISOString(),
    discardedAt: relic.discardedAt ?? relic.discarded ?? new Date().toISOString(),
    updatedAt:   relic.updatedAt   ?? new Date().toISOString(),
    ...relic, // Original fields win over defaults
  }
}

export function getRelics(userId) {
  try {
    const raw = localStorage.getItem(RELICS_KEY(userId))
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate in-memory; persist if anything changed
      const migrated = parsed.map(migrate)
      const changed  = migrated.some((r, i) =>
        r.status !== parsed[i].status ||
        r.createdAt !== parsed[i].createdAt
      )
      if (changed) localStorage.setItem(RELICS_KEY(userId), JSON.stringify(migrated))
      return migrated
    }
    // Seed demo relics
    if (userId === DEMO_USER_ID) {
      const seeded = DEMO_RELICS.map(migrate)
      localStorage.setItem(RELICS_KEY(userId), JSON.stringify(seeded))
      return seeded
    }
    return []
  } catch { return [] }
}

export function saveRelics(userId, relics) {
  localStorage.setItem(RELICS_KEY(userId), JSON.stringify(relics))
}

export function addRelic(userId, relic) {
  const relics  = getRelics(userId)
  const updated = [migrate(relic), ...relics]
  saveRelics(userId, updated)
  return updated
}

export function updateRelic(userId, id, patch) {
  const relics  = getRelics(userId).map(r =>
    r.id === id ? migrate({ ...r, ...patch, updatedAt: new Date().toISOString() }) : r
  )
  saveRelics(userId, relics)
  return relics
}

export function deleteRelic(userId, id) {
  const relics = getRelics(userId).filter(r => r.id !== id)
  saveRelics(userId, relics)
  return relics
}
