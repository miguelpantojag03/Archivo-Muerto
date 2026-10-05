import { useState, useEffect, useRef } from 'react'
import {
  RotateCcw, Trash2, Pencil, Paperclip, Expand,
  Image as ImageIcon, Sparkles, ChevronDown, X,
} from 'lucide-react'
import { ParchmentImage, getThumbnail } from './Thumbnails.jsx'
import { useAttachments }  from '../hooks/useAttachments.js'
import { useAuth }         from '../auth/AuthProvider.jsx'
import { isImage }         from '../constants/fileTypes.js'

/* ─── helpers ─────────────────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return '—'
  try {
    if (String(val).includes('T'))
      return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {}
  return val
}

/* ─── full-screen image viewer ────────────────────────────────────── */
function ImageViewer({ src, title, onClose }) {
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
        color: danger ? '#E05555' : '#C8C8E0', padding: 6, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >{label === 'Close' ? <X size={16}/> : label === 'R' ? <span style={{fontSize:13}}>↻</span> : label === '+' ? <span style={{fontSize:16}}>+</span> : <span style={{fontSize:16}}>−</span>}</button>
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
        <span style={{fontSize:13,color:'#E8E8F0',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{title}</span>
        <div style={{display:'flex',gap:2,alignItems:'center'}}>
          {btn('−',()=>setZoom(z=>Math.max(0.25,+(z-0.25).toFixed(2))))}
          <span style={{fontSize:11,color:'#7E7EA0',minWidth:38,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
          {btn('+',()=>setZoom(z=>Math.min(5,+(z+0.25).toFixed(2))))}
          {btn('R',()=>setRot(r=>(r+90)%360))}
          <div style={{width:1,height:20,background:'#2A2A48',margin:'0 4px'}}/>
          {btn('Close',onClose,true)}
        </div>
      </div>
      {/* image */}
      <div style={{width:'100%',maxWidth:800,flex:1,maxHeight:'calc(100vh-120px)',borderRadius:12,overflow:'auto',display:'flex',alignItems:'center',justifyContent:'center',background:'#0A0A1E',border:'1px solid #2A2A48'}}>
        <img src={src} alt={title} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',transform:`scale(${zoom}) rotate(${rot}deg)`,transformOrigin:'center',transition:'transform 0.2s ease',userSelect:'none'}} draggable={false}/>
      </div>
    </div>
  )
}

/* ─── thumbnail of an image attachment ───────────────────────────── */
function AttachmentThumb({ att, getPreviewURL, onOpen }) {
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
        border: hov ? '2px solid #5B4BFF' : '2px solid #2A2A48',
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
  if (loading) return (
    <div style={{padding:'10px 12px',borderRadius:8,background:'rgba(91,75,255,0.08)',border:'1px solid rgba(91,75,255,0.2)',fontSize:11,color:'#7B6FFF',display:'flex',alignItems:'center',gap:8}}>
      <Sparkles size={12} style={{animation:'am-spin 1s linear infinite'}}/>
      Analyzing relic…
    </div>
  )
  if (analysis) return (
    <div style={{padding:'10px 12px',borderRadius:8,background:'rgba(91,75,255,0.08)',border:'1px solid rgba(91,75,255,0.2)'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
        <Sparkles size={11} style={{color:'#7B6FFF'}}/>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:'#7B6FFF'}}>AI ANALYSIS</span>
      </div>
      <p style={{fontSize:11,color:'#C8C8E0',lineHeight:1.65,margin:0}}>{analysis}</p>
    </div>
  )
  return (
    <button onClick={onRequest}
      style={{
        width:'100%',padding:'8px 0',borderRadius:8,border:'1px dashed rgba(91,75,255,0.4)',
        background:'transparent',color:'#7B6FFF',fontSize:12,fontWeight:600,
        fontFamily:'inherit',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,
        transition:'background 0.12s,border-color 0.12s',
      }}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(91,75,255,0.08)';e.currentTarget.style.borderColor='#7B6FFF'}}
      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(91,75,255,0.4)'}}>
      <Sparkles size={13}/> Analyze this relic
    </button>
  )
}

/* ─── main component ──────────────────────────────────────────────── */
export default function RelicDetails({ relic, onRevive, onDelete, onEdit, onAnalyze, aiAnalysis, aiLoading }) {
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
      height:'100%',background:'#0F0F22',borderLeft:'1px solid #1E1E3A',
      overflowY:'auto',
    }}>
      {/* header */}
      <div style={{
        padding:'14px 16px 10px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        borderBottom: relic ? '1px solid #1E1E3A' : 'none',flexShrink:0,
      }}>
        <span style={{fontSize:14,fontWeight:700,color:'#E8E8F0'}}>Relic Details</span>
        {relic && (
          <button onClick={()=>onEdit(relic)}
            style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:6,border:'1px solid #2A2A48',background:'transparent',color:'#7E7EA0',fontSize:11,fontWeight:600,fontFamily:'inherit',cursor:'pointer',transition:'border-color 0.12s,color 0.12s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#5B4BFF';e.currentTarget.style.color='#7B6FFF'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#2A2A48';e.currentTarget.style.color='#7E7EA0'}}>
            <Pencil size={11}/> Edit
          </button>
        )}
      </div>

      {!relic ? (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center',color:'#3A3A5C',fontSize:13}}>
          Select a relic to view its details
        </div>
      ) : (
        <div style={{padding:'14px 16px 20px',display:'flex',flexDirection:'column',gap:12}}>

          {/* ── COVER IMAGE (real photo or category thumbnail) ── */}
          <div
            onClick={hasCover ? ()=>setViewer({src:relic.coverImage,title:relic.title}) : undefined}
            style={{
              width:'100%',height:160,borderRadius:10,overflow:'hidden',
              position:'relative',flexShrink:0,cursor:hasCover?'pointer':'default',
              border:'1px solid #2A2A48',
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
                  <div style={{background:'rgba(91,75,255,0.85)',borderRadius:6,padding:'3px 8px',display:'flex',alignItems:'center',gap:5,fontSize:10,color:'white',fontWeight:600}}>
                    <Expand size={10}/> View
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
          <div style={{fontSize:14,fontStyle:'italic',fontWeight:700,color:'#E8E8F0',lineHeight:1.35}}>
            "{relic.title}"
          </div>

          {/* status */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:7,height:7,borderRadius:'50%',flexShrink:0,
              background:relic.revived?'#4ADE80':'#5B4BFF',
              boxShadow:relic.revived?'0 0 6px #4ADE80':'0 0 6px #5B4BFF'}}/>
            <span style={{fontSize:11,color:'#A0A0CC'}}>{relic.revived?'Revived State':'Archived State'}</span>
          </div>

          {/* tags */}
          {relic.tags?.length > 0 && (
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {relic.tags.map(t=>(
                <span key={t} style={{fontSize:9,fontWeight:700,letterSpacing:'0.08em',color:'#7B6FFF',background:'rgba(91,75,255,0.15)',borderRadius:99,padding:'2px 8px'}}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* image gallery from attachments */}
          {imageAtts.length > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <ImageIcon size={12} style={{color:'#7B6FFF'}}/>
                <span style={{fontSize:11,fontWeight:700,color:'#C8C8E0'}}>Images</span>
                <span style={{fontSize:10,fontWeight:700,color:'#7B6FFF',background:'rgba(91,75,255,0.15)',borderRadius:99,padding:'1px 7px'}}>{imageAtts.length}</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {visibleImg.map(att=>(
                  <AttachmentThumb key={att.id} att={att} getPreviewURL={getPreviewURL}
                    onOpen={(src,title)=>setViewer({src,title})}/>
                ))}
              </div>
              {imageAtts.length > 6 && (
                <button onClick={()=>setShowAll(s=>!s)}
                  style={{fontSize:10,color:'#7B6FFF',background:'none',border:'none',cursor:'pointer',textAlign:'left',padding:0}}>
                  {showAll ? 'Show less' : `+${imageAtts.length-6} more`}
                </button>
              )}
            </div>
          )}

          {/* attachments badge */}
          {totalAtts > 0 && (
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',borderRadius:7,background:'rgba(91,75,255,0.1)',border:'1px solid rgba(91,75,255,0.2)'}}>
              <Paperclip size={12} style={{color:'#7B6FFF'}}/>
              <span style={{fontSize:11,color:'#7B6FFF',fontWeight:600}}>{totalAtts} file{totalAtts!==1?'s':''} attached</span>
            </div>
          )}

          {/* metadata */}
          <div style={{border:'1px solid #1E1E3A',borderRadius:10,overflow:'hidden'}}>
            {[
              {label:'Project',  value:relic.project},
              {label:'Category', value:relic.category},
              {label:'Created',  value:fmtDate(relic.createdAt??relic.created)},
              {label:'Discarded',value:fmtDate(relic.discardedAt??relic.discarded)},
              ...(relic.responsible?[{label:'Responsible',value:relic.responsible}]:[]),
            ].map(({label,value},i,arr)=>(
              <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'#111126',borderBottom:i<arr.length-1?'1px solid #1E1E3A':'none'}}>
                <span style={{fontSize:11,color:'#7E7EA0',flexShrink:0}}>{label}</span>
                <span style={{fontSize:11,color:'#C8C8E0',fontWeight:500,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{value??'—'}</span>
              </div>
            ))}
          </div>

          {/* notes */}
          {relic.notes && (
            <div style={{padding:'8px 12px',borderRadius:8,background:'#111126',border:'1px solid #1E1E3A'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#7E7EA0',marginBottom:4,letterSpacing:'0.06em'}}>NOTES</div>
              <div style={{fontSize:11,color:'#C8C8E0',lineHeight:1.6}}>{relic.notes}</div>
            </div>
          )}

          {/* AI analysis */}
          <AIAnalysisBlock analysis={aiAnalysis} loading={aiLoading} onRequest={()=>onAnalyze?.(relic)}/>

          {/* actions */}
          <button onClick={()=>onRevive(relic.id)}
            style={{width:'100%',padding:'10px 0',borderRadius:8,border:'none',background:'#5B4BFF',color:'white',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'background 0.12s'}}
            onMouseEnter={e=>e.currentTarget.style.background='#4A3AEE'}
            onMouseLeave={e=>e.currentTarget.style.background='#5B4BFF'}>
            <RotateCcw size={13}/> Revive Now
          </button>
          <button onClick={()=>onDelete(relic.id)}
            style={{width:'100%',padding:'10px 0',borderRadius:8,background:'transparent',color:'#7E7EA0',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:'pointer',border:'1px solid #2A2A48',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'border-color 0.12s,color 0.12s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#E05555';e.currentTarget.style.color='#E05555'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#2A2A48';e.currentTarget.style.color='#7E7EA0'}}>
            <Trash2 size={13}/> Delete Forever
          </button>
        </div>
      )}

      {/* fullscreen viewer */}
      {viewer && <ImageViewer src={viewer.src} title={viewer.title} onClose={()=>setViewer(null)}/>}

      <style>{`@keyframes am-spin{to{transform:rotate(360deg)}}`}</style>
    </aside>
  )
}
