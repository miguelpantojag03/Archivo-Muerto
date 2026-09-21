import { useState } from 'react'
import Modal from './Modal.jsx'
import { Field, Input, PrimaryButton } from './FormField.jsx'

const CATEGORIES = ['SKETCH', 'COPYWRITING', 'PALETTE', 'BRANDING', 'NOTES']
const THUMB_MAP  = { SKETCH: 'sketch', COPYWRITING: 'copy', PALETTE: 'palette', BRANDING: 'branding', NOTES: 'notes' }
const FILTER_MAP = { SKETCH: 'visuals', COPYWRITING: 'drafts', PALETTE: 'visuals', BRANDING: 'visuals', NOTES: 'drafts' }

export default function NewRelicModal({ onClose, onAdd }) {
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('SKETCH')
  const [description, setDesc]  = useState('')
  const [error, setError]       = useState('')

  function handleAdd() {
    if (!title.trim()) { setError('Title is required'); return }
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    onAdd({
      id: `relic_${Date.now()}`,
      category,
      title: title.trim(),
      description: description.trim() || 'No description.',
      date: dateStr,
      project: 'Nebula System',
      created: dateStr,
      discarded: dateStr,
      filter: FILTER_MAP[category],
      revived: false,
      thumbnail: THUMB_MAP[category],
    })
    onClose()
  }

  return (
    <Modal title="Add New Relic" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <Field label="Title" error={error}>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setError('') }}
            placeholder="What was this idea?"
            autoFocus
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              background: '#0F0F22', border: `1px solid ${error ? '#E05555' : '#2A2A48'}`,
              color: '#E8E8F0', fontSize: 13, fontFamily: 'inherit', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#5B4BFF'}
            onBlur={e => e.target.style.borderColor = error ? '#E05555' : '#2A2A48'}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </Field>

        <Field label="Category">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: category === c ? '#5B4BFF' : 'rgba(91,75,255,0.1)',
                  color: category === c ? 'white' : '#7B6FFF',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'inherit',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Why was it discarded?"
            rows={3}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              background: '#0F0F22', border: '1px solid #2A2A48',
              color: '#E8E8F0', fontSize: 13, fontFamily: 'inherit',
              outline: 'none', resize: 'vertical',
            }}
            onFocus={e => e.target.style.borderColor = '#5B4BFF'}
            onBlur={e => e.target.style.borderColor = '#2A2A48'}
          />
        </Field>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8,
              background: 'transparent', border: '1px solid #2A2A48',
              color: '#7E7EA0', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            style={{
              flex: 2, padding: '9px 0', borderRadius: 8, border: 'none',
              background: '#5B4BFF', color: 'white', fontSize: 13,
              fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#4A3AEE'}
            onMouseLeave={e => e.currentTarget.style.background = '#5B4BFF'}
          >
            Add Relic
          </button>
        </div>
      </div>
    </Modal>
  )
}
