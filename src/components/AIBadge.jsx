// ─── AIBadge ──────────────────────────────────────────────────────
// Small reusable indicator for AI-powered buttons and result blocks.
import { Sparkles } from 'lucide-react'
import { hasAIKey } from '../lib/aiKeyStorage.js'
import { useTheme } from '../context/ThemeContext.jsx'

export default function AIBadge({ label = 'AI', size = 'sm' }) {
  const { color } = useTheme()
  const isReal = hasAIKey()
  const fs = size === 'xs' ? 9 : 10
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:3,
      fontSize:fs, fontWeight:700, letterSpacing:'0.06em',
      color: isReal ? color.blue300 : color.textSecondary,
      background: isReal ? 'rgba(93,133,168,0.15)' : 'rgba(152,147,168,0.1)',
      borderRadius:99, padding:`2px ${size==='xs'?6:8}px`,
    }}>
      <Sparkles size={fs-1}/>{label}
    </span>
  )
}
