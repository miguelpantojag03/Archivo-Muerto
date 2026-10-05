import { useState, useRef, useEffect } from 'react'
import { useNavigate }     from 'react-router-dom'
import { Archive, RotateCcw, Layers } from 'lucide-react'
import { useAuth }         from '../auth/AuthProvider.jsx'
import { useToast }        from '../components/Toast.jsx'
import { useRelics }       from '../hooks/useRelics.js'
import { useAI }           from '../hooks/useAI.js'
import { useConfirm }      from '../components/ConfirmModal.jsx'
import Sidebar             from '../components/Sidebar.jsx'
import TopBar              from '../components/TopBar.jsx'
import RelicCard           from '../components/RelicCard.jsx'
import RelicDetails        from '../components/RelicDetails.jsx'
import RevivalZone         from '../components/RevivalZone.jsx'
import NewRelicModal       from '../components/NewRelicModal.jsx'
import EditRelicModal      from '../components/EditRelicModal.jsx'
import AIInsightsPanel     from '../components/AIInsightsPanel.jsx'
import SettingsModal       from '../components/SettingsModal.jsx'

// ── Stats bar ─────────────────────────────────────────────────────
function StatsBar({ stats }) {
  const items = [
    { icon: <Layers size={13}/>,    label: 'Total',   value: stats.total },
    { icon: <RotateCcw size={13}/>, label: 'Revived', value: stats.revived },
    { icon: <Archive size={13}/>,   label: 'Archived', value: stats.archived },
  ]
  return (
    <div style={{display:'flex',gap:20,marginTop:8,marginBottom:16}}>
      {items.map(({icon,label,value})=>(
        <div key={label} style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{color:'#7B6FFF'}}>{icon}</span>
          <span style={{fontSize:12,color:'#7E7EA0'}}>{label}:</span>
          <span style={{fontSize:12,fontWeight:700,color:'#E8E8F0'}}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ onNew, hasSearch, section }) {
  const msg = hasSearch
    ? 'No relics match your search.'
    : section === 'revived' ? 'No revived relics yet. Drag one to the Revival Zone!'
    : section === 'recent'  ? 'No relics added yet.'
    : 'Your archive is empty.'
  return (
    <div style={{marginTop:32,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,minHeight:200,borderRadius:12,border:'1px dashed #2A2A48',color:'#3A3A5C',padding:32}}>
      <span style={{fontSize:13}}>{msg}</span>
      {!hasSearch && section==='gallery' && (
        <button onClick={onNew} style={{padding:'8px 20px',borderRadius:8,border:'none',background:'#5B4BFF',color:'white',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>
          + Add your first relic
        </button>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { push }          = useToast()
  const navigate          = useNavigate()
  const { confirm, ConfirmModalUI } = useConfirm()
  const { analyzeRelic }  = useAI()

  const {
    relics, visible, selected, selectedId, setSelectedId,
    filter, setFilter, section, setSection,
    search, setSearch, sortField, sortDir, cycleSort,
    stats, add, update, remove, revive,
  } = useRelics(user?.id)

  const [dragOver,      setDragOver]      = useState(false)
  const [showNew,       setShowNew]       = useState(false)
  const [editRelic,     setEditRelic]     = useState(null)
  const [showSettings,  setShowSettings]  = useState(false)
  const [aiAnalysis,    setAiAnalysis]    = useState({})  // { [relicId]: string }
  const [aiLoadingId,   setAiLoadingId]   = useState(null)
  const dragIdRef                         = useRef(null)

  // Session expiry
  useEffect(() => {
    async function handleExpired() {
      push('Your session expired. Please sign in again.', 'error', 6000)
      await signOut()
      navigate('/login', { replace: true })
    }
    window.addEventListener('am:session-expired', handleExpired)
    return () => window.removeEventListener('am:session-expired', handleExpired)
  }, [signOut, navigate, push])

  // Drag & drop
  function handleDragStart(e, id) {
    dragIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleDrop(e) {
    e.preventDefault(); setDragOver(false)
    if (!dragIdRef.current) return
    revive(dragIdRef.current)
    setSelectedId(dragIdRef.current)
    push('Relic revived! 🎉', 'success')
    dragIdRef.current = null
  }

  // Relic actions
  function handleRevive(id)     { revive(id); push('Relic revived!', 'success') }

  async function handleDelete(id) {
    const relic = relics.find(r => r.id === id)
    const ok = await confirm({
      title: 'Delete relic forever?',
      message: relic ? `"${relic.title}" and all its attachments will be permanently removed.` : 'This cannot be undone.',
      danger: true, confirmLabel: 'Delete Forever',
    })
    if (!ok) return
    try {
      await remove(id)
      push('Relic deleted forever.', 'info')
    } catch (err) {
      push(err.message, 'error')
    }
  }

  function handleAddRelic(relic) {
    try { add(relic); push('Relic added to the archive.', 'success') }
    catch (err) { push(err.message, 'error') }
  }

  function handleSaveEdit(id, patch) {
    try { update(id, patch) }
    catch (err) { push(err.message, 'error') }
  }

  // AI: analyze selected relic
  async function handleAnalyze(relic) {
    if (!relic) return
    setAiLoadingId(relic.id)
    const result = await analyzeRelic(relic)
    if (result) {
      const summary = `${result.summary} ${result.potential} ${result.suggestions?.join(' ')}`.trim()
      setAiAnalysis(prev => ({ ...prev, [relic.id]: summary }))
    }
    setAiLoadingId(null)
  }

  // Highlight a relic from AI insights
  function handleHighlight(id) { setSelectedId(id) }

  const sectionTitle = {
    gallery: 'The Archive',
    recent:  'Recent Relics',
    revived: 'Revived',
    deleted: 'Permanently Deleted',
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#0A0A1E',overflow:'hidden'}}>
      <ConfirmModalUI/>

      {/* macOS chrome */}
      <div style={{height:36,background:'#0A0A1E',borderBottom:'1px solid #1E1E3A',display:'flex',alignItems:'center',gap:6,padding:'0 16px',flexShrink:0}}>
        <div style={{width:12,height:12,borderRadius:'50%',background:'#FF5F57'}}/>
        <div style={{width:12,height:12,borderRadius:'50%',background:'#FEBC2E'}}/>
        <div style={{width:12,height:12,borderRadius:'50%',background:'#28C840'}}/>
      </div>

      {/* 3-column layout */}
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        <Sidebar
          user={user}
          activeSection={section}
          onSection={setSection}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Center */}
        <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#14142B'}}>
          <TopBar
            search={search} setSearch={setSearch}
            filter={filter} setFilter={setFilter}
            onNewRelic={()=>setShowNew(true)}
            sortField={sortField} sortDir={sortDir} cycleSort={cycleSort}
          />

          <div style={{flex:1,overflowY:'auto',position:'relative'}}>
            <div style={{padding:'20px 20px 120px'}}>

              {/* Header */}
              <div style={{marginBottom:2}}>
                <h1 style={{fontSize:26,fontWeight:800,color:'#E8E8F0',letterSpacing:'-0.02em',lineHeight:1.1,margin:0}}>
                  {sectionTitle[section]}
                </h1>
                <p style={{fontSize:12,color:'#7E7EA0',marginTop:4,marginBottom:0}}>
                  {section==='gallery'
                    ? `Review discarded drafts from '${user?.activeProject||'your projects'}' and other projects.`
                    : section==='recent' ? 'Your 10 most recently added relics.'
                    : section==='revived' ? 'Ideas brought back to life.'
                    : 'No relics here yet.'}
                </p>
              </div>

              {/* Stats */}
              <StatsBar stats={stats}/>

              {/* AI Insights */}
              <div style={{marginBottom:20}}>
                <AIInsightsPanel relics={relics} onHighlight={handleHighlight}/>
              </div>

              {/* Grid — responsive */}
              {visible.length === 0 ? (
                <EmptyState onNew={()=>setShowNew(true)} hasSearch={!!search} section={section}/>
              ) : (
                <div style={{
                  display:'grid',
                  gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',
                  gap:14,
                }}>
                  {visible.map((r,i)=>(
                    <RelicCard
                      key={r.id} relic={r} animIndex={i}
                      isSelected={r.id===selectedId}
                      onSelect={setSelectedId}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              )}
            </div>

            <RevivalZone
              isDragOver={dragOver}
              onDragOver={e=>{e.preventDefault();setDragOver(true)}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={handleDrop}
            />
          </div>
        </main>

        {/* Right panel */}
        <RelicDetails
          relic={selected}
          onRevive={handleRevive}
          onDelete={handleDelete}
          onEdit={relic=>setEditRelic(relic)}
          onAnalyze={handleAnalyze}
          aiAnalysis={selected ? aiAnalysis[selected.id] : null}
          aiLoading={aiLoadingId === selected?.id}
        />
      </div>

      {/* Modals */}
      {showNew && (
        <NewRelicModal onClose={()=>setShowNew(false)} onAdd={handleAddRelic}/>
      )}
      {editRelic && (
        <EditRelicModal relic={editRelic} onClose={()=>setEditRelic(null)} onSave={handleSaveEdit}/>
      )}
      {showSettings && (
        <SettingsModal userId={user?.id} onClose={()=>setShowSettings(false)}/>
      )}
    </div>
  )
}
