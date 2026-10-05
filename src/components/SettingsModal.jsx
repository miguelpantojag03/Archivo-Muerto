// ─── SettingsModal ────────────────────────────────────────────────
// User settings: AI API key, export, preferences.

import { useState }     from 'react'
import { Key, Download, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Modal             from './Modal.jsx'
import { getAIKey, setAIKey, clearAIKey, hasAIKey } from '../lib/aiKeyStorage.js'
import { getRelics }     from '../lib/relicStorage.js'
import { useToast }      from './Toast.jsx'

function ExportSection({ userId }) {
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
    push('Exported as JSON.', 'success')
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
    push('Exported as CSV.', 'success')
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',color:'#7E7EA0',textTransform:'uppercase',marginBottom:4}}>
        Export Archive
      </div>
      <div style={{display:'flex',gap:8}}>
        <ExportBtn label="Export JSON" icon={<Download size={13}/>} onClick={exportJSON}/>
        <ExportBtn label="Export CSV"  icon={<Download size={13}/>} onClick={exportCSV}/>
      </div>
    </div>
  )
}

function ExportBtn({ label, icon, onClick }) {
  return (
    <button onClick={onClick}
      style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:8,border:'1px solid #2A2A48',background:'transparent',color:'#C8C8E0',fontSize:12,fontWeight:500,fontFamily:'inherit',cursor:'pointer',transition:'border-color 0.12s,color 0.12s'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='#5B4BFF';e.currentTarget.style.color='#7B6FFF'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='#2A2A48';e.currentTarget.style.color='#C8C8E0'}}>
      {icon}{label}
    </button>
  )
}

export default function SettingsModal({ userId, onClose }) {
  const { push }    = useToast()
  const [key,  setKey]  = useState(getAIKey())
  const [show, setShow] = useState(false)
  const [saved,setSaved] = useState(false)

  function handleSaveKey() {
    if (key.trim()) { setAIKey(key.trim()); setSaved(true); setTimeout(()=>setSaved(false),2000); push('API key saved.','success') }
    else            { clearAIKey(); push('API key cleared.','info') }
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <div style={{display:'flex',flexDirection:'column',gap:20}}>

        {/* AI API Key */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <Key size={14} style={{color:'#7B6FFF'}}/>
            <span style={{fontSize:13,fontWeight:700,color:'#E8E8F0'}}>Anthropic API Key</span>
            {hasAIKey() && <span style={{fontSize:9,fontWeight:700,color:'#4ADE80',background:'rgba(74,222,128,0.12)',borderRadius:99,padding:'2px 8px'}}>ACTIVE</span>}
          </div>
          <p style={{fontSize:11,color:'#7E7EA0',lineHeight:1.6,margin:0}}>
            Enter your Anthropic API key to unlock real AI features (tag suggestions, description enhancer, relic analysis, archive insights). Without a key, a smart mock is used instead — all features still work.
          </p>
          <p style={{fontSize:10,color:'#E05555',lineHeight:1.5,margin:0}}>
            ⚠️ Demo only: the key is stored in your browser's localStorage. For production, route calls through your own backend.
          </p>
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1,position:'relative'}}>
              <input
                type={show?'text':'password'}
                value={key}
                onChange={e=>setKey(e.target.value)}
                placeholder="sk-ant-api03-…"
                style={{width:'100%',padding:'8px 36px 8px 10px',borderRadius:8,background:'#0F0F22',border:'1px solid #2A2A48',color:'#E8E8F0',fontSize:12,fontFamily:'monospace',outline:'none'}}
                onFocus={e=>e.target.style.borderColor='#5B4BFF'}
                onBlur={e=>e.target.style.borderColor='#2A2A48'}
                onKeyDown={e=>e.key==='Enter'&&handleSaveKey()}
              />
              <button type="button" onClick={()=>setShow(s=>!s)}
                style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#7E7EA0',padding:2}}>
                {show?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
            <button onClick={handleSaveKey}
              style={{padding:'8px 14px',borderRadius:8,border:'none',background:saved?'#3A5A3A':'#5B4BFF',color:'white',fontSize:12,fontWeight:600,fontFamily:'inherit',cursor:'pointer',transition:'background 0.15s',display:'flex',alignItems:'center',gap:5}}
              onMouseEnter={e=>{if(!saved)e.currentTarget.style.background='#4A3AEE'}}
              onMouseLeave={e=>{if(!saved)e.currentTarget.style.background=saved?'#3A5A3A':'#5B4BFF'}}>
              {saved?<><CheckCircle size={13}/>Saved</>:'Save'}
            </button>
          </div>
          {key && (
            <button onClick={()=>{clearAIKey();setKey('');push('API key cleared.','info')}}
              style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#7E7EA0',background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit',width:'fit-content'}}
              onMouseEnter={e=>{e.currentTarget.style.color='#E05555'}}
              onMouseLeave={e=>{e.currentTarget.style.color='#7E7EA0'}}>
              <Trash2 size={11}/>Remove key
            </button>
          )}
        </div>

        <div style={{height:1,background:'#1E1E3A'}}/>

        {/* Export */}
        <ExportSection userId={userId}/>
      </div>
    </Modal>
  )
}
