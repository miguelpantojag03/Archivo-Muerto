// ─── fsPaths ──────────────────────────────────────────────────────
// Resolves and lazily creates the on-disk roots for attachments and
// cover images, under the app's local-data dir (not the roaming
// AppConfig dir the .db file lives in — binaries don't belong there).

import { join, appLocalDataDir } from '@tauri-apps/api/path'
import { mkdir } from '@tauri-apps/plugin-fs'

let attachmentsRoot = null
let coversRoot = null
let linkedCopiesRoot = null

export async function getAttachmentsDir() {
  if (!attachmentsRoot) {
    attachmentsRoot = await join(await appLocalDataDir(), 'attachments')
    await mkdir(attachmentsRoot, { recursive: true })
  }
  return attachmentsRoot
}

export async function getCoversDir() {
  if (!coversRoot) {
    coversRoot = await join(await appLocalDataDir(), 'covers')
    await mkdir(coversRoot, { recursive: true })
  }
  return coversRoot
}

// Internal backup copies of externally-linked files ("Asegurar copia").
export async function getLinkedCopiesDir() {
  if (!linkedCopiesRoot) {
    linkedCopiesRoot = await join(await appLocalDataDir(), 'linked_copies')
    await mkdir(linkedCopiesRoot, { recursive: true })
  }
  return linkedCopiesRoot
}
