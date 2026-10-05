// ─── NewRelicModal ────────────────────────────────────────────────
// Creates a new relic with cover image, tags + attachments.
// Tmp-relic pattern: attachments are staged under a temp id, then the
// id is reused when the relic is saved.  On CANCEL the orphan
// attachments are cleaned up from IndexedDB.

import { useState, useRef, useEffect, useCallback } from 'react'
import { X }                         from 'lucide-react'
import { useAuth }                   from '../auth/AuthProvider.jsx'
import { useToast }                  from './Toast.jsx'
import Modal                         from './Modal.jsx'
import AttachmentList                from './AttachmentList.jsx'
import { useAttachments }            from '../hooks/useAttachments.js'
import { getThumbnail }              from './Thumbnails.jsx'
import { deleteAttachmentsForRelic } from '../lib/attachmentStorage.js'
import { CATEGORIES, CATEGORY_FILTER_MAP, CATEGORY_THUMB_MAP } from '../constants/categories.js'
import { Spinner }                   from './FormField.jsx'
import { ImagePlus }                 from 'lucide-react'
import AITagSuggester                from './AITagSuggester.jsx'

// ── cover image helpers ───────────────────────────────────────────
const COVER_MAX_B    = 5 * 1024 * 1024
const COVER_IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

function resizeToBase64(file, maxW = 600, maxH = 400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width: w, height: h } = img
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h)
        w = Math.round(w * ratio); h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject; img.src = url
  })
}

// ── CoverImagePicker ──────────────────────────────────────────────
function CoverImagePicker({ coverImage, onChange, fallbackThumb }) {
  const inputRef  = useRef(null)
  const [err, setErr]       = useState('')
  const [busy, setBusy]     = useState(false)

  async function handleFile(file) {
    setErr('')
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!COVER_IMG_EXTS.includes(ext)) { setErr('Only JPG, PNG, WEBP or GIF.'); return }
    if (file.size > COVER_MAX_B)       { setErr('Max 5 MB per image.'); return }
    setBusy(true)
    try   { onChange(await resizeToBase64(file)) }
    catch { setErr('Could not process image.') }
    finally { setBusy(false) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div onClick={()=>!busy&&inputRef.current?.click()}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f)}}
          title="Click or drag image"
          style={{
            width:96,height:64,borderRadius:8,overflow:'hidden',
            border:'1px solid #2A2A48',flexShrink:0,position:'relative',
            cursor:'pointer',background:'#0F0F22',
          }}>
          {busy
            ? <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F22'}}><Spinner/></div>
            : <>
                {getThumbnail(fallbackThumb, coverImage)}
                <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
                  <ImagePlus size={18} style={{color:'white'}}/>
                </div>
              </>
          }
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <button type="button" onClick={()=>inputRef.current?.click()} disabled={busy}
            style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'1px solid #2A2A48',background:'transparent',color:'#C8C8E0',fontSize:12,fontWeight:500,fontFamily:'inherit',cursor:busy?'not-allowed':'pointer',transition:'border-color 0.12s'}}
            onMouseEnter={e=>{if(!busy)e.currentTarget.style.borderColor='#5B4BFF'}}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#2A2A48'}>
            <ImagePlus size={13}/>{coverImage?'Change image':'Upload image'}
          </button>
          {coverImage&&<button type="button" onClick={()=>onChange(null)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'1px solid #2A2A48',background:'transparent',color:'#7E7EA0',fontSize:12,fontWeight:500,fontFamily:'inherit',cursor:'pointer',transition:'border-color 0.12s,color 0.12s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#E05555';e.currentTarget.style.color='#E05555'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#2A2A48';e.currentTarget.style.color='#7E7EA0'}}><X size={13}/>Remove</button>}
          <span style={{fontSize:10,color:'#7E7EA0'}}>JPG, PNG, WEBP · Max 5 MB</span>
        </div>
      </div>
      {err&&<span style={{fontSize:11,color:'#E05555',padding:'4px 8px',borderRadius:5,background:'rgba(224,85,85,0.1)'}}>{err}</span>}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={e=>{const f=e.target.files[0];if(f)handleFile(f);e.target.value=''}}
        style={{display:'none'}} aria-label="Upload cover image"/>
    </div>
  )
}

// ── TagsInput ─────────────────────────────────────────────────────
export function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  function add(raw) {
    const t = raw.trim().toLowerCase()
    if (!t || tags.includes(t) || tags.length >= 10) return
    onChange([...tags, t])
    setInput('')
  }

  function remove(t) { onChange(tags.filter(x=>x!==t)) }

  return (
    <div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:6}}>
        {tags.map(t=>(
          <span key={t} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700,letterSpacing:'0.06em',color:'#7B6FFF',background:'rgba(91,75,255,0.15)',borderRadius:99,padding:'3px 9px'}}>
            {t}
            <button type="button" onClick={()=>remove(t)} style={{background:'none',border:'none',cursor:'pointer',color:'#7B6FFF',padding:0,display:'flex',lineHeight:1}}>
              <X size={9}/>
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add(input)}}}
        placeholder="Type a tag and press Enter…"
        style={{width:'100%',padding:'7px 10px',borderRadius:7,background:'#0F0F22',border:'1px solid #2A2A48',color:'#E8E8F0',fontSize:12,fontFamily:'inherit',outline:'none'}}
        onFocus={e=>{e.target.style.borderColor='#5B4BFF';e.target.style.boxShadow='0 0 0 3px rgba(91,75,255,0.12)'}}
        onBlur={e=>{e.target.style.borderColor='#2A2A48';e.target.style.boxShadow='none'}}
      />
    </div>
  )
}

// ── Tmp id management ─────────────────────────────────────────────
function makeTmpId() { return `relic_${Date.now()}_${Math.random().toString(36).slice(2,5)}` }

// ── Main modal ────────────────────────────────────────────────────
export default function NewRelicModal({ onClose, onAdd }) {
  const { user }  = useAuth()
  const { push }  = useToast()

  // Stable tmp id per modal instance (not module-level variable)
  const tmpIdRef = useRef(makeTmpId())
  const tmpRelicId = tmpIdRef.current

  const [title,       setTitle]       = useState('')
  const [category,    setCategory]    = useState('SKETCH')
  const [description, setDesc]        = useState('')
  const [notes,       setNotes]       = useState('')
  const [responsible, setResponsible] = useState(user?.fullName??'')
  const [tags,        setTags]        = useState([])
  const [coverImage,  setCoverImage]  = useState(null)
  const [titleError,  setTitleError]  = useState('')
  const [saving,      setSaving]      = useState(false)

  const {
    attachments, loading:attLoading, error:attError, setError:setAttError,
    addFiles, remove:removeAtt, download:downloadAtt, getPreviewURL,
  } = useAttachments(tmpRelicId, user?.id)

  // Cleanup orphan attachments if the modal is closed without saving
  const cleanupOrphans = useCallback(async () => {
    if (attachments.length > 0) {
      await deleteAttachmentsForRelic(tmpRelicId)
    }
  }, [attachments.length, tmpRelicId])

  function handleClose() {
    cleanupOrphans()
    onClose()
  }

  async function handleAddFiles(files) {
    setAttError(null)
    try { await addFiles(files) } catch (err) { setAttError(err.message) }
  }

  async function handleSave() {
    if (!title.trim()) { setTitleError('Title is required'); return }
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const fmt = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
      const relic = {
        id:          tmpRelicId,
        category,
        title:       title.trim(),
        description: description.trim()||'No description.',
        notes:       notes.trim(),
        responsible: responsible.trim(),
        coverImage:  coverImage??null,
        tags,
        project:     user?.activeProject||'General',
        filter:      CATEGORY_FILTER_MAP[category],
        thumbnail:   CATEGORY_THUMB_MAP[category],
        revived:false, status:'archived',
        createdAt:now, discardedAt:now, updatedAt:now,
        date:fmt, created:fmt, discarded:fmt,
      }
      onAdd(relic)
      onClose()  // don't clean orphans — the relic now owns those attachments
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const S = {
    input:{width:'100%',padding:'8px 10px',borderRadius:7,background:'#0F0F22',border:'1px solid #2A2A48',color:'#E8E8F0',fontSize:13,fontFamily:'inherit',outline:'none'},
    label:{fontSize:12,fontWeight:600,color:'#C8C8E0',marginBottom:5,display:'block'},
    focus:e=>{e.target.style.borderColor='#5B4BFF';e.target.style.boxShadow='0 0 0 3px rgba(91,75,255,0.12)'},
    blur: e=>{e.target.style.borderColor='#2A2A48';e.target.style.boxShadow='none'},
    sec:{fontSize:10,fontWeight:700,letterSpacing:'0.1em',color:'#7E7EA0',textTransform:'uppercase'},
  }

  return (
    <Modal title="New Relic" onClose={handleClose}>
      <div style={{display:'flex',flexDirection:'column',gap:14,maxHeight:'72vh',overflowY:'auto',paddingRight:2}}>

        <div style={S.sec}>General Information</div>

        {/* Title */}
        <div>
          <label style={S.label}>Title <span style={{color:'#E05555'}}>*</span></label>
          <input style={{...S.input,borderColor:titleError?'#E05555':'#2A2A48'}}
            value={title} onChange={e=>{setTitle(e.target.value);setTitleError('')}}
            placeholder="What was this idea?" autoFocus
            onFocus={S.focus} onBlur={S.blur}
            onKeyDown={e=>e.key==='Enter'&&handleSave()}/>
          {titleError&&<span style={{fontSize:11,color:'#E05555',marginTop:4,display:'block'}}>{titleError}</span>}
        </div>

        {/* Category */}
        <div>
          <label style={S.label}>Category</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {CATEGORIES.map(c=>(
              <button key={c} type="button" onClick={()=>setCategory(c)}
                style={{padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',background:category===c?'#5B4BFF':'rgba(91,75,255,0.1)',color:category===c?'white':'#7B6FFF',fontSize:10,fontWeight:700,letterSpacing:'0.08em',fontFamily:'inherit',transition:'background 0.12s'}}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Cover Image */}
        <div style={{borderTop:'1px solid #1E1E3A',paddingTop:14}}>
          <div style={{...S.sec,marginBottom:10}}>Cover Image</div>
          <CoverImagePicker coverImage={coverImage} onChange={setCoverImage} fallbackThumb={CATEGORY_THUMB_MAP[category]}/>
        </div>

        {/* Details */}
        <div style={{borderTop:'1px solid #1E1E3A',paddingTop:14}}>
          <div style={{...S.sec,marginBottom:10}}>Details</div>
          <label style={S.label}>Responsible</label>
          <input style={S.input} value={responsible} onChange={e=>setResponsible(e.target.value)} placeholder="Who discarded this?" onFocus={S.focus} onBlur={S.blur}/>
        </div>

        <div>
          <label style={S.label}>Description</label>
          <textarea style={{...S.input,resize:'vertical',minHeight:70}} value={description} onChange={e=>setDesc(e.target.value)} placeholder="Why was it discarded?" rows={3} onFocus={S.focus} onBlur={S.blur}/>
        </div>

        <div>
          <label style={S.label}>Additional Notes</label>
          <textarea style={{...S.input,resize:'vertical',minHeight:50}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any extra context…" rows={2} onFocus={S.focus} onBlur={S.blur}/>
        </div>

        {/* Tags */}
        <div style={{borderTop:'1px solid #1E1E3A',paddingTop:14}}>
          <div style={{...S.sec,marginBottom:10}}>Tags</div>
          <TagsInput tags={tags} onChange={setTags}/>
          {/* AI tag suggester — only shows button, no API call yet */}
          <AITagSuggester
            title={title}
            description={description}
            currentTags={tags}
            onAdd={suggested=>setTags(prev=>[...new Set([...prev,...suggested])])}
          />
        </div>

        {/* Attachments */}
        <div style={{borderTop:'1px solid #1E1E3A',paddingTop:14}}>
          <AttachmentList
            attachments={attachments} loading={attLoading} error={attError}
            onAddFiles={handleAddFiles} onDelete={removeAtt}
            onDownload={downloadAtt} getPreviewURL={getPreviewURL}/>
        </div>
      </div>

      {/* Footer */}
      <div style={{display:'flex',gap:10,marginTop:18}}>
        <button onClick={handleClose} style={{flex:1,padding:'9px 0',borderRadius:8,border:'1px solid #2A2A48',background:'transparent',color:'#7E7EA0',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>Cancel</button>
        <button onClick={handleSave} disabled={saving}
          style={{flex:2,padding:'9px 0',borderRadius:8,border:'none',background:saving?'#3A2ECC':'#5B4BFF',color:'white',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:saving?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'background 0.12s'}}
          onMouseEnter={e=>{if(!saving)e.currentTarget.style.background='#4A3AEE'}}
          onMouseLeave={e=>{if(!saving)e.currentTarget.style.background='#5B4BFF'}}>
          {saving&&<Spinner/>}{saving?'Saving…':'Save Relic'}
        </button>
      </div>
    </Modal>
  )
}
