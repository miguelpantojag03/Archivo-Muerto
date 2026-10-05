// ─── AIBadge ──────────────────────────────────────────────────────
// Small reusable indicator for AI-powered buttons and result blocks.
import { Sparkles } from 'lucide-react'
import { hasAIKey } from '../lib/aiKeyStorage.js'

export default function AIBadge({ label = 'AI', size = 'sm' }) {
  const isReal = hasAIKey()
  const fs = size === 'xs' ? 9 : 10
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:3,
      fontSize:fs, fontWeight:700, letterSpacing:'0.06em',
      color: isReal ? '#7B6FFF' : '#7E7EA0',
      background: isReal ? 'rgba(91,75,255,0.15)' : 'rgba(126,126,160,0.1)',
      borderRadius:99, padding:`2px ${size==='xs'?6:8}px`,
    }}>
      <Sparkles size={fs-1}/>{label}
    </span>
  )
}
