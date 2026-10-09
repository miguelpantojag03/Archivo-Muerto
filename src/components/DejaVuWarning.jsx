// ─── DejaVuWarning ────────────────────────────────────────────────
// Inline, dismissible banner shown inside NewRelicModal when the
// title/description being typed look like a near-duplicate of
// something already archived. See src/lib/similarity.js for the
// (offline, lexical-only) matching logic.

import { AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { alpha } from '../styles/tokens.js'
import { formatDate } from '../lib/formatDate.js'

export default function DejaVuWarning({ matches, onView, onDismiss }) {
  const { t } = useTranslation()
  const { color, radius, font } = useTheme()
  if (!matches.length) return null

  const [best, ...rest] = matches

  return (
    <div style={{
      display:'flex', gap:10, padding:'10px 12px', borderRadius:radius.controlSm,
      background:alpha(color.terracotta500, 0.08), border:`1px solid ${alpha(color.terracotta500, 0.3)}`,
    }}>
      <AlertTriangle size={15} style={{color:color.terracotta500, flexShrink:0, marginTop:1}}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:12, color:color.textPrimary, fontFamily:font.ui, lineHeight:1.5}}>
          {t('modals.newRelic.dejaVu.message', { title: best.relic.title })}
          {rest.length > 0 && ' ' + t('modals.newRelic.dejaVu.moreCount', { count: rest.length })}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8, marginTop:6, fontSize:11, color:color.textSecondary, fontFamily:font.mono}}>
          <span>{t(`relicCard.category.${best.relic.category}`, best.relic.category)}</span>
          <span>·</span>
          <span>{formatDate(best.relic.discardedAt)}</span>
          <span>·</span>
          <span>{best.relic.revived ? t('modals.newRelic.dejaVu.statusRevived') : t('modals.newRelic.dejaVu.statusArchived')}</span>
        </div>
        <button type="button" onClick={() => onView(best.relic.id)}
          style={{marginTop:7, padding:0, background:'none', border:'none', cursor:'pointer', color:color.blue300, fontSize:12, fontWeight:600, fontFamily:font.ui, textDecoration:'underline'}}>
          {t('modals.newRelic.dejaVu.viewAction')}
        </button>
      </div>
      <button type="button" onClick={onDismiss} aria-label={t('common.dismiss')}
        style={{background:'none', border:'none', cursor:'pointer', color:color.textSecondary, padding:2, flexShrink:0, height:'fit-content'}}>
        <X size={13}/>
      </button>
    </div>
  )
}
