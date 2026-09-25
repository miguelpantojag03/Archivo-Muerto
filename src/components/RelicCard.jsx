import { RotateCcw, PenLine, FileText, Palette, Tag, StickyNote } from 'lucide-react'
import { getThumbnail } from './Thumbnails.jsx'

function CategoryIcon({ cat }) {
  switch (cat) {
    case 'SKETCH':      return <PenLine size={9} />
    case 'COPYWRITING': return <FileText size={9} />
    case 'PALETTE':     return <Palette size={9} />
    case 'BRANDING':    return <Tag size={9} />
    case 'NOTES':       return <StickyNote size={9} />
    default:            return <FileText size={9} />
  }
}

export default function RelicCard({ relic, isSelected, onSelect, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, relic.id)}
      onClick={() => onSelect(relic.id)}
      style={{
        borderRadius: 12, padding: 10, cursor: 'pointer',
        background: '#1A1A35',
        border: isSelected ? '1.5px solid #5B4BFF' : '1px solid #1E1E3A',
        boxShadow: isSelected ? '0 0 0 3px rgba(91,75,255,0.18), 0 4px 24px rgba(91,75,255,0.10)' : 'none',
        opacity: isSelected ? 1 : 0.68,
        userSelect: 'none',
        transition: 'opacity 0.18s, box-shadow 0.18s, border-color 0.18s',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.opacity = '1' }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.opacity = '0.68' }}
    >
      {/* Thumbnail */}
      <div style={{ height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative', marginBottom: 9 }}>
        {getThumbnail(relic.thumbnail, relic.coverImage)}

        {relic.revived && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(91,75,255,0.18)',
          }}>
            <div style={{
              background: '#5B4BFF', borderRadius: 5, padding: '2px 8px',
              fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em',
              color: 'white', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <RotateCcw size={8} />
              REVIVED → ACTIVE PROJECT
            </div>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(91,75,255,0.15)', borderRadius: 4,
          padding: '2px 6px', fontSize: 9, fontWeight: 700,
          letterSpacing: '0.1em', color: '#7B6FFF',
        }}>
          <CategoryIcon cat={relic.category} />
          {relic.category}
        </div>
        <span style={{ fontSize: 9, color: '#7E7EA0' }}>{relic.date}</span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 12, fontStyle: 'italic', fontWeight: 700, color: '#E8E8F0', marginBottom: 4, lineHeight: 1.35 }}>
        "{relic.title}"
      </div>

      {/* Description */}
      <p style={{
        fontSize: 10, color: '#7E7EA0', lineHeight: 1.55, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {relic.description}
      </p>
    </div>
  )
}
