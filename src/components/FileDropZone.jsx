// ─── FileDropZone ─────────────────────────────────────────────────
// Drag-and-drop + click-to-browse zone for file attachments.
// Accepts the same file types as constants/fileTypes.js.

import { useState, useRef } from 'react'
import { Upload, FolderOpen } from 'lucide-react'
import { ALLOWED_EXTENSIONS } from '../constants/fileTypes.js'

const ACCEPT = ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',')

export default function FileDropZone({ onFiles, disabled = false }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef                = useRef(null)

  function handleDragOver(e) {
    e.preventDefault()
    if (!disabled) setDragOver(true)
  }

  function handleDragLeave(e) {
    // Only fire if leaving the zone itself (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const files = e.dataTransfer.files
    if (files.length) onFiles(files)
  }

  function handleChange(e) {
    const files = e.target.files
    if (files.length) onFiles(files)
    // Reset input so the same file can be re-selected if deleted
    e.target.value = ''
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            8,
        padding:        '18px 12px',
        borderRadius:   10,
        border:         `1.5px dashed ${dragOver ? '#7B6FFF' : '#2A2A48'}`,
        background:     dragOver ? 'rgba(91,75,255,0.1)' : 'rgba(255,255,255,0.02)',
        cursor:         disabled ? 'not-allowed' : 'pointer',
        opacity:        disabled ? 0.5 : 1,
        transition:     'border-color 0.15s, background 0.15s',
        userSelect:     'none',
      }}
    >
      <div style={{
        width:           36,
        height:          36,
        borderRadius:    '50%',
        background:      dragOver ? 'rgba(91,75,255,0.2)' : 'rgba(91,75,255,0.1)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        transition:      'background 0.15s',
      }}>
        {dragOver
          ? <Upload size={16} style={{ color: '#7B6FFF' }} />
          : <FolderOpen size={16} style={{ color: '#7B6FFF' }} />
        }
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#C8C8E0' }}>
          {dragOver ? 'Drop files here' : 'Drag files here or click to browse'}
        </div>
        <div style={{ fontSize: 10, color: '#7E7EA0', marginTop: 3 }}>
          PDF, DOC, XLS, JPG, PNG, ZIP… · Max 50 MB each
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Upload attachment files"
      />
    </div>
  )
}
