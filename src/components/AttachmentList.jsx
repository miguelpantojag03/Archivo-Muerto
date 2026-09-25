// ─── AttachmentList ───────────────────────────────────────────────
// Renders the full attachment section for a relic:
//   - FileDropZone for adding files
//   - List of AttachmentItem rows
//   - Error message
//   - Empty state
//
// Consumers pass down the useAttachments() hook values as props
// so this component stays purely presentational.

import { useState } from 'react'
import { Paperclip, Loader } from 'lucide-react'
import FileDropZone    from './FileDropZone.jsx'
import AttachmentItem  from './AttachmentItem.jsx'
import ImagePreviewModal from './ImagePreviewModal.jsx'

export default function AttachmentList({
  attachments,
  loading,
  error,
  onAddFiles,
  onDelete,
  onDownload,
  getPreviewURL,
  readOnly = false,
}) {
  const [previewAtt, setPreviewAtt] = useState(null)
  const [previewURL, setPreviewURL] = useState(null)

  function handlePreview(att) {
    const url = getPreviewURL(att)
    if (!url) return
    setPreviewAtt(att)
    setPreviewURL(url)
  }

  function handleClosePreview() {
    if (previewURL) URL.revokeObjectURL(previewURL)
    setPreviewAtt(null)
    setPreviewURL(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Paperclip size={13} style={{ color: '#7B6FFF' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#C8C8E0', letterSpacing: '0.03em' }}>
          Attachments
        </span>
        {attachments.length > 0 && (
          <span style={{
            fontSize:       10,
            fontWeight:     700,
            color:          '#7B6FFF',
            background:     'rgba(91,75,255,0.15)',
            borderRadius:   99,
            padding:        '1px 7px',
          }}>
            {attachments.length}
          </span>
        )}
        {loading && <Loader size={12} style={{ color: '#7E7EA0', animation: 'am-spin 0.8s linear infinite' }} />}
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          style={{
            padding:      '8px 12px',
            borderRadius: 7,
            background:   'rgba(224,85,85,0.1)',
            border:       '1px solid rgba(224,85,85,0.3)',
            fontSize:     11,
            color:        '#E05555',
            whiteSpace:   'pre-line',
          }}
        >
          {error}
        </div>
      )}

      {/* Attachment rows */}
      {attachments.length > 0 && (
        <div style={{
          borderRadius: 9,
          border:       '1px solid #1E1E3A',
          overflow:     'hidden',
          background:   '#111126',
        }}>
          {attachments.map((att, i) => (
            <div key={att.id} style={{
              borderBottom: i < attachments.length - 1 ? '1px solid #1E1E3A' : 'none',
            }}>
              <AttachmentItem
                attachment={att}
                onPreview={handlePreview}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state (only shown when there are 0 attachments and not loading) */}
      {attachments.length === 0 && !loading && (
        <div style={{
          textAlign:  'center',
          fontSize:   11,
          color:      '#3A3A5C',
          padding:    '8px 0 4px',
        }}>
          No files attached yet.
        </div>
      )}

      {/* Drop zone */}
      {!readOnly && (
        <FileDropZone onFiles={onAddFiles} disabled={loading} />
      )}

      {/* Image / text / PDF preview modal */}
      {previewAtt && previewURL && (
        <ImagePreviewModal
          attachment={previewAtt}
          url={previewURL}
          onClose={handleClosePreview}
          onDownload={onDownload}
        />
      )}

      <style>{`@keyframes am-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
