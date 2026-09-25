// ─── useRelics ────────────────────────────────────────────────────
// Encapsulates all relic state, CRUD, filtering and search so
// Dashboard.jsx becomes a pure layout compositor.

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getRelics, addRelic, updateRelic, deleteRelic,
} from '../lib/relicStorage.js'
import { deleteAttachmentsForRelic } from '../lib/attachmentStorage.js'

export function useRelics(userId) {
  const [relics,     setRelics]     = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [filter,     setFilter]     = useState('all')   // 'all'|'visuals'|'drafts'
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(true)

  // ── Load ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    const data = getRelics(userId)
    setRelics(data)
    const revived = data.find(r => r.revived)
    setSelectedId(revived?.id ?? data[0]?.id ?? null)
    setLoading(false)
  }, [userId])

  // ── Derived visible list ───────────────────────────────────────
  const visible = useMemo(() => {
    return relics.filter(r => {
      const okFilter =
        filter === 'all' ||
        (filter === 'visuals' && r.filter === 'visuals') ||
        (filter === 'drafts'  && r.filter === 'drafts')
      const q        = search.toLowerCase().trim()
      const okSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.toLowerCase().includes(q))
      return okFilter && okSearch
    })
  }, [relics, filter, search])

  const selected = useMemo(
    () => relics.find(r => r.id === selectedId) ?? null,
    [relics, selectedId]
  )

  // ── CRUD ──────────────────────────────────────────────────────
  const add = useCallback((relic) => {
    if (!userId) return
    const updated = addRelic(userId, relic)
    setRelics(updated)
    setSelectedId(relic.id)
    return updated
  }, [userId])

  const update = useCallback((id, patch) => {
    if (!userId) return
    const updated = updateRelic(userId, id, patch)
    setRelics(updated)
    return updated
  }, [userId])

  const remove = useCallback(async (id) => {
    if (!userId) return
    // Delete attachments from IndexedDB first
    await deleteAttachmentsForRelic(id)
    const updated = deleteRelic(userId, id)
    setRelics(updated)
    // Shift selection to next available relic
    if (selectedId === id) {
      setSelectedId(updated[0]?.id ?? null)
    }
    return updated
  }, [userId, selectedId])

  const revive = useCallback((id) => update(id, {
    revived:  true,
    status:   'revived',
    revivedAt: new Date().toISOString(),
  }), [update])

  return {
    relics,
    visible,
    selected,
    selectedId,
    setSelectedId,
    filter, setFilter,
    search, setSearch,
    loading,
    add, update, remove, revive,
  }
}
