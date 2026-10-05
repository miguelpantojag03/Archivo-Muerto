// ─── useRelics ────────────────────────────────────────────────────
// All relic state: CRUD, filtering, searching, sorting, section nav.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getRelics, addRelic, updateRelic, deleteRelic } from '../lib/relicStorage.js'
import { deleteAttachmentsForRelic }                     from '../lib/attachmentStorage.js'

// sort helpers
function sortFn(field, dir) {
  return (a, b) => {
    let va, vb
    if (field === 'title')    { va = a.title?.toLowerCase()??'';      vb = b.title?.toLowerCase()??'' }
    else if (field === 'category') { va = a.category??'';             vb = b.category??'' }
    else if (field === 'status')   { va = a.status??'';               vb = b.status??'' }
    else /* date */            { va = a.discardedAt??a.discarded??''; vb = b.discardedAt??b.discarded??'' }
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ?  1 : -1
    return 0
  }
}

export function useRelics(userId) {
  const [relics,     setRelics]     = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [filter,     setFilter]     = useState('all')      // 'all'|'visuals'|'drafts'
  const [section,    setSection]    = useState('gallery')  // 'gallery'|'recent'|'revived'|'deleted'
  const [search,     setSearch]     = useState('')
  const [sortField,  setSortField]  = useState('date')     // 'date'|'title'|'category'|'status'
  const [sortDir,    setSortDir]    = useState('desc')     // 'asc'|'desc'
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    const data = getRelics(userId)
    setRelics(data)
    const revived = data.find(r => r.revived)
    setSelectedId(revived?.id ?? data[0]?.id ?? null)
    setLoading(false)
  }, [userId])

  // toggle sort: same field → flip dir; new field → desc
  function cycleSort(field) {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(field); setSortDir('desc') }
  }

  // derived list: section → filter → search → sort
  const visible = useMemo(() => {
    let list = relics

    // section filter
    if (section === 'recent')  list = [...list].sort(sortFn('date','desc')).slice(0, 10)
    else if (section === 'revived') list = list.filter(r => r.revived)
    else if (section === 'deleted') list = [] // placeholder for soft-delete feature

    // category filter (only in gallery)
    if (section === 'gallery') {
      if (filter === 'visuals') list = list.filter(r => r.filter === 'visuals')
      else if (filter === 'drafts') list = list.filter(r => r.filter === 'drafts')
    }

    // search
    const q = search.toLowerCase().trim()
    if (q) list = list.filter(r =>
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.responsible?.toLowerCase().includes(q) ||
      (r.tags ?? []).some(t => t.toLowerCase().includes(q))
    )

    // sort (recent section already sorted)
    if (section !== 'recent') list = [...list].sort(sortFn(sortField, sortDir))

    return list
  }, [relics, section, filter, search, sortField, sortDir])

  const selected = useMemo(() => relics.find(r => r.id === selectedId) ?? null, [relics, selectedId])

  // stats
  const stats = useMemo(() => ({
    total:        relics.length,
    revived:      relics.filter(r => r.revived).length,
    archived:     relics.filter(r => !r.revived).length,
    withCover:    relics.filter(r => r.coverImage).length,
  }), [relics])

  // CRUD
  const add = useCallback((relic) => {
    if (!userId) return
    try {
      const updated = addRelic(userId, relic)
      setRelics(updated)
      setSelectedId(relic.id)
      return updated
    } catch (err) { throw err }
  }, [userId])

  const update = useCallback((id, patch) => {
    if (!userId) return
    try {
      const updated = updateRelic(userId, id, patch)
      setRelics(updated)
      return updated
    } catch (err) { throw err }
  }, [userId])

  const remove = useCallback(async (id) => {
    if (!userId) return
    await deleteAttachmentsForRelic(id)
    const updated = deleteRelic(userId, id)
    setRelics(updated)
    if (selectedId === id) setSelectedId(updated[0]?.id ?? null)
    return updated
  }, [userId, selectedId])

  const revive = useCallback((id) => update(id, {
    revived: true, status: 'revived', revivedAt: new Date().toISOString(),
  }), [update])

  return {
    relics, visible, selected, selectedId, setSelectedId,
    filter, setFilter,
    section, setSection,
    search, setSearch,
    sortField, sortDir, cycleSort,
    loading, stats,
    add, update, remove, revive,
  }
}
