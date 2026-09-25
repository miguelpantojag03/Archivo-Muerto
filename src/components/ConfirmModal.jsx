// ─── ConfirmModal ─────────────────────────────────────────────────
// Styled replacement for window.confirm().
// Usage:
//   const { confirm, ConfirmModalUI } = useConfirm()
//   ...
//   <ConfirmModalUI />
//   ...
//   if (await confirm({ title: '...', message: '...', danger: true })) { ... }

import { useState, useCallback, useRef } from 'react'
import { AlertTriangle, Info } from 'lucide-react'

// ── Hook ──────────────────────────────────────────────────────────
export function useConfirm() {
  const [state,   setState]   = useState(null)  // { title, message, danger, confirmLabel, cancelLabel }
  const resolveRef            = useRef(null)

  const confirm = useCallback(({ title, message, danger = false, confirmLabel, cancelLabel }) => {
    return new Promise(resolve => {
      resolveRef.current = resolve
      setState({ title, message, danger, confirmLabel, cancelLabel })
    })
  }, [])

  function handleConfirm() { setState(null); resolveRef.current?.(true)  }
  function handleCancel()  { setState(null); resolveRef.current?.(false) }

  function ConfirmModalUI() {
    if (!state) return null
    return (
      <ConfirmModal
        {...state}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
  }

  return { confirm, ConfirmModalUI }
}

// ── Presentational component ──────────────────────────────────────
function ConfirmModal({ title, message, danger, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const Icon = danger ? AlertTriangle : Info

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'am-fade 0.12s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#1A1A35', border: '1px solid #2A2A48',
        borderRadius: 14, padding: '28px 24px 24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'am-slide-up 0.15s ease',
      }}>
        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: danger ? 'rgba(224,85,85,0.12)' : 'rgba(91,75,255,0.12)',
            border: `1px solid ${danger ? 'rgba(224,85,85,0.3)' : 'rgba(91,75,255,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} style={{ color: danger ? '#E05555' : '#7B6FFF' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E8E8F0', lineHeight: 1.3 }}>
              {title}
            </div>
            {message && (
              <div style={{ fontSize: 13, color: '#7E7EA0', marginTop: 5, lineHeight: 1.55 }}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            autoFocus
            style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid #2A2A48',
              background: 'transparent', color: '#C8C8E0',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
              transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#5B4BFF'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A48'}
          >
            {cancelLabel ?? 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: danger ? '#E05555' : '#5B4BFF',
              color: 'white', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = danger ? '#C04040' : '#4A3AEE'}
            onMouseLeave={e => e.currentTarget.style.background = danger ? '#E05555' : '#5B4BFF'}
          >
            {confirmLabel ?? (danger ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes am-fade     { from { opacity:0 } to { opacity:1 } }
        @keyframes am-slide-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  )
}
