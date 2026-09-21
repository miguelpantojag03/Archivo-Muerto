import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'am-fade 0.15s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#1A1A35', border: '1px solid #2A2A48', borderRadius: 14,
        padding: '24px 24px 20px', width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'am-slide-up 0.18s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#E8E8F0' }}>{title}</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E7EA0', padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8E8F0'}
            onMouseLeave={e => e.currentTarget.style.color = '#7E7EA0'}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes am-fade     { from { opacity:0; }                        to { opacity:1; } }
        @keyframes am-slide-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}
