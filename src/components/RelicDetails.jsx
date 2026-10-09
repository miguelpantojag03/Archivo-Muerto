import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw, Trash2, Pencil, Paperclip, Expand,
  Image as ImageIcon, Sparkles, X,
} from 'lucide-react'
import { getThumbnail } from './Thumbnails.jsx'
import { useAttachments }  from '../hooks/useAttachments.js'
import { useAuth }         from '../auth/AuthProvider.jsx'
import { isImage }         from '../constants/fileTypes.js'
import { useTheme }        from '../context/ThemeContext.jsx'
import { alpha }           from '../styles/tokens.js'
import { formatDate }      from '../lib/formatDate.js'

/* ─── full-screen image viewer ────────────────────────────────────── */
function ImageViewer({ src, title, onClose }) {
  const { t } = useTranslation()
  const { color } = useTheme()
  const [zoom, setZoom] = useState(1)
  const [rot,  setRot]  = useState(0)

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const btn = (label, onClick, danger = false) => (
    <button onClick={onClick} title={label}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: danger ? color.terracotta500 : color.textPrimary, padding: 6, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseEnter={e => e.currentTarget.style.background = color.hoverOverlay}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >{label === t('imageViewer.close') ? <X size={16}/> : label === t('imageViewer.rotate') ? <span style={{fontSize:13}}>↻</span> : label === '+' ? <span style={{fontSize:16}}>+</span> : <span style={{fontSize:16}}>−</span>}</button>
  )

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed',inset:0,zIndex:600,
        background:'rgba(0,0,0,0.9)',backdropFilter:'blur(8px)',
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,
      }}>
      {/* toolbar */}
      <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:12,width:'100%',maxWidth:800,justifyContent:'space-between'}}>
        <span style={{fontSize:13,color:color.textPrimary,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{title}</span>
        <div style={{display:'flex',gap:2,alignItems:'center'}}>
          {btn('−',()=>setZoom(z=>Math.max(0.25,+(z-0.25).toFixed(2))))}
          <span style={{fontSize:11,color:color.textSecondary,minWidth:38,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
          {btn('+',()=>setZoom(z=>Math.min(5,+(z+0.25).toFixed(2))))}
          {btn(t('imageViewer.rotate'),()=>setRot(r=>(r+90)%360))}
          <div style={{width:1,height:20,background:color.bgBorder,margin:'0 4px'}}/>
          {btn(t('imageViewer.close'),onClose,true)}
        </div>
      </div>
      {/* image */}
      <div style={{width:'100%',maxWidth:800,flex:1,maxHeight:'calc(100vh-120px)',borderRadius:12,overflow:'auto',display:'flex',alignItems:'center',justifyContent:'center',background:color.bgBase,border:`1px solid ${color.bgBorder}`}}>
        <img src={src} alt={title} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',transform:`scale(${zoom}) rotate(${rot}deg)`,transformOrigin:'center',transition:'transform 0.2s ease',userSelect:'none'}} draggable={false}/>
      </div>
    </div>
  )
}

/* ─── thumbnail of an image attachment ───────────────────────────── */
function AttachmentThumb({ att, getPreviewURL, onOpen }) {
  const { color } = useTheme()
  const [src, setSrc] = useState(null)
  const [hov, setHov] = useState(false)
  const urlRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const url = getPreviewURL(att)
    if (url && !cancelled) { urlRef.current = url; setSrc(url) }
    return () => {
      cancelled = true
      if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null }
    }
  }, [att.id])

  if (!src) return null
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onOpen(src, att.originalName)}
      title={att.originalName}
      style={{
        width:56,height:56,borderRadius:8,overflow:'hidden',
        cursor:'pointer',position:'relative',flexShrink:0,
        border: hov ? `2px solid ${color.blue500}` : `2px solid ${color.bgBorder}`,
        transform: hov ? 'scale(1.05)' : 'scale(1)',
        transition:'border-color 0.12s,transform 0.12s',
      }}>
      <img src={src} alt={att.originalName} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
      {hov && (
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Expand size={14} style={{color:'white'}}/>
        </div>
      )}
    </div>
  )
}

/* ─── AI analysis display ─────────────────────────────────────────── */
function AIAnalysisBlock({ analysis, loading, onRequest }) {
  const { t } = useTranslation()
  const { color } = useTheme()
  if (loading) return (
    <div style={{padding:'10px 12px',borderRadius:8,background:alpha(color.blue500, 0.08),border:`1px solid ${alpha(color.blue500, 0.2)}`,fontSize:11,color:color.blue300,display:'flex',alignItems:'center',gap:8}}>
      <Sparkles size={12} style={{animation:'am-spin 1s linear infinite'}}/>
      {t('relicDetails.aiAnalyzing')}
    </div>
  )
  if (analysis) return (
    <div style={{padding:'10px 12px',borderRadius:8,background:alpha(color.blue500, 0.08),border:`1px solid ${alpha(color.blue500, 0.2)}`}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
        <Sparkles size={11} style={{color:color.blue300}}/>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:color.blue300}}>{t('relicDetails.aiAnalysisLabel').toUpperCase()}</span>
      </div>
      <p style={{fontSize:11,color:color.textPrimary,lineHeight:1.65,margin:0}}>{analysis}</p>
    </div>
  )
  return (
    <button onClick={onRequest}
      style={{
        width:'100%',padding:'8px 0',borderRadius:8,border:`1px dashed ${alpha(color.blue500, 0.4)}`,
        background:'transparent',color:color.blue300,fontSize:12,fontWeight:600,
        fontFamily:'inherit',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,
        transition:'background 0.12s,border-color 0.12s',
      }}
      onMouseEnter={e=>{e.currentTarget.style.background=alpha(color.blue500, 0.08);e.currentTarget.style.borderColor=color.blue300}}
      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=alpha(color.blue500, 0.4)}}>
      <Sparkles size={13}/> {t('relicDetails.aiAnalyzeButton')}
    </button>
  )
}

/* ─── lineage ──────────────────────────────────────────────────────── */
function LineageRow({ label, relics, onSelect, color, font }) {
  if (!relics.length) return null
  return (
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,padding:'8px 12px',background:color.bgElevated}}>
      <span style={{fontSize:11,color:color.textSecondary,flexShrink:0,marginTop:1}}>{label}</span>
      <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-end'}}>
        {relics.map(r => (
          <button key={r.id} onClick={() => onSelect(r.id)}
            style={{background:'none',border:'none',padding:0,cursor:'pointer',color:color.blue300,fontSize:11,fontWeight:500,fontFamily:font.ui,textAlign:'right',textDecoration:'underline',maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {r.title}
          </button>
        ))}
      </div>
    </div>
  )
}

function LineageSection({ relic, relics, onSelectRelic, color, font, t }) {
  const replacesRelic    = relics.find(r => r.id === relic.replacesId)
  const inspiredByRelic  = relics.find(r => r.id === relic.inspiredById)
  const replacedByRelics = relics.filter(r => r.replacesId === relic.id)
  const inspiredRelics   = relics.filter(r => r.inspiredById === relic.id)

  const rows = [
    { label: t('relicDetails.lineage.replaces'),    relics: replacesRelic ? [replacesRelic] : [] },
    { label: t('relicDetails.lineage.replacedBy'),   relics: replacedByRelics },
    { label: t('relicDetails.lineage.inspiredBy'),   relics: inspiredByRelic ? [inspiredByRelic] : [] },
    { label: t('relicDetails.lineage.inspired'),     relics: inspiredRelics },
  ].filter(r => r.relics.length > 0)

  if (rows.length === 0) return null

  return (
    <div style={{border:`1px solid ${color.bgBorder}`,borderRadius:10,overflow:'hidden'}}>
      <div style={{padding:'7px 12px',background:color.bgElevated,borderBottom:`1px solid ${color.bgBorder}`,fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:color.textSecondary}}>
        {t('relicDetails.lineage.title').toUpperCase()}
      </div>
      {rows.map((row, i) => (
        <div key={row.label} style={{borderBottom: i < rows.length - 1 ? `1px solid ${color.bgBorder}` : 'none'}}>
          <LineageRow label={row.label} relics={row.relics} onSelect={onSelectRelic} color={color} font={font}/>
        </div>
      ))}
    </div>
  )
}

/* ─── main component ──────────────────────────────────────────────── */
export default function RelicDetails({ relic, relics = [], onSelectRelic, onRevive, onDelete, onEdit, onAnalyze, aiAnalysis, aiLoading }) {
  const { t } = useTranslation()
  const { color, font } = useTheme()
  const { user } = useAuth()
  const { attachments, getPreviewURL } = useAttachments(relic?.id ?? null, user?.id)

  const [viewer,  setViewer]  = useState(null)  // { src, title }
  const [showAll, setShowAll] = useState(false)

  // reset viewer when relic changes
  useEffect(() => { setViewer(null); setShowAll(false) }, [relic?.id])

  const imageAtts  = attachments.filter(a => isImage(a.extension))
  const visibleImg = showAll ? imageAtts : imageAtts.slice(0, 6)
  const totalAtts  = attachments.length
  const hasCover   = !!relic?.coverImage

  return (
    <aside style={{
      width:260,flexShrink:0,display:'flex',flexDirection:'column',
      height:'100%',background:color.bgBase,borderLeft:`1px solid ${color.bgBorder}`,
      overflowY:'auto',
    }}>
      {/* header */}
      <div style={{
        padding:'14px 16px 10px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        borderBottom: relic ? `1px solid ${color.bgBorder}` : 'none',flexShrink:0,
      }}>
        <span style={{fontSize:14,fontWeight:600,fontFamily:font.display,color:color.textPrimary}}>{t('relicDetails.title')}</span>
        {relic && (
          <button onClick={()=>onEdit(relic)}
            style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:6,border:`1px solid ${color.bgBorder}`,background:'transparent',color:color.textSecondary,fontSize:11,fontWeight:600,fontFamily:font.ui,cursor:'pointer',transition:'border-color 0.12s,color 0.12s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=color.blue500;e.currentTarget.style.color=color.blue300}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=color.bgBorder;e.currentTarget.style.color=color.textSecondary}}>
            <Pencil size={11}/> {t('relicDetails.edit')}
          </button>
        )}
      </div>

      {!relic ? (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center',color:color.textTertiary,fontSize:13}}>
          {t('relicDetails.selectPrompt')}
        </div>
      ) : (
        <div style={{padding:'14px 16px 20px',display:'flex',flexDirection:'column',gap:12}}>

          {/* ── COVER IMAGE (real photo or category thumbnail) ── */}
          <div
            onClick={hasCover ? ()=>setViewer({src:relic.coverImage,title:relic.title}) : undefined}
            style={{
              width:'100%',height:160,borderRadius:10,overflow:'hidden',
              position:'relative',flexShrink:0,cursor:hasCover?'pointer':'default',
              border:`1px solid ${color.bgBorder}`,
            }}>
            {hasCover ? (
              <>
                <img src={relic.coverImage} alt={relic.title}
                  style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                {/* hover overlay */}
                <div className="rd-hover-overlay" style={{
                  position:'absolute',inset:0,background:'rgba(0,0,0,0)',
                  display:'flex',alignItems:'flex-end',justifyContent:'flex-end',
                  padding:8,transition:'background 0.15s',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.35)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,0)'}
                >
                  <div style={{background:alpha(color.blue500, 0.85),borderRadius:6,padding:'3px 8px',display:'flex',alignItems:'center',gap:5,fontSize:10,color:'white',fontWeight:600}}>
                    <Expand size={10}/> {t('relicDetails.viewOverlay')}
                  </div>
                </div>
              </>
            ) : (
              // show the category thumbnail (same as grid card) when no cover image
              <div style={{width:'100%',height:'100%'}}>
                {getThumbnail(relic.thumbnail)}
              </div>
            )}
          </div>

          {/* title */}
          <div style={{fontSize:14,fontStyle:'italic',fontWeight:500,fontFamily:font.display,color:color.textPrimary,lineHeight:1.4}}>
            "{relic.title}"
          </div>

          {/* status */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:7,height:7,borderRadius:'50%',flexShrink:0,
              background:relic.revived?color.sage500:color.blue500,
              boxShadow:relic.revived?`0 0 6px ${color.sage500}`:`0 0 6px ${color.blue500}`}}/>
            <span style={{fontSize:11,color:color.textSecondary}}>{relic.revived?t('relicDetails.statusRevived'):t('relicDetails.statusArchived')}</span>
          </div>

          {/* tags */}
          {relic.tags?.length > 0 && (
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {relic.tags.map(tag=>(
                <span key={tag} style={{fontSize:9,fontWeight:700,letterSpacing:'0.08em',color:color.blue300,background:alpha(color.blue500, 0.15),borderRadius:99,padding:'2px 8px'}}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* image gallery from attachments */}
          {imageAtts.length > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <ImageIcon size={12} style={{color:color.blue300}}/>
                <span style={{fontSize:11,fontWeight:700,color:color.textPrimary}}>{t('relicDetails.images')}</span>
                <span style={{fontSize:10,fontWeight:700,color:color.blue300,background:alpha(color.blue500, 0.15),borderRadius:99,padding:'1px 7px'}}>{imageAtts.length}</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {visibleImg.map(att=>(
                  <AttachmentThumb key={att.id} att={att} getPreviewURL={getPreviewURL}
                    onOpen={(src,title)=>setViewer({src,title})}/>
                ))}
              </div>
              {imageAtts.length > 6 && (
                <button onClick={()=>setShowAll(s=>!s)}
                  style={{fontSize:10,color:color.blue300,background:'none',border:'none',cursor:'pointer',textAlign:'left',padding:0}}>
                  {showAll ? t('relicDetails.showLess') : t('relicDetails.showMore', { count: imageAtts.length-6 })}
                </button>
              )}
            </div>
          )}

          {/* attachments badge */}
          {totalAtts > 0 && (
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',borderRadius:7,background:alpha(color.blue500, 0.1),border:`1px solid ${alpha(color.blue500, 0.2)}`}}>
              <Paperclip size={12} style={{color:color.blue300}}/>
              <span style={{fontSize:11,color:color.blue300,fontWeight:600}}>{t('relicDetails.filesAttached', { count: totalAtts })}</span>
            </div>
          )}

          {/* metadata */}
          <div style={{border:`1px solid ${color.bgBorder}`,borderRadius:10,overflow:'hidden'}}>
            {[
              {label:t('relicDetails.project'),  value:relic.project},
              {label:t('relicDetails.category'), value:t(`relicCard.category.${relic.category}`, relic.category)},
              {label:t('relicDetails.created'),  value:formatDate(relic.createdAt??relic.created)},
              {label:t('relicDetails.discarded'),value:formatDate(relic.discardedAt??relic.discarded)},
              ...(relic.responsible?[{label:t('relicDetails.responsible'),value:relic.responsible}]:[]),
            ].map(({label,value},i,arr)=>(
              <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:color.bgElevated,borderBottom:i<arr.length-1?`1px solid ${color.bgBorder}`:'none'}}>
                <span style={{fontSize:11,color:color.textSecondary,flexShrink:0}}>{label}</span>
                <span style={{fontSize:11,color:color.textPrimary,fontWeight:500,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{value??'—'}</span>
              </div>
            ))}
          </div>

          {/* lineage */}
          <LineageSection relic={relic} relics={relics} onSelectRelic={onSelectRelic} color={color} font={font} t={t}/>

          {/* notes */}
          {relic.notes && (
            <div style={{padding:'8px 12px',borderRadius:8,background:color.bgElevated,border:`1px solid ${color.bgBorder}`}}>
              <div style={{fontSize:10,fontWeight:700,color:color.textSecondary,marginBottom:4,letterSpacing:'0.06em'}}>{t('relicDetails.notes').toUpperCase()}</div>
              <div style={{fontSize:11,color:color.textPrimary,lineHeight:1.6}}>{relic.notes}</div>
            </div>
          )}

          {/* AI analysis */}
          <AIAnalysisBlock analysis={aiAnalysis} loading={aiLoading} onRequest={()=>onAnalyze?.(relic)}/>

          {/* actions */}
          <button onClick={()=>onRevive(relic.id)}
            style={{width:'100%',padding:'10px 0',borderRadius:8,border:'none',background:color.blue500,color:color.onPrimary,fontSize:13,fontWeight:600,fontFamily:font.ui,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'background 0.12s'}}
            onMouseEnter={e=>e.currentTarget.style.background=color.blue600}
            onMouseLeave={e=>e.currentTarget.style.background=color.blue500}>
            <RotateCcw size={13}/> {t('relicDetails.reviveNow')}
          </button>
          <button onClick={()=>onDelete(relic.id)}
            style={{width:'100%',padding:'10px 0',borderRadius:8,background:'transparent',color:color.textSecondary,fontSize:13,fontWeight:600,fontFamily:font.ui,cursor:'pointer',border:`1px solid ${color.bgBorder}`,display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'border-color 0.12s,color 0.12s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=color.terracotta500;e.currentTarget.style.color=color.terracotta500}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=color.bgBorder;e.currentTarget.style.color=color.textSecondary}}>
            <Trash2 size={13}/> {t('relicDetails.deleteForever')}
          </button>
        </div>
      )}

      {/* fullscreen viewer */}
      {viewer && <ImageViewer src={viewer.src} title={viewer.title} onClose={()=>setViewer(null)}/>}

      <style>{`@keyframes am-spin{to{transform:rotate(360deg)}}`}</style>
    </aside>
  )
}
