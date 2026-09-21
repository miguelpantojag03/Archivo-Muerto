import { Search, Plus } from 'lucide-react'

const FILTERS = ['All', 'Visuals', 'Drafts']

export default function TopBar({ search, setSearch, filter, setFilter, onNewRelic }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 20px', borderBottom: '1px solid #1E1E3A',
      background: '#14142B', flexShrink: 0,
    }}>
      {/* Search */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Search size={13} style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          color: '#7E7EA0', pointerEvents: 'none',
        }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search your museum of ideas..."
          style={{
            width: '100%', padding: '8px 12px 8px 32px',
            borderRadius: 8, background: '#0F0F22',
            border: '1px solid #2A2A48', color: '#E8E8F0',
            fontSize: 13, fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#5B4BFF'; e.target.style.boxShadow = '0 0 0 3px rgba(91,75,255,0.12)' }}
          onBlur={e => { e.target.style.borderColor = '#2A2A48'; e.target.style.boxShadow = 'none' }}
        />
      </div>

      {/* Segmented control */}
      <div style={{
        display: 'flex', borderRadius: 8, padding: 3,
        background: '#0F0F22', border: '1px solid #2A2A48', flexShrink: 0,
      }}>
        {FILTERS.map(f => {
          const active = filter === f.toLowerCase()
          return (
            <button
              key={f}
              onClick={() => setFilter(f.toLowerCase())}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: active ? '#5B4BFF' : 'transparent',
                color: active ? '#fff' : '#7E7EA0',
                fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* New Relic */}
      <button
        onClick={onNewRelic}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: '#5B4BFF', color: 'white',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit', flexShrink: 0,
          transition: 'background 0.12s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#4A3AEE'}
        onMouseLeave={e => e.currentTarget.style.background = '#5B4BFF'}
      >
        <Plus size={14} strokeWidth={2.5} />
        New Relic
      </button>
    </div>
  )
}
