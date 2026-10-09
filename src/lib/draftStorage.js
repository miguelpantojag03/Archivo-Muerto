// ─── draftStorage ─────────────────────────────────────────────────
// SQLite-backed draft CRUD. A draft is an in-progress variant of one
// specific active relic's content — not archived, not revived, no
// lifecycle of its own beyond open/archived. Promoting one copies its
// content into the parent relic; it never deletes sibling drafts.

import { getDb } from './db.js'

function makeId() {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function fromRow(row) {
  return {
    id: row.id,
    relicId: row.relic_id,
    userId: row.user_id,
    label: row.label,
    title: row.title,
    description: row.description,
    notes: row.notes,
    status: row.status,
    archivedReason: row.archived_reason,
    originDraftId: row.origin_draft_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** @returns {Promise<Draft[]>} all drafts (open + archived) for a relic, oldest first */
export async function getDrafts(relicId) {
  const db = await getDb()
  const rows = await db.select(`SELECT * FROM drafts WHERE relic_id=$1 ORDER BY created_at ASC`, [relicId])
  return rows.map(fromRow)
}

/** @returns {Promise<number>} open-draft count for a single relic (RelicCard badge) */
export async function countOpenDrafts(relicId) {
  const db = await getDb()
  const [row] = await db.select(
    `SELECT COUNT(*) as n FROM drafts WHERE relic_id=$1 AND status='open'`, [relicId]
  )
  return row?.n ?? 0
}

export async function addDraft(relicId, userId, { label = null, title, description = '', notes = '', originDraftId = null }) {
  const db = await getDb()
  const id = makeId()
  const now = new Date().toISOString()
  await db.execute(
    `INSERT INTO drafts (id,relic_id,user_id,label,title,description,notes,status,origin_draft_id,created_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'open',$8,$9,$10)`,
    [id, relicId, userId, label, title, description, notes, originDraftId, now, now]
  )
  return { id, relicId, userId, label, title, description, notes, status: 'open', archivedReason: null, originDraftId, createdAt: now, updatedAt: now }
}

const FIELD_MAP = {
  label: 'label', title: 'title', description: 'description', notes: 'notes',
  status: 'status', archivedReason: 'archived_reason',
}

/** Partial update — used for edits and for the autosave debounce. */
export async function updateDraft(id, patch) {
  const db = await getDb()
  const sets = []
  const vals = []
  let i = 1
  for (const [key, col] of Object.entries(FIELD_MAP)) {
    if (key in patch) { sets.push(`${col}=$${i++}`); vals.push(patch[key]) }
  }
  if (sets.length === 0) return
  sets.push(`updated_at=$${i++}`); vals.push(new Date().toISOString())
  await db.execute(`UPDATE drafts SET ${sets.join(',')} WHERE id=$${i}`, [...vals, id])
}

export async function deleteDraft(id) {
  const db = await getDb()
  await db.execute(`DELETE FROM drafts WHERE id=$1`, [id])
}
