// ─── AttachmentStorage — IndexedDB via idb ────────────────────────
// Stores file Blobs natively. No base64 inflation, no 5 MB limit.
// Each attachment is keyed by its own id; relicId is an index.
//
// Schema:
//   id            string    'att_<timestamp>_<random4>'
//   relicId       string    FK → relic.id
//   userId        string    FK → user.id
//   originalName  string    'contrato.pdf'
//   extension     string    'pdf'
//   mimeType      string    'application/pdf'
//   size          number    bytes
//   createdAt     string    ISO 8601
//   blob          Blob      the actual file data

import { openDB } from 'idb'
import { IDB_NAME, IDB_VERSION, IDB_STORE } from '../constants/storageKeys.js'

// ── Open / upgrade DB ─────────────────────────────────────────────
function getDB() {
  return openDB(IDB_NAME, IDB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        const store = db.createObjectStore(IDB_STORE, { keyPath: 'id' })
        store.createIndex('byRelic',  'relicId',         { unique: false })
        store.createIndex('byUser',   'userId',          { unique: false })
        store.createIndex('byRelicUser', ['relicId', 'userId'], { unique: false })
      }
    },
  })
}

function makeId() {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Store a new attachment.
 * @param {string} relicId
 * @param {string} userId
 * @param {File}   file      — native browser File object
 * @returns {Promise<Attachment>}
 */
export async function addAttachment(relicId, userId, file) {
  const db  = await getDB()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const att = {
    id:           makeId(),
    relicId,
    userId,
    originalName: file.name,
    extension:    ext,
    mimeType:     file.type || `application/${ext}`,
    size:         file.size,
    createdAt:    new Date().toISOString(),
    blob:         file,            // IndexedDB stores Blob natively
  }
  await db.put(IDB_STORE, att)
  return att
}

/**
 * Get all attachments for a relic.
 * @returns {Promise<Attachment[]>}
 */
export async function getAttachments(relicId) {
  const db = await getDB()
  return db.getAllFromIndex(IDB_STORE, 'byRelic', relicId)
}

/**
 * Get a single attachment by id.
 * @returns {Promise<Attachment|undefined>}
 */
export async function getAttachment(id) {
  const db = await getDB()
  return db.get(IDB_STORE, id)
}

/**
 * Delete a single attachment.
 */
export async function deleteAttachment(id) {
  const db = await getDB()
  await db.delete(IDB_STORE, id)
}

/**
 * Delete all attachments for a relic (called when a relic is deleted).
 */
export async function deleteAttachmentsForRelic(relicId) {
  const db   = await getDB()
  const atts = await db.getAllFromIndex(IDB_STORE, 'byRelic', relicId)
  const tx   = db.transaction(IDB_STORE, 'readwrite')
  await Promise.all([
    ...atts.map(a => tx.store.delete(a.id)),
    tx.done,
  ])
}

/**
 * Count attachments for a relic (lightweight — no blob transfer).
 * @returns {Promise<number>}
 */
export async function countAttachments(relicId) {
  const db = await getDB()
  return db.countFromIndex(IDB_STORE, 'byRelic', relicId)
}

/**
 * Get counts for multiple relicIds at once.
 * Returns Record<relicId, number>.
 * @returns {Promise<Record<string,number>>}
 */
export async function getAttachmentCounts(relicIds) {
  const db      = await getDB()
  const entries = await Promise.all(
    relicIds.map(async id => [id, await db.countFromIndex(IDB_STORE, 'byRelic', id)])
  )
  return Object.fromEntries(entries)
}

/**
 * Create an object URL for preview (caller must revoke when done).
 * @returns {string}
 */
export function createPreviewURL(attachment) {
  return URL.createObjectURL(attachment.blob)
}

/**
 * Trigger a "Save As…" download dialog for an attachment.
 */
export function downloadAttachment(attachment) {
  const url = URL.createObjectURL(attachment.blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = attachment.originalName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
