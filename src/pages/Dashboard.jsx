import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useToast } from '../components/Toast.jsx'
import Sidebar from '../components/Sidebar.jsx'
import TopBar from '../components/TopBar.jsx'
import RelicCard from '../components/RelicCard.jsx'
import RelicDetails from '../components/RelicDetails.jsx'
import RevivalZone from '../components/RevivalZone.jsx'
import NewRelicModal from '../components/NewRelicModal.jsx'
import { getRelics, addRelic, updateRelic, deleteRelic } from '../lib/relicStorage.js'

// Check and notify about expired sessions on mount
const SESSION_KEY = 'am_session'

export default function Dashboard() {
  const { user } = useAuth()
  const { push } = useToast()

  const [relics, setRelics]         = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter]         = useState('all')
  const [search, setSearch]         = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const dragIdRef                   = useRef(null)

  // Load relics for this user
  useEffect(() => {
    if (!user) return
    const data = getRelics(user.id)
    setRelics(data)
    // Pre-select first revived relic or first relic
    const revived = data.find(r => r.revived)
    setSelectedId(revived?.id ?? data[0]?.id ?? null)
  }, [user])

  // Session expiry check
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (!raw) return
    try {
      const session = JSON.parse(raw)
      if (Date.now() > session.expiresAt) {
        push('Your session expired. Please sign in again.', 'error', 6000)
      }
    } catch {}
  }, [])

  // Derived list
  const visible = relics.filter(r => {
    const okFilter =
      filter === 'all' ||
      (filter === 'visuals' && r.filter === 'visuals') ||
      (filter === 'drafts'  && r.filter === 'drafts')
    const q = search.toLowerCase()
    const okSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    return okFilter && okSearch
  })

  const selected = relics.find(r => r.id === selectedId) ?? null

  // Handlers
  function handleDragStart(e, id) {
    dragIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (!dragIdRef.current || !user) return
    const updated = updateRelic(user.id, dragIdRef.current, { revived: true })
    setRelics(updated)
    setSelectedId(dragIdRef.current)
    push('Relic revived! 🎉', 'success')
    dragIdRef.current = null
  }

  function handleRevive(id) {
    if (!user) return
    const updated = updateRelic(user.id, id, { revived: true })
    setRelics(updated)
    push('Relic revived!', 'success')
  }

  function handleDelete(id) {
    if (!user) return
    if (!window.confirm('Delete this relic forever? This cannot be undone.')) return
    const updated = deleteRelic(user.id, id)
    setRelics(updated)
    if (selectedId === id) setSelectedId(updated[0]?.id ?? null)
    push('Relic deleted forever.', 'info')
  }

  function handleAddRelic(relic) {
    if (!user) return
    const updated = addRelic(user.id, relic)
    setRelics(updated)
    setSelectedId(relic.id)
    push('New relic added to the archive.', 'success')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0A0A1E', overflow: 'hidden' }}>

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

        {/* Center */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#14142B' }}>
          <TopBar
            search={search} setSearch={setSearch}
            filter={filter} setFilter={setFilter}
            onNewRelic={() => setShowModal(true)}
          />

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <div style={{ padding: '20px 20px 110px' }}>

              {/* Header */}
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
                <div style={{
                  marginTop: 32, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 14,
                  height: 200, borderRadius: 12, border: '1px dashed #2A2A48',
                  color: '#3A3A5C', fontSize: 13,
                }}>
                  {relics.length === 0
                    ? <>Your archive is empty. Add your first relic.</>
                    : <>No relics match your search.</>
                  }
                </div>
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

        <RelicDetails
          relic={selected}
          onRevive={handleRevive}
          onDelete={handleDelete}
        />
      </div>

      {showModal && (
        <NewRelicModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddRelic}
        />
      )}
    </div>
  )
}
