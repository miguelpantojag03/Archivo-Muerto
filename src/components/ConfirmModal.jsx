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
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'

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
  const { t } = useTranslation()
  const { color, radius, font, spring } = useTheme()
  const Icon = danger ? AlertTriangle : Info

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => { if (e.target === e.currentTarget) onCancel() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(5,7,9,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={spring.drop}
          className="glass glass-neutral"
          style={{
            width: '100%', maxWidth: 380,
            borderRadius: radius.glass, padding: '28px 24px 24px',
          }}>
          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: radius.control, flexShrink: 0,
              background: danger ? 'rgba(201,123,110,0.12)' : 'rgba(93,133,168,0.12)',
              border: `1px solid ${danger ? 'rgba(201,123,110,0.3)' : 'rgba(93,133,168,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} style={{ color: danger ? color.terracotta500 : color.blue300 }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, fontFamily: font.display, color: color.textPrimary, lineHeight: 1.3 }}>
                {title}
              </div>
              {message && (
                <div style={{ fontSize: 13, color: color.textSecondary, marginTop: 5, lineHeight: 1.55, fontFamily: font.ui }}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              autoFocus
              style={{
                padding: '8px 18px', borderRadius: radius.control, border: `1px solid ${color.bgBorder}`,
                background: 'transparent', color: color.textPrimary,
                fontSize: 13, fontWeight: 500, fontFamily: font.ui, cursor: 'pointer',
              }}
            >
              {cancelLabel ?? t('common.cancel')}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              style={{
                padding: '8px 18px', borderRadius: radius.control, border: 'none',
                background: danger ? color.terracotta500 : color.blue500,
                color: color.onPrimary, fontSize: 13, fontWeight: 700,
                fontFamily: font.ui, cursor: 'pointer',
              }}
            >
              {confirmLabel ?? (danger ? t('common.delete') : t('common.confirm'))}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
