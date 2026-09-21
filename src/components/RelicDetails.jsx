import { RotateCcw, Trash2 } from 'lucide-react'
import { ParchmentImage } from './Thumbnails.jsx'

export default function RelicDetails({ relic, onRevive, onDelete }) {
  return (
    <aside style={{
      width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', background: '#0F0F22', borderLeft: '1px solid #1E1E3A',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#E8E8F0' }}>Relic Details</div>
      </div>

      {!relic ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center', color: '#3A3A5C', fontSize: 13,
        }}>
          Select a relic to view details
        </div>
      ) : (
        <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ParchmentImage />

          {/* Title */}
          <div style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 700, color: '#E8E8F0', lineHeight: 1.35 }}>
            "{relic.title}"
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: '#5B4BFF', boxShadow: '0 0 6px #5B4BFF',
            }} />
            <span style={{ fontSize: 11, color: '#A0A0CC' }}>
              {relic.revived ? 'Revived State' : 'Archived State'}
            </span>
          </div>

          {/* Metadata */}
          <div style={{ border: '1px solid #1E1E3A', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { label: 'Project',   value: relic.project },
              { label: 'Created',   value: relic.created },
              { label: 'Discarded', value: relic.discarded },
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', background: '#111126',
                borderBottom: i < arr.length - 1 ? '1px solid #1E1E3A' : 'none',
              }}>
                <span style={{ fontSize: 11, color: '#7E7EA0' }}>{label}</span>
                <span style={{ fontSize: 11, color: '#C8C8E0', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={() => onRevive(relic.id)}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
              background: '#5B4BFF', color: 'white', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#4A3AEE'}
            onMouseLeave={e => e.currentTarget.style.background = '#5B4BFF'}
          >
            <RotateCcw size={13} /> Revive Now
          </button>

          <button
            onClick={() => onDelete(relic.id)}
            style={{
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
