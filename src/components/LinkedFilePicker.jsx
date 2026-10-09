// ─── LinkedFilePicker ─────────────────────────────────────────────
// Lets the user link a relic to a real external file (not copied into
// the app), with an optional "Asegurar copia" checkbox. Used inside
// NewRelicModal/EditRelicModal — the actual link only persists when
// the modal's own Save runs.

import { Link2, X, FileSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { alpha } from '../styles/tokens.js'
import { basename } from '../lib/fileLinks.js'

export default function LinkedFilePicker({ linkedFile, onPick, onClear, secureCopy, onSecureCopyChange }) {
  const { t } = useTranslation()
  const { color, radius, font } = useTheme()

  if (!linkedFile) {
    return (
      <button type="button" onClick={onPick}
        style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:radius.controlSm,border:`1px dashed ${alpha(color.blue500, 0.4)}`,background:alpha(color.blue500, 0.06),color:color.blue300,fontSize:12,fontWeight:600,fontFamily:font.ui,cursor:'pointer'}}
        onMouseEnter={e=>e.currentTarget.style.background=alpha(color.blue500, 0.14)}
        onMouseLeave={e=>e.currentTarget.style.background=alpha(color.blue500, 0.06)}>
        <Link2 size={13}/>{t('modals.newRelic.linkFile')}
      </button>
    )
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:radius.controlSm,background:alpha(color.blue500, 0.08),border:`1px solid ${alpha(color.blue500, 0.3)}`}}>
        <FileSearch size={13} style={{color:color.blue300,flexShrink:0}}/>
        <span style={{flex:1,fontSize:12,color:color.textPrimary,fontFamily:font.mono,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={linkedFile.path}>
          {basename(linkedFile.path)}
        </span>
        <button type="button" onClick={onPick} style={{background:'none',border:'none',cursor:'pointer',color:color.textSecondary,fontSize:11,fontFamily:font.ui,padding:'2px 4px'}}>
          {t('modals.newRelic.linkFileChange')}
        </button>
        <button type="button" onClick={onClear} style={{background:'none',border:'none',cursor:'pointer',color:color.textSecondary,padding:2,display:'flex'}}>
          <X size={13}/>
        </button>
      </div>
      <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:11,color:color.textSecondary,fontFamily:font.ui}}>
        <input type="checkbox" checked={secureCopy} onChange={e=>onSecureCopyChange(e.target.checked)}
          style={{accentColor:color.blue500,width:13,height:13}}/>
        {t('modals.newRelic.secureCopy')}
      </label>
    </div>
  )
}
