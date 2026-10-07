import { useState, useRef, useEffect } from 'react'
import { AnimatePresence }  from 'framer-motion'
import { useNavigate }     from 'react-router-dom'
import { useTranslation }  from 'react-i18next'
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
import { useTheme }        from '../context/ThemeContext.jsx'

// ── Stats bar ─────────────────────────────────────────────────────
function StatsBar({ stats }) {
  const { t } = useTranslation()
  const { color, font } = useTheme()
  const items = [
    { icon: <Layers size={13}/>,    label: t('dashboard.stats.total'),    value: stats.total },
    { icon: <RotateCcw size={13}/>, label: t('dashboard.stats.revived'),  value: stats.revived },
    { icon: <Archive size={13}/>,   label: t('dashboard.stats.archived'), value: stats.archived },
  ]
  return (
    <div style={{display:'flex',gap:20,marginTop:8,marginBottom:16}}>
      {items.map(({icon,label,value})=>(
        <div key={label} style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{color:color.blue500}}>{icon}</span>
          <span style={{fontSize:11,fontFamily:font.mono,color:color.textSecondary}}>{label}</span>
          <span style={{fontSize:12,fontWeight:700,fontFamily:font.mono,color:color.textPrimary}}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ onNew, hasSearch, section }) {
  const { t } = useTranslation()
  const { color, font } = useTheme()
  const msg = hasSearch
    ? t('dashboard.empty.search')
    : section === 'revived' ? t('dashboard.empty.revived')
    : section === 'recent'  ? t('dashboard.empty.recent')
    : t('dashboard.empty.archiveDark')
  return (
    <div style={{marginTop:32,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,minHeight:200,borderRadius:16,border:`1px dashed ${color.bgBorder}`,color:color.textTertiary,padding:32}}>
      <span style={{fontSize:13,fontFamily:font.display,fontStyle:'italic'}}>{msg}</span>
      {!hasSearch && section==='gallery' && (
        <button onClick={onNew} style={{padding:'8px 20px',borderRadius:10,border:'none',background:color.blue500,color:color.onPrimary,fontSize:13,fontWeight:700,fontFamily:font.ui,cursor:'pointer'}}>
          {t('dashboard.empty.addFirst')}
        </button>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t }              = useTranslation()
  const { color, font }    = useTheme()
  const { user }           = useAuth()
  const { push }           = useToast()
  const navigate           = useNavigate()
  const { confirm, ConfirmModalUI } = useConfirm()
  const { analyzeRelic }   = useAI()

  const {
    relics, visible, selected, selectedId, setSelectedId,
    filter, setFilter, section, setSection,
    search, setSearch, sortField, sortDir, cycleSort,
    stats, add, update, remove, revive,
  } = useRelics(user?.id)

  const [dragOver,      setDragOver]      = useState(false)
  const [justRevived,   setJustRevived]   = useState(false)
  const [showNew,       setShowNew]       = useState(false)
  const [editRelic,     setEditRelic]     = useState(null)
  const [showSettings,  setShowSettings]  = useState(false)
  const [aiAnalysis,    setAiAnalysis]    = useState({})  // { [relicId]: string }
  const [aiLoadingId,   setAiLoadingId]   = useState(null)
  const revivalZoneRef                    = useRef(null)

  // Session expiry — AuthProvider has already signed out by the time this
  // event fires; this handler only reacts to it (toast + redirect).
  useEffect(() => {
    function handleExpired() {
      push(t('dashboard.toast.sessionExpired'), 'error', 6000)
      navigate('/login', { replace: true })
    }
    window.addEventListener('am:session-expired', handleExpired)
    return () => window.removeEventListener('am:session-expired', handleExpired)
  }, [navigate, push, t])

  // Drag & drop — spring-driven (framer-motion), not native HTML5 DnD
  function isOverRevivalZone(point) {
    const el = revivalZoneRef.current
    if (!el || !point) return false
    const r = el.getBoundingClientRect()
    return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom
  }
  function handleCardDrag(id, info) {
    setDragOver(isOverRevivalZone(info.point))
  }
  function handleCardDragEnd(id, info) {
    const hit = isOverRevivalZone(info.point)
    setDragOver(false)
    if (!hit) return
    revive(id).catch(err => push(err.message, 'error'))
    setSelectedId(id)
    push(t('dashboard.toast.revived'), 'success')
    setJustRevived(true)
    setTimeout(() => setJustRevived(false), 700)
  }

  // If the window loses focus mid-drag (Alt+Tab, OS stealing the pointer),
  // framer-motion's onDragEnd never fires — without this, the Revival Zone
  // can stay highlighted as "drag over" even though nothing is being dragged.
  useEffect(() => {
    function resetDragOver() { setDragOver(false) }
    window.addEventListener('blur', resetDragOver)
    return () => window.removeEventListener('blur', resetDragOver)
  }, [])

  // Relic actions
  async function handleRevive(id) {
    try { await revive(id); push(t('dashboard.toast.revived'), 'success') }
    catch (err) { push(err.message, 'error') }
  }

  async function handleDelete(id) {
    const relic = relics.find(r => r.id === id)
    const ok = await confirm({
      title: t('dashboard.toast.deleteTitle'),
      message: relic ? t('dashboard.toast.deleteMessage', { title: relic.title }) : t('dashboard.toast.deleteCannotUndo'),
      danger: true, confirmLabel: t('dashboard.toast.deleteConfirmLabel'),
    })
    if (!ok) return
    try {
      await remove(id)
      push(t('dashboard.toast.deletedForever'), 'info')
    } catch (err) {
      push(err.message, 'error')
    }
  }

  async function handleAddRelic(relic) {
    await add(relic)
    push(t('dashboard.toast.relicAdded'), 'success')
  }

  async function handleSaveEdit(id, patch) {
    await update(id, patch)
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

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:color.bgBase,overflow:'hidden'}}>
      <ConfirmModalUI/>

      {/* macOS chrome */}
      <div style={{height:36,background:color.bgBase,borderBottom:`1px solid ${color.bgBorder}`,display:'flex',alignItems:'center',gap:6,padding:'0 16px',flexShrink:0}}>
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
        <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:color.bgSurface}}>
          <div style={{flex:1,overflowY:'auto',position:'relative'}}>
            <TopBar
              search={search} setSearch={setSearch}
              filter={filter} setFilter={setFilter}
              onNewRelic={()=>setShowNew(true)}
              sortField={sortField} sortDir={sortDir} cycleSort={cycleSort}
            />

            <div style={{padding:'4px 20px 120px'}}>

              {/* Header */}
              <div style={{marginBottom:2}}>
                <h1 style={{fontSize:28,fontWeight:600,fontFamily:font.display,color:color.textPrimary,letterSpacing:'-0.01em',lineHeight:1.1,margin:0}}>
                  {t(`dashboard.sectionTitle.${section}`)}
                </h1>
                <p style={{fontSize:12,color:color.textSecondary,marginTop:4,marginBottom:0}}>
                  {section==='gallery'
                    ? t('dashboard.sectionDesc.gallery', { project: user?.activeProject || t('sidebar.nav.archive') })
                    : t(`dashboard.sectionDesc.${section}`)}
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
                  <AnimatePresence>
                    {visible.map((r,i)=>(
                      <RelicCard
                        key={r.id} relic={r} animIndex={i}
                        isSelected={r.id===selectedId}
                        onSelect={setSelectedId}
                        onCardDrag={handleCardDrag}
                        onCardDragEnd={handleCardDragEnd}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <RevivalZone
              ref={revivalZoneRef}
              isDragOver={dragOver}
              justRevived={justRevived}
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
