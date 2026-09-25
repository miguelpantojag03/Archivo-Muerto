import { RotateCcw, Trash2, Pencil, Paperclip } from 'lucide-react'
import { ParchmentImage } from './Thumbnails.jsx'
import { useAttachments } from '../hooks/useAttachments.js'
import { useAuth }        from '../auth/AuthProvider.jsx'

function fmtDate(val) {
  if (!val) return '—'
  // If it looks like ISO, format it; otherwise return as-is (legacy)
  if (val.includes('T')) {
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  return val
}

export default function RelicDetails({ relic, onRevive, onDelete, onEdit }) {
  const { user } = useAuth()
  // Load attachment count for the badge (lightweight — no blobs transferred for the count)
  const { attachments } = useAttachments(relic?.id ?? null, user?.id)

  return (
    <aside style={{
      width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', background: '#0F0F22', borderLeft: '1px solid #1E1E3A',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: relic ? '1px solid #1E1E3A' : 'none',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#E8E8F0' }}>Relic Details</div>
        {relic && (
          <button
            onClick={() => onEdit(relic)}
            title="Edit relic"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 6, border: '1px solid #2A2A48',
              background: 'transparent', color: '#7E7EA0',
              fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B4BFF'; e.currentTarget.style.color = '#7B6FFF' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A48'; e.currentTarget.style.color = '#7E7EA0' }}
          >
            <Pencil size={11} /> Edit
          </button>
        )}
      </div>

      {!relic ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center', color: '#3A3A5C', fontSize: 13,
        }}>
          Select a relic to view details
        </div>
      ) : (
        <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ParchmentImage />

          {/* Title */}
          <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 700, color: '#E8E8F0', lineHeight: 1.35 }}>
            "{relic.title}"
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: relic.revived ? '#4ADE80' : '#5B4BFF',
              boxShadow: relic.revived ? '0 0 6px #4ADE80' : '0 0 6px #5B4BFF',
            }} />
            <span style={{ fontSize: 11, color: '#A0A0CC' }}>
              {relic.revived ? 'Revived State' : 'Archived State'}
            </span>
          </div>

          {/* Attachments badge */}
          {attachments.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 7,
              background: 'rgba(91,75,255,0.1)', border: '1px solid rgba(91,75,255,0.2)',
            }}>
              <Paperclip size={12} style={{ color: '#7B6FFF' }} />
              <span style={{ fontSize: 11, color: '#7B6FFF', fontWeight: 600 }}>
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </span>
            </div>
          )}

          {/* Metadata */}
          <div style={{ border: '1px solid #1E1E3A', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { label: 'Project',    value: relic.project },
              { label: 'Category',   value: relic.category },
              { label: 'Created',    value: fmtDate(relic.createdAt ?? relic.created) },
              { label: 'Discarded',  value: fmtDate(relic.discardedAt ?? relic.discarded) },
              ...(relic.responsible ? [{ label: 'Responsible', value: relic.responsible }] : []),
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#111126',
                borderBottom: i < arr.length - 1 ? '1px solid #1E1E3A' : 'none',
              }}>
                <span style={{ fontSize: 11, color: '#7E7EA0', flexShrink: 0 }}>{label}</span>
                <span style={{
                  fontSize: 11, color: '#C8C8E0', fontWeight: 500,
                  textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', maxWidth: '60%',
                }}>{value ?? '—'}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          {relic.notes && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: '#111126', border: '1px solid #1E1E3A',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7E7EA0', marginBottom: 4, letterSpacing: '0.06em' }}>
                NOTES
              </div>
              <div style={{ fontSize: 11, color: '#C8C8E0', lineHeight: 1.6 }}>{relic.notes}</div>
            </div>
          )}

          {/* Actions */}
          <button onClick={() => onRevive(relic.id)} style={{
            width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
            background: '#5B4BFF', color: 'white', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#4A3AEE'}
            onMouseLeave={e => e.currentTarget.style.background = '#5B4BFF'}
          >
            <RotateCcw size={13} /> Revive Now
          </button>

          <button onClick={() => onDelete(relic.id)} style={{
            width: '100%', padding: '10px 0', borderRadius: 8,
            background: 'transparent', color: '#7E7EA0', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer', border: '1px solid #2A2A48',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'border-color 0.12s, color 0.12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E05555'; e.currentTarget.style.color = '#E05555' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A48'; e.currentTarget.style.color = '#7E7EA0' }}
          >
            <Trash2 size={13} /> Delete Forever
          </button>
        </div>
      )}
    </aside>
  )
}
