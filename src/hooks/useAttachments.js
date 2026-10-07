// ─── useAttachments ───────────────────────────────────────────────
// Manages the attachment list for a single relic.
// Handles loading, adding, deleting and error states.

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getAttachments,
  addAttachment,
  deleteAttachment,
  downloadAttachment,
  createPreviewURL,
} from '../lib/attachmentStorage.js'
import { validateFile } from '../constants/fileTypes.js'

export function useAttachments(relicId, userId) {
  const { t } = useTranslation()
  const [attachments, setAttachments] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  // ── Load attachments when relicId changes ─────────────────────
  useEffect(() => {
    if (!relicId) { setAttachments([]); return }
    setLoading(true)
    setError(null)
    getAttachments(relicId)
      .then(data => setAttachments(data))
      .catch(() => setError(t('attachments.errors.loadFailed')))
      .finally(() => setLoading(false))
  }, [relicId, t])

  // ── Add one or more files ─────────────────────────────────────
  const addFiles = useCallback(async (files) => {
    if (!relicId || !userId) return []
    const fileArray = Array.from(files)
    const errors    = []

    // Validate each file before storing anything
    for (const file of fileArray) {
      const err = validateFile(file, t)
      if (err) { errors.push({ file: file.name, message: err }); }
    }
    if (errors.length) {
      const msg = errors.map(e => `• ${e.file}: ${e.message}`).join('\n')
      throw new Error(msg)
    }

    // Check for duplicates by name within this relic
    const existing = attachments.map(a => a.originalName.toLowerCase())
    const dupes    = fileArray.filter(f => existing.includes(f.name.toLowerCase()))
    if (dupes.length) {
      throw new Error(t('attachments.errors.alreadyAttached', {
        count: dupes.length,
        files: dupes.map(d => d.name).join(', '),
      }))
    }

    setLoading(true)
    setError(null)
    try {
      const added = await Promise.all(
        fileArray.map(f => addAttachment(relicId, userId, f))
      )
      setAttachments(prev => [...prev, ...added])
      return added
    } catch (err) {
      setError(t('attachments.errors.saveFailed'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [relicId, userId, attachments, t])

  // ── Delete ────────────────────────────────────────────────────
  const remove = useCallback(async (attId) => {
    setError(null)
    try {
      await deleteAttachment(attId)
      setAttachments(prev => prev.filter(a => a.id !== attId))
    } catch (err) {
      setError(t('attachments.errors.deleteFailed'))
      throw err
    }
  }, [t])

  // ── Download (Save As…) ───────────────────────────────────────
  const download = useCallback((att) => {
    try {
      downloadAttachment(att)
    } catch {
      setError(t('attachments.errors.downloadFailed'))
    }
  }, [t])

  // ── Open for preview (returns a temporary object URL) ─────────
  const getPreviewURL = useCallback((att) => {
    try {
      return createPreviewURL(att)
    } catch {
      setError(t('attachments.errors.previewFailed'))
      return null
    }
  }, [t])

  return {
    attachments,
    loading,
    error,
    setError,
    addFiles,
    remove,
    download,
    getPreviewURL,
  }
}
