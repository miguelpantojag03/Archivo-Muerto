// ─── db ───────────────────────────────────────────────────────────
// Single cached SQLite connection. The URL here must match, character
// for character, the one registered via add_migrations() in lib.rs.

import Database from '@tauri-apps/plugin-sql'

const DB_URL = 'sqlite:archivo_muerto.db'

let dbPromise = null

export function getDb() {
  if (!dbPromise) dbPromise = Database.load(DB_URL)
  return dbPromise
}
