// ─── SettingsModal ────────────────────────────────────────────────
// User settings: language, theme, AI API key, export.

import { useState }     from 'react'
import { useTranslation } from 'react-i18next'
import { Key, Download, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Modal             from './Modal.jsx'
import { getAIKey, setAIKey, clearAIKey, hasAIKey } from '../lib/aiKeyStorage.js'
import { getRelics }     from '../lib/relicStorage.js'
import { useToast }      from './Toast.jsx'
import { useTheme }      from '../context/ThemeContext.jsx'
import { ThemeControl, LanguageControl } from './ThemeLanguageControls.jsx'

function PreferenceRow({ label, children }) {
  const { color, font } = useTheme()
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:13, fontWeight:600, color:color.textPrimary, fontFamily:font.ui }}>{label}</span>
      {children}
    </div>
  )
}

function ExportSection({ userId }) {
  const { t } = useTranslation()
  const { color } = useTheme()
  const { push } = useToast()

  function exportJSON() {
    const relics = getRelics(userId)
    const blob = new Blob([JSON.stringify(relics, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `archivo-muerto-export-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    push(t('modals.settings.exportedJSON'), 'success')
  }

  function exportCSV() {
    const relics  = getRelics(userId)
    const headers = ['id','title','category','description','project','status','createdAt','discardedAt','tags','responsible']
    const rows    = relics.map(r =>
      headers.map(h => {
        const v = h === 'tags' ? (r.tags||[]).join(';') : (r[h]??'')
        return `"${String(v).replace(/"/g,'""')}"`
      }).join(',')
    )
    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `archivo-muerto-export-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    push(t('modals.settings.exportedCSV'), 'success')
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',color:color.textSecondary,textTransform:'uppercase',marginBottom:4}}>
        {t('modals.settings.exportArchive')}
      </div>
      <div style={{display:'flex',gap:8}}>
        <ExportBtn label={t('modals.settings.exportJSON')} icon={<Download size={13}/>} onClick={exportJSON}/>
        <ExportBtn label={t('modals.settings.exportCSV')}  icon={<Download size={13}/>} onClick={exportCSV}/>
      </div>
    </div>
  )
}

function ExportBtn({ label, icon, onClick }) {
  const { color, radius, font } = useTheme()
  return (
    <button onClick={onClick}
      style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:radius.control,border:`1px solid ${color.bgBorder}`,background:'transparent',color:color.textPrimary,fontSize:12,fontWeight:500,fontFamily:font.ui,cursor:'pointer',transition:'border-color 0.12s,color 0.12s'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=color.blue500;e.currentTarget.style.color=color.blue300}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=color.bgBorder;e.currentTarget.style.color=color.textPrimary}}>
      {icon}{label}
    </button>
  )
}

export default function SettingsModal({ userId, onClose }) {
  const { t }       = useTranslation()
  const { color, radius, font } = useTheme()
  const { push }    = useToast()
  const [key,  setKey]  = useState(getAIKey())
  const [show, setShow] = useState(false)
  const [saved,setSaved] = useState(false)

  function handleSaveKey() {
    if (key.trim()) { setAIKey(key.trim()); setSaved(true); setTimeout(()=>setSaved(false),2000); push(t('modals.settings.apiKeySaved'),'success') }
    else            { clearAIKey(); push(t('modals.settings.apiKeyCleared'),'info') }
  }

  return (
    <Modal title={t('modals.settings.title')} onClose={onClose}>
      <div style={{display:'flex',flexDirection:'column',gap:20}}>

        {/* Language + Theme */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <PreferenceRow label={t('modals.settings.language')}><LanguageControl/></PreferenceRow>
          <PreferenceRow label={t('modals.settings.theme')}><ThemeControl/></PreferenceRow>
        </div>

        <div style={{height:1,background:color.bgBorder}}/>

        {/* AI API Key */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <Key size={14} style={{color:color.blue300}}/>
            <span style={{fontSize:13,fontWeight:700,color:color.textPrimary}}>{t('modals.settings.apiKeyLabel')}</span>
            {hasAIKey() && <span style={{fontSize:9,fontWeight:700,color:color.sage500,background:'rgba(53,112,72,0.12)',borderRadius:99,padding:'2px 8px'}}>{t('modals.settings.active')}</span>}
          </div>
          <p style={{fontSize:11,color:color.textSecondary,lineHeight:1.6,margin:0}}>
            {t('modals.settings.apiKeyDescription')}
          </p>
          <p style={{fontSize:10,color:color.terracotta500,lineHeight:1.5,margin:0}}>
            {t('modals.settings.apiKeyWarning')}
          </p>
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1,position:'relative'}}>
              <input
                type={show?'text':'password'}
                value={key}
                onChange={e=>setKey(e.target.value)}
                placeholder={t('modals.settings.apiKeyPlaceholder')}
                style={{width:'100%',padding:'8px 36px 8px 10px',borderRadius:radius.control,background:color.bgBase,border:`1px solid ${color.bgBorder}`,color:color.textPrimary,fontSize:12,fontFamily:font.mono,outline:'none'}}
                onFocus={e=>e.target.style.borderColor=color.blue500}
                onBlur={e=>e.target.style.borderColor=color.bgBorder}
                onKeyDown={e=>e.key==='Enter'&&handleSaveKey()}
              />
              <button type="button" onClick={()=>setShow(s=>!s)}
                style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:color.textSecondary,padding:2}}>
                {show?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
            <button onClick={handleSaveKey}
              style={{padding:'8px 14px',borderRadius:radius.control,border:'none',background:saved?color.sage600:color.blue500,color:color.onPrimary,fontSize:12,fontWeight:600,fontFamily:font.ui,cursor:'pointer',transition:'background 0.15s',display:'flex',alignItems:'center',gap:5}}
              onMouseEnter={e=>{if(!saved)e.currentTarget.style.background=color.blue600}}
              onMouseLeave={e=>{if(!saved)e.currentTarget.style.background=saved?color.sage600:color.blue500}}>
              {saved?<><CheckCircle size={13}/>{t('modals.settings.saved')}</>:t('modals.settings.save')}
            </button>
          </div>
          {key && (
            <button onClick={()=>{clearAIKey();setKey('');push(t('modals.settings.apiKeyCleared'),'info')}}
              style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:color.textSecondary,background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:font.ui,width:'fit-content'}}
              onMouseEnter={e=>{e.currentTarget.style.color=color.terracotta500}}
              onMouseLeave={e=>{e.currentTarget.style.color=color.textSecondary}}>
              <Trash2 size={11}/>{t('modals.settings.removeKey')}
            </button>
          )}
        </div>

        <div style={{height:1,background:color.bgBorder}}/>

        {/* Export */}
        <ExportSection userId={userId}/>
      </div>
    </Modal>
  )
}
