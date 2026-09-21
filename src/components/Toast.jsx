import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const id = useRef(0)

  const push = useCallback((message, type = 'info', duration = 4000) => {
    const tid = ++id.current
    setToasts(prev => [...prev, { id: tid, message, type }])
    if (duration > 0) {
      setTimeout(() => dismiss(tid), duration)
    }
    return tid
  }, [])

  const dismiss = useCallback((tid) => {
    setToasts(prev => prev.filter(t => t.id !== tid))
  }, [])

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return ctx
}

const ICONS = {
  success: <CheckCircle size={15} style={{ color: '#4ADE80' }} />,
  error:   <AlertCircle size={15} style={{ color: '#E05555' }} />,
  info:    <Info        size={15} style={{ color: '#7B6FFF' }} />,
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
      }}
      aria-live="polite"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        background: '#1A1A35',
        border: '1px solid #2A2A48',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        color: '#E8E8F0',
        fontSize: 13,
        minWidth: 260,
        maxWidth: 360,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {ICONS[toast.type] || ICONS.info}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ color: '#7E7EA0', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
      >
        <X size={13} />
      </button>
    </div>
  )
}
