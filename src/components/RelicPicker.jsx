// ─── RelicPicker ──────────────────────────────────────────────────
// Searchable combobox for linking one relic to another (lineage:
// "replaces" / "inspired by"). Shows a chip with the chosen relic's
// title once set; otherwise a text input that filters by title.

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { alpha } from '../styles/tokens.js'

export default function RelicPicker({ relics, value, onChange, placeholder }) {
  const { t } = useTranslation()
  const { color, radius, font } = useTheme()
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)
  const ref = useRef(null)

  const selected = relics.find(r => r.id === value) ?? null

  useEffect(() => {
    function onOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  if (selected) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:radius.controlSm,background:alpha(color.blue500, 0.08),border:`1px solid ${alpha(color.blue500, 0.3)}`}}>
        <span style={{flex:1,fontSize:12,color:color.textPrimary,fontFamily:font.ui,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {selected.title}
        </span>
        <button type="button" onClick={() => onChange(null)}
          style={{background:'none',border:'none',cursor:'pointer',color:color.textSecondary,padding:2,display:'flex',flexShrink:0}}>
          <X size={13}/>
        </button>
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const matches = (q ? relics.filter(r => r.title.toLowerCase().includes(q)) : relics).slice(0, 6)

  return (
    <div ref={ref} style={{position:'relative'}}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{width:'100%',padding:'7px 10px',borderRadius:radius.controlSm,background:color.bgBase,border:`1px solid ${color.bgBorder}`,color:color.textPrimary,fontSize:12,fontFamily:font.ui,outline:'none'}}
        onFocusCapture={e => { e.target.style.borderColor = color.blue500; e.target.style.boxShadow = `0 0 0 3px ${alpha(color.blue500, 0.12)}` }}
        onBlurCapture={e => { e.target.style.borderColor = color.bgBorder; e.target.style.boxShadow = 'none' }}
      />
      {open && (
        <div className="glass glass-neutral" style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,borderRadius:radius.card,padding:'4px 0',zIndex:50,maxHeight:180,overflowY:'auto'}}>
          {matches.length > 0 ? matches.map(r => (
            <button key={r.id} type="button"
              onClick={() => { onChange(r.id); setQuery(''); setOpen(false) }}
              style={{display:'block',width:'100%',textAlign:'left',padding:'7px 12px',background:'none',border:'none',cursor:'pointer',fontSize:12,color:color.textPrimary,fontFamily:font.ui,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}
              onMouseEnter={e => e.currentTarget.style.background = color.hoverOverlay}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {r.title}
            </button>
          )) : (
            <div style={{padding:'8px 12px',fontSize:11,color:color.textSecondary}}>{t('common.noResults')}</div>
          )}
        </div>
      )}
    </div>
  )
}
