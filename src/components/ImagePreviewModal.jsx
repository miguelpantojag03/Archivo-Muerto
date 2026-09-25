// ─── ImagePreviewModal ────────────────────────────────────────────
// In-app preview for images, plain text and PDFs.
// • Images  → <img> centered, zoom + rotate controls
// • PDFs    → <iframe> full panel
// • Text    → <pre> scrollable
// • Others  → should not reach here (AttachmentItem guards)

import { useEffect, useState } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { isImage, isPDF, isText } from '../constants/fileTypes.js'

export default function ImagePreviewModal({ attachment, url, onClose, onDownload }) {
  const { originalName, extension } = attachment
  const [textContent, setTextContent] = useState(null)
  const [zoom,        setZoom]        = useState(1)
  const [rotation,    setRotation]    = useState(0)

  // Load text content for txt/md/csv
  useEffect(() => {
    if (!isText(extension)) return
    fetch(url)
      .then(r => r.text())
      .then(setTextContent)
      .catch(() => setTextContent('Could not read file content.'))
  }, [url, extension])

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const img = isImage(extension)
  const pdf = isPDF(extension)
  const txt = isText(extension)

  const TB_BTN = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#C8C8E0', padding: 6, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.12s, color 0.12s',
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'am-fade 0.15s ease',
      }}
    >
      {/* ── Toolbar ── */}
      <div style={{
        width: '100%', maxWidth: 920,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 12,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: '60%' }}>
          {originalName}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Zoom controls — images only */}
          {img && (<>
            <button style={TB_BTN} title="Zoom out"
              onClick={() => setZoom(z => Math.max(0.25, +(z - 0.25).toFixed(2)))}>
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: 11, color: '#7E7EA0', minWidth: 38, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button style={TB_BTN} title="Zoom in"
              onClick={() => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))}>
              <ZoomIn size={16} />
            </button>
            <button style={TB_BTN} title="Rotate 90°"
              onClick={() => setRotation(r => (r + 90) % 360)}>
              <RotateCw size={16} />
            </button>
            <div style={{ width: 1, height: 20, background: '#2A2A48', margin: '0 4px' }} />
          </>)}

          {/* Download */}
          <button style={TB_BTN} title="Save as…"
            onClick={() => onDownload(attachment)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#E8E8F0' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#C8C8E0' }}>
            <Download size={16} />
          </button>

          {/* Close */}
          <button style={{ ...TB_BTN, marginLeft: 4 }} title="Close (Esc)"
            onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,85,85,0.15)'; e.currentTarget.style.color = '#E05555' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#C8C8E0' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{
        width: '100%', maxWidth: 920,
        flex: 1, maxHeight: 'calc(100vh - 140px)',
        borderRadius: 12, overflow: 'hidden',
        background: '#0F0F22', border: '1px solid #2A2A48',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>

        {/* IMAGE */}
        {img && (
          <div style={{
            overflow: 'auto', width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={url}
              alt={originalName}
              style={{
                maxWidth: '100%', maxHeight: '100%',
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease',
                borderRadius: 4,
              }}
            />
          </div>
        )}

        {/* PDF */}
        {pdf && (
          <iframe
            src={url}
            title={originalName}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}

        {/* TEXT */}
        {txt && (
          <pre style={{
            width: '100%', height: '100%', overflow: 'auto',
            padding: '16px 20px', margin: 0,
            fontSize: 13, lineHeight: 1.65,
            color: '#C8C8E0', background: 'transparent',
            fontFamily: "'Fira Code', 'Courier New', monospace",
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {textContent ?? 'Loading…'}
          </pre>
        )}
      </div>

      <style>{`
        @keyframes am-fade { from { opacity:0 } to { opacity:1 } }
      `}</style>
    </div>
  )
}
