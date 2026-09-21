import { Sparkles, RotateCcw } from 'lucide-react'

export default function RevivalZone({ isDragOver, onDragOver, onDragLeave, onDrop }) {
  return (
    <div
      style={{
        position: 'absolute', bottom: 14, left: 16, right: 16,
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 18px', borderRadius: 12,
        border: `1.5px dashed ${isDragOver ? '#7B6FFF' : '#5B4BFF'}`,
        background: isDragOver ? 'rgba(91,75,255,0.2)' : 'rgba(91,75,255,0.07)',
        boxShadow: isDragOver ? '0 0 24px rgba(91,75,255,0.22)' : 'none',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        zIndex: 10,
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(91,75,255,0.22)', border: '1px solid rgba(91,75,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={16} style={{ color: '#7B6FFF' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#7B6FFF', marginBottom: 2 }}>
          REVIVAL ZONE
        </div>
        <div style={{ fontSize: 11, color: '#A0A0CC' }}>
          Drag any relic here to bring it back to active project
        </div>
      </div>
      <button
        style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: '#5B4BFF', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          transition: 'background 0.12s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#4A3AEE'}
        onMouseLeave={e => e.currentTarget.style.background = '#5B4BFF'}
      >
        <RotateCcw size={14} />
      </button>
    </div>
  )
}
