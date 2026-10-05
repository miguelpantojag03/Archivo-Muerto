import { useState, useEffect } from 'react'
import { RotateCcw, PenLine, FileText, Palette, Tag, StickyNote, Paperclip } from 'lucide-react'
import { getThumbnail } from './Thumbnails.jsx'
import { countAttachments } from '../lib/attachmentStorage.js'

function CategoryIcon({ cat }) {
  switch (cat) {
    case 'SKETCH':      return <PenLine size={9}/>
    case 'COPYWRITING': return <FileText size={9}/>
    case 'PALETTE':     return <Palette size={9}/>
    case 'BRANDING':    return <Tag size={9}/>
    case 'NOTES':       return <StickyNote size={9}/>
    default:            return <FileText size={9}/>
  }
}

export default function RelicCard({ relic, isSelected, onSelect, onDragStart, animIndex = 0 }) {
  const [attCount, setAttCount] = useState(0)

  // Load attachment count asynchronously (lightweight, no blob transfer)
  useEffect(() => {
    if (!relic?.id) return
    countAttachments(relic.id).then(setAttCount).catch(() => {})
  }, [relic?.id])

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, relic.id)}
      onClick={() => onSelect(relic.id)}
      style={{
        borderRadius:12, padding:10, cursor:'pointer',
        background:'#1A1A35',
        border: isSelected ? '1.5px solid #5B4BFF' : '1px solid #1E1E3A',
        boxShadow: isSelected ? '0 0 0 3px rgba(91,75,255,0.18),0 4px 24px rgba(91,75,255,0.10)' : 'none',
        opacity: isSelected ? 1 : 0.68,
        userSelect:'none',
        transition:'opacity 0.18s,box-shadow 0.18s,border-color 0.18s',
        animation:`rc-fade 0.3s ease ${animIndex * 0.04}s both`,
      }}
      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.opacity='1' }}
      onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.opacity='0.68' }}
    >
      {/* Thumbnail */}
      <div style={{height:100,borderRadius:8,overflow:'hidden',position:'relative',marginBottom:9}}>
        {getThumbnail(relic.thumbnail, relic.coverImage)}

        {/* Attachment count badge */}
        {attCount > 0 && (
          <div style={{
            position:'absolute',top:5,right:5,
            display:'flex',alignItems:'center',gap:3,
            background:'rgba(0,0,0,0.7)',borderRadius:99,padding:'2px 6px',
            fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.85)',
          }}>
            <Paperclip size={8}/>{attCount}
          </div>
        )}

        {/* Revived overlay */}
        {relic.revived && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(91,75,255,0.18)'}}>
            <div style={{background:'#5B4BFF',borderRadius:5,padding:'2px 8px',fontSize:7.5,fontWeight:700,letterSpacing:'0.08em',color:'white',display:'flex',alignItems:'center',gap:4}}>
              <RotateCcw size={8}/> REVIVED → ACTIVE PROJECT
            </div>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
        <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(91,75,255,0.15)',borderRadius:4,padding:'2px 6px',fontSize:9,fontWeight:700,letterSpacing:'0.1em',color:'#7B6FFF'}}>
          <CategoryIcon cat={relic.category}/>{relic.category}
        </div>
        <span style={{fontSize:9,color:'#7E7EA0'}}>{relic.date}</span>
      </div>

      {/* Title */}
      <div style={{fontSize:12,fontStyle:'italic',fontWeight:700,color:'#E8E8F0',marginBottom:4,lineHeight:1.35}}>
        "{relic.title}"
      </div>

      {/* Description */}
      <p style={{fontSize:10,color:'#7E7EA0',lineHeight:1.55,margin:0,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
        {relic.description}
      </p>

      {/* Tags */}
      {relic.tags?.length > 0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:3,marginTop:5}}>
          {relic.tags.slice(0,3).map(t=>(
            <span key={t} style={{fontSize:8,fontWeight:700,letterSpacing:'0.06em',color:'#7B6FFF',background:'rgba(91,75,255,0.12)',borderRadius:99,padding:'1px 6px'}}>{t}</span>
          ))}
          {relic.tags.length > 3 && <span style={{fontSize:8,color:'#7E7EA0',padding:'1px 0'}}>+{relic.tags.length-3}</span>}
        </div>
      )}

      <style>{`@keyframes rc-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
