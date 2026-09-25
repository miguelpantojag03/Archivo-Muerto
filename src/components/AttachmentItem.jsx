// ─── AttachmentItem ───────────────────────────────────────────────
// Single row in the attachment list.
// Shows icon · name · size · date · actions (preview / download / delete).

import { useState } from 'react'
import {
  FileText, Image, FileSpreadsheet, FileType2,
  Archive, Download, Trash2, Eye, ExternalLink,
} from 'lucide-react'
import { formatFileSize, isImage, isPDF, isText } from '../constants/fileTypes.js'

// ── File type icon ─────────────────────────────────────────────────
function FileIcon({ ext, size = 18 }) {
  const e = ext?.toLowerCase()
  if (['jpg','jpeg','png','webp','gif','svg'].includes(e))
    return <Image size={size} style={{ color: '#7B6FFF' }} />
  if (e === 'pdf')
    return <FileType2 size={size} style={{ color: '#E05555' }} />
  if (['xls','xlsx','csv'].includes(e))
    return <FileSpreadsheet size={size} style={{ color: '#4ADE80' }} />
  if (['doc','docx','txt','md'].includes(e))
    return <FileText size={size} style={{ color: '#60BFFF' }} />
  if (e === 'zip')
    return <Archive size={size} style={{ color: '#FEBC2E' }} />
  return <FileText size={size} style={{ color: '#7E7EA0' }} />
}

// ── Format date for display ───────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function AttachmentItem({
  attachment,
  onPreview,
  onDownload,
  onDelete,
}) {
  const [hovered, setHovered] = useState(false)
  const { originalName, extension, size, createdAt } = attachment

  const canPreview = isImage(extension) || isPDF(extension) || isText(extension)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            10,
        padding:        '8px 10px',
        borderRadius:   8,
        background:     hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition:     'background 0.12s',
        cursor:         'default',
      }}
    >
      {/* Icon */}
      <div style={{
        width:          32,
        height:         32,
        borderRadius:   7,
        background:     '#1A1A35',
        border:         '1px solid #2A2A48',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <FileIcon ext={extension} size={15} />
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:     12,
          fontWeight:   600,
          color:        '#E8E8F0',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {originalName}
        </div>
        <div style={{ fontSize: 10, color: '#7E7EA0', marginTop: 2 }}>
          {formatFileSize(size)} · {fmtDate(createdAt)}
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div style={{
        display:    'flex',
        gap:        4,
        opacity:    hovered ? 1 : 0,
        transition: 'opacity 0.15s',
      }}>
        {/* Preview */}
        {canPreview && (
          <ActionBtn
            icon={<Eye size={13} />}
            title="Preview"
            onClick={() => onPreview(attachment)}
            color="#7B6FFF"
          />
        )}
        {/* Open externally (non-previewable) */}
        {!canPreview && (
          <ActionBtn
            icon={<ExternalLink size={13} />}
            title="Open with system app"
            onClick={() => onDownload(attachment)}
            color="#7E7EA0"
          />
        )}
        {/* Download */}
        <ActionBtn
          icon={<Download size={13} />}
          title="Save as…"
          onClick={() => onDownload(attachment)}
          color="#7E7EA0"
        />
        {/* Delete */}
        <ActionBtn
          icon={<Trash2 size={13} />}
          title="Delete attachment"
          onClick={() => onDelete(attachment)}
          color="#E05555"
          danger
        />
      </div>
    </div>
  )
}

function ActionBtn({ icon, title, onClick, color, danger = false }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onClick={e => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:          26,
        height:         26,
        borderRadius:   6,
        border:         'none',
        cursor:         'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     hov
          ? (danger ? 'rgba(224,85,85,0.15)' : 'rgba(255,255,255,0.08)')
          : 'transparent',
        color:          hov ? color : '#7E7EA0',
        transition:     'background 0.12s, color 0.12s',
      }}
    >
      {icon}
    </button>
  )
}
