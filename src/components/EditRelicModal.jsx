// ─── EditRelicModal ───────────────────────────────────────────────
// Edit an existing relic: fields, cover image and attachments.

import { useState, useRef } from 'react'
import { useAuth }          from '../auth/AuthProvider.jsx'
import Modal                from './Modal.jsx'
import AttachmentList       from './AttachmentList.jsx'
import { useAttachments }   from '../hooks/useAttachments.js'
import { useConfirm }       from './ConfirmModal.jsx'
import { CATEGORIES, CATEGORY_FILTER_MAP, CATEGORY_THUMB_MAP } from '../constants/categories.js'
import { getThumbnail }     from './Thumbnails.jsx'
import { Spinner }          from './FormField.jsx'
import { useToast }         from './Toast.jsx'
import { ImagePlus, X, RefreshCw } from 'lucide-react'

// ── Cover image helpers ───────────────────────────────────────────
const COVER_MAX_MB   = 5
const COVER_MAX_B    = COVER_MAX_MB * 1024 * 1024
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
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = url
  })
}

// ── CoverImagePicker sub-component ───────────────────────────────
function CoverImagePicker({ coverImage, onChange, fallbackThumb }) {
  const inputRef       = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleFile(file) {
    setError('')
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!COVER_IMG_EXTS.includes(ext)) {
      setError(`Only images allowed: ${COVER_IMG_EXTS.join(', ')}`)
      return
    }
    if (file.size > COVER_MAX_B) {
      setError(`Image too large. Max ${COVER_MAX_MB} MB.`)
      return
    }
    setLoading(true)
    try {
      const b64 = await resizeToBase64(file)
      onChange(b64)
    } catch {
      setError('Could not process the image. Please try another file.')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e) {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

        {/* Preview */}
        <div
          style={{
            width: 96, height: 64, borderRadius: 8, overflow: 'hidden',
            border: '1px solid #2A2A48', flexShrink: 0, position: 'relative',
            cursor: 'pointer', background: '#0F0F22',
          }}
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          title="Click or drag an image to change cover"
        >
          {loading ? (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#0F0F22',
            }}>
              <Spinner />
            </div>
          ) : (
            <>
              {getThumbnail(fallbackThumb, coverImage)}
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
              >
                <ImagePlus size={18} style={{ color: 'white' }} />
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 7, border: '1px solid #2A2A48',
              background: 'transparent', color: '#C8C8E0',
              fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#5B4BFF' }}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A48'}
          >
            <ImagePlus size={13} />
            {coverImage ? 'Change image' : 'Upload image'}
          </button>

          {coverImage && (
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 7, border: '1px solid #2A2A48',
                background: 'transparent', color: '#7E7EA0',
                fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                transition: 'border-color 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E05555'; e.currentTarget.style.color = '#E05555' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A48'; e.currentTarget.style.color = '#7E7EA0' }}
            >
              <X size={13} /> Remove
            </button>
          )}

          <div style={{ fontSize: 10, color: '#7E7EA0', lineHeight: 1.5 }}>
            JPG, PNG, WEBP · Max {COVER_MAX_MB} MB
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          fontSize: 11, color: '#E05555', padding: '6px 10px',
          borderRadius: 6, background: 'rgba(224,85,85,0.1)',
          border: '1px solid rgba(224,85,85,0.25)',
        }}>
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Upload cover image"
      />
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────
export default function EditRelicModal({ relic, onClose, onSave }) {
  const { user }     = useAuth()
  const { push }     = useToast()
  const { confirm, ConfirmModalUI } = useConfirm()

  const [title,       setTitle]       = useState(relic.title)
  const [category,    setCategory]    = useState(relic.category)
  const [description, setDesc]        = useState(relic.description)
  const [notes,       setNotes]       = useState(relic.notes ?? '')
  const [responsible, setResponsible] = useState(relic.responsible ?? '')
  const [coverImage,  setCoverImage]  = useState(relic.coverImage ?? null)
  const [titleError,  setTitleError]  = useState('')
  const [saving,      setSaving]      = useState(false)

  const {
    attachments, loading: attLoading, error: attError, setError: setAttError,
    addFiles, remove: removeAttRaw, download: downloadAtt, getPreviewURL,
  } = useAttachments(relic.id, user?.id)

  async function handleAddFiles(files) {
    setAttError(null)
    try { await addFiles(files) } catch (err) { setAttError(err.message) }
  }

  async function handleDeleteAtt(att) {
    const ok = await confirm({
      title: 'Delete attachment?',
      message: `"${att.originalName}" will be permanently removed.`,
      danger: true, confirmLabel: 'Delete',
    })
    if (!ok) return
    try { await removeAttRaw(att.id); push('Attachment deleted.', 'info') }
    catch { push('Could not delete the attachment.', 'error') }
  }

  async function handleSave() {
    if (!title.trim()) { setTitleError('Title is required'); return }
    setSaving(true)
    try {
      const now = new Date().toISOString()
      onSave(relic.id, {
        title:       title.trim(),
        category,
        description: description.trim() || 'No description.',
        notes:       notes.trim(),
        responsible: responsible.trim(),
        coverImage:  coverImage ?? null,
        filter:      CATEGORY_FILTER_MAP[category],
        thumbnail:   CATEGORY_THUMB_MAP[category],
        updatedAt:   now,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
      push('Relic updated.', 'success')
      onClose()
    } finally { setSaving(false) }
  }

  const INPUT = {
    width: '100%', padding: '8px 10px', borderRadius: 7,
    background: '#0F0F22', border: '1px solid #2A2A48',
    color: '#E8E8F0', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  }
  const FOCUS = e => { e.target.style.borderColor = '#5B4BFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,75,255,0.12)' }
  const BLUR  = e => { e.target.style.borderColor = '#2A2A48'; e.target.style.boxShadow = 'none' }
  const LABEL = { fontSize: 12, fontWeight: 600, color: '#C8C8E0', marginBottom: 5, display: 'block' }

  return (
    <>
      <ConfirmModalUI />
      <Modal title="Edit Relic" onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '72vh', overflowY: 'auto', paddingRight: 2 }}>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#7E7EA0', textTransform: 'uppercase' }}>
            General Information
          </div>

          {/* Title */}
          <div>
            <label style={LABEL}>Title <span style={{ color: '#E05555' }}>*</span></label>
            <input style={{ ...INPUT, borderColor: titleError ? '#E05555' : '#2A2A48' }}
              value={title} onChange={e => { setTitle(e.target.value); setTitleError('') }}
              autoFocus onFocus={FOCUS} onBlur={BLUR} />
            {titleError && <span style={{ fontSize: 11, color: '#E05555', marginTop: 4, display: 'block' }}>{titleError}</span>}
          </div>

          {/* Category */}
          <div>
            <label style={LABEL}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: category === c ? '#5B4BFF' : 'rgba(91,75,255,0.1)',
                  color: category === c ? 'white' : '#7B6FFF',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'inherit',
                  transition: 'background 0.12s',
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* ── Cover Image ── */}
          <div style={{ borderTop: '1px solid #1E1E3A', paddingTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#7E7EA0', textTransform: 'uppercase', marginBottom: 10 }}>
              Cover Image
            </div>
            <CoverImagePicker
              coverImage={coverImage}
              onChange={setCoverImage}
              fallbackThumb={CATEGORY_THUMB_MAP[category]}
            />
          </div>

          {/* Responsible */}
          <div style={{ borderTop: '1px solid #1E1E3A', paddingTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#7E7EA0', textTransform: 'uppercase', marginBottom: 10 }}>
              Details
            </div>
            <label style={LABEL}>Responsible</label>
            <input style={INPUT} value={responsible}
              onChange={e => setResponsible(e.target.value)}
              placeholder="Who discarded this?" onFocus={FOCUS} onBlur={BLUR} />
          </div>

          {/* Description */}
          <div>
            <label style={LABEL}>Description</label>
            <textarea style={{ ...INPUT, resize: 'vertical', minHeight: 70 }}
              value={description} onChange={e => setDesc(e.target.value)}
              rows={3} onFocus={FOCUS} onBlur={BLUR} />
          </div>

          {/* Notes */}
          <div>
            <label style={LABEL}>Additional Notes</label>
            <textarea style={{ ...INPUT, resize: 'vertical', minHeight: 50 }}
              value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} onFocus={FOCUS} onBlur={BLUR} />
          </div>

          {/* Attachments */}
          <div style={{ borderTop: '1px solid #1E1E3A', paddingTop: 14 }}>
            <AttachmentList
              attachments={attachments} loading={attLoading} error={attError}
              onAddFiles={handleAddFiles} onDelete={handleDeleteAtt}
              onDownload={downloadAtt} getPreviewURL={getPreviewURL}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #2A2A48',
            background: 'transparent', color: '#7E7EA0', fontSize: 13,
            fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, padding: '9px 0', borderRadius: 8, border: 'none',
            background: saving ? '#3A2ECC' : '#5B4BFF', color: 'white',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.12s',
          }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#4A3AEE' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#5B4BFF' }}
          >
            {saving && <Spinner />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </>
  )
}
