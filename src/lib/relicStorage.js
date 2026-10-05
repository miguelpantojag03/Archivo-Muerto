import { DEMO_RELICS }  from '../data/mockRelics.js'
import { RELICS_KEY }   from '../constants/storageKeys.js'

const DEMO_USER_ID = 'user_demo_001'

// ── Migration: add new fields to old relic objects ────────────────
function migrate(relic) {
  return {
    status:      relic.status      ?? (relic.revived ? 'revived' : 'archived'),
    tags:        relic.tags        ?? [],
    notes:       relic.notes       ?? '',
    responsible: relic.responsible ?? '',
    coverImage:  relic.coverImage  ?? null,
    createdAt:   relic.createdAt   ?? relic.created   ?? new Date().toISOString(),
    discardedAt: relic.discardedAt ?? relic.discarded ?? new Date().toISOString(),
    updatedAt:   relic.updatedAt   ?? new Date().toISOString(),
    ...relic,
  }
}

// ── Safe write with QuotaExceededError handling ───────────────────
function safeSave(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return { ok: true }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.error('[relicStorage] localStorage quota exceeded. Could not save relics.')
      return { ok: false, error: 'quota' }
    }
    console.error('[relicStorage] Unexpected write error:', err)
    return { ok: false, error: 'unknown' }
  }
}

export function getRelics(userId) {
  try {
    const raw = localStorage.getItem(RELICS_KEY(userId))
    if (raw) {
      const parsed   = JSON.parse(raw)
      const migrated = parsed.map(migrate)
      const changed  = migrated.some((r, i) =>
        r.status     !== parsed[i].status ||
        r.createdAt  !== parsed[i].createdAt ||
        r.coverImage !== parsed[i].coverImage
      )
      if (changed) safeSave(RELICS_KEY(userId), migrated)
      return migrated
    }
    if (userId === DEMO_USER_ID) {
      const seeded = DEMO_RELICS.map(migrate)
      safeSave(RELICS_KEY(userId), seeded)
      return seeded
    }
    return []
  } catch { return [] }
}

// Returns { ok, error? }
export function saveRelics(userId, relics) {
  return safeSave(RELICS_KEY(userId), relics)
}

export function addRelic(userId, relic) {
  const relics  = getRelics(userId)
  const updated = [migrate(relic), ...relics]
  const result  = saveRelics(userId, updated)
  if (!result.ok) throw new Error(result.error === 'quota'
    ? 'Storage is full. Try removing some relics or clearing old data.'
    : 'Could not save relic. Please try again.')
  return updated
}

export function updateRelic(userId, id, patch) {
  const relics = getRelics(userId).map(r =>
    r.id === id ? migrate({ ...r, ...patch, updatedAt: new Date().toISOString() }) : r
  )
  const result = saveRelics(userId, relics)
  if (!result.ok) throw new Error(result.error === 'quota'
    ? 'Storage is full. Could not save changes.'
    : 'Could not update relic. Please try again.')
  return relics
}

export function deleteRelic(userId, id) {
  const relics = getRelics(userId).filter(r => r.id !== id)
  saveRelics(userId, relics)
  return relics
}
