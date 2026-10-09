// ─── useDrafts ────────────────────────────────────────────────────
// Manages the draft list for a single relic — open variants in
// progress, before one gets "promoted" to the relic's own content.

import { useState, useEffect, useCallback } from 'react'
import { getDrafts, addDraft, updateDraft, deleteDraft } from '../lib/draftStorage.js'

export function useDrafts(relicId, userId) {
  const [drafts,  setDrafts]  = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!relicId) { setDrafts([]); return }
    let cancelled = false
    setLoading(true)
    getDrafts(relicId).then(data => { if (!cancelled) setDrafts(data) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [relicId])

  const create = useCallback(async ({ label, title, description, notes, originDraftId } = {}) => {
    if (!relicId || !userId) return
    const draft = await addDraft(relicId, userId, {
      label: label ?? null, title: title ?? '', description: description ?? '', notes: notes ?? '', originDraftId: originDraftId ?? null,
    })
    setDrafts(prev => [...prev, draft])
    return draft
  }, [relicId, userId])

  const update = useCallback(async (id, patch) => {
    await updateDraft(id, patch)
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d))
  }, [])

  const remove = useCallback(async (id) => {
    await deleteDraft(id)
    setDrafts(prev => prev.filter(d => d.id !== id))
  }, [])

  const archive = useCallback((id, reason) => update(id, { status: 'archived', archivedReason: reason ?? null }), [update])

  return { drafts, loading, create, update, remove, archive }
}
