import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth }    from '../auth/AuthProvider.jsx'
import { useToast }   from '../components/Toast.jsx'
import { useRelics }  from '../hooks/useRelics.js'
import { useConfirm } from '../components/ConfirmModal.jsx'
import Sidebar         from '../components/Sidebar.jsx'
import TopBar          from '../components/TopBar.jsx'
import RelicCard       from '../components/RelicCard.jsx'
import RelicDetails    from '../components/RelicDetails.jsx'
import RevivalZone     from '../components/RevivalZone.jsx'
import NewRelicModal   from '../components/NewRelicModal.jsx'
import EditRelicModal  from '../components/EditRelicModal.jsx'

export default function Dashboard() {
  const { user, signOut }  = useAuth()
  const { push }           = useToast()
  const navigate           = useNavigate()
  const { confirm, ConfirmModalUI } = useConfirm()

  const {
    visible, selected, selectedId, setSelectedId,
    filter, setFilter, search, setSearch,
    add, update, remove, revive,
  } = useRelics(user?.id)

  const [dragOver,    setDragOver]    = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [editRelic,   setEditRelic]   = useState(null)  // relic being edited
  const dragIdRef                     = useRef(null)

  // ── Session expired event from AuthProvider ───────────────────
  useEffect(() => {
    async function handleExpired() {
      push('Your session expired. Please sign in again.', 'error', 6000)
      await signOut()
      navigate('/login', { replace: true })
    }
    window.addEventListener('am:session-expired', handleExpired)
    return () => window.removeEventListener('am:session-expired', handleExpired)
  }, [signOut, navigate, push])

  // ── Drag handlers ─────────────────────────────────────────────
  function handleDragStart(e, id) {
    dragIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (!dragIdRef.current) return
    revive(dragIdRef.current)
    setSelectedId(dragIdRef.current)
    push('Relic revived! 🎉', 'success')
    dragIdRef.current = null
  }

  // ── Relic actions ─────────────────────────────────────────────
  function handleRevive(id) {
    revive(id)
    push('Relic revived!', 'success')
  }

  async function handleDelete(id) {
    const relic = visible.find(r => r.id === id) ??
                  (selected?.id === id ? selected : null)
    const ok = await confirm({
      title:        'Delete relic forever?',
      message:      relic
        ? `"${relic.title}" and all its attachments will be permanently removed. This cannot be undone.`
        : 'This relic and all its attachments will be permanently removed.',
      danger:       true,
      confirmLabel: 'Delete Forever',
    })
    if (!ok) return
    await remove(id)
    push('Relic deleted forever.', 'info')
  }

  function handleAddRelic(relic) {
    add(relic)
    push('New relic added to the archive.', 'success')
  }

  function handleSaveEdit(id, patch) {
    update(id, patch)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0A0A1E', overflow: 'hidden' }}>

      {/* Confirm dialog (portal-like, rendered via hook) */}
      <ConfirmModalUI />

      {/* macOS chrome */}
      <div style={{
        height: 36, background: '#0A0A1E', borderBottom: '1px solid #1E1E3A',
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', flexShrink: 0,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
      </div>

      {/* 3-column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar user={user} />

        {/* Center column */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#14142B' }}>
          <TopBar
            search={search} setSearch={setSearch}
            filter={filter} setFilter={setFilter}
            onNewRelic={() => setShowNew(true)}
          />

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <div style={{ padding: '20px 20px 110px' }}>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: '#E8E8F0', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
                    The Archive
                  </h1>
                  <p style={{ fontSize: 12, color: '#7E7EA0', marginTop: 5, marginBottom: 0 }}>
                    Review discarded drafts from '{user?.activeProject || 'your projects'}' and other projects.
                  </p>
                </div>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, marginTop: 4,
                  background: '#1A1A35', border: '1px solid #2A2A48',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                  color: '#7E7EA0', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  SORT BY DATE DISCARDED <ChevronDown size={10} />
                </button>
              </div>

              {/* Grid */}
              {visible.length === 0 ? (
                <EmptyState onNew={() => setShowNew(true)} hasSearch={!!search} />
              ) : (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 14, marginTop: 20,
                }}>
                  {visible.map(r => (
                    <RelicCard
                      key={r.id}
                      relic={r}
                      isSelected={r.id === selectedId}
                      onSelect={setSelectedId}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Revival Zone */}
            <RevivalZone
              isDragOver={dragOver}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            />
          </div>
        </main>

        {/* Right panel */}
        <RelicDetails
          relic={selected}
          onRevive={handleRevive}
          onDelete={handleDelete}
          onEdit={relic => setEditRelic(relic)}
        />
      </div>

      {/* Modals */}
      {showNew && (
        <NewRelicModal
          onClose={() => setShowNew(false)}
          onAdd={handleAddRelic}
        />
      )}
      {editRelic && (
        <EditRelicModal
          relic={editRelic}
          onClose={() => setEditRelic(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ onNew, hasSearch }) {
  return (
    <div style={{
      marginTop: 32, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      minHeight: 200, borderRadius: 12, border: '1px dashed #2A2A48',
      color: '#3A3A5C', padding: 32,
    }}>
      <div style={{ fontSize: 13 }}>
        {hasSearch ? 'No relics match your search.' : 'Your archive is empty.'}
      </div>
      {!hasSearch && (
        <button
          onClick={onNew}
          style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#5B4BFF', color: 'white',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          + Add your first relic
        </button>
      )}
    </div>
  )
}
