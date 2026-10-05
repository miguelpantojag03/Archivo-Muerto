// ─── AITagSuggester ───────────────────────────────────────────────
// Inline button that calls AI to suggest tags for a relic.
// Used inside NewRelicModal and EditRelicModal.

import { useState }  from 'lucide-react'
import { Sparkles }  from 'lucide-react'
import { useAI }     from '../hooks/useAI.js'

export default function AITagSuggester({ title, description, category, currentTags, onAdd }) {
  const { loading, error, suggestTags } = useAI()
  const [suggestions, setSuggestions]   = useState([])
  const [shown, setShown]               = useState(false)

  async function handleSuggest() {
    if (!title.trim()) return
    setShown(true)
    const result = await suggestTags(title, description, category)
    if (result?.tags) {
      // Filter out tags the relic already has
      const fresh = result.tags.filter(t => !currentTags.includes(t))
      setSuggestions(fresh)
    }
  }

  function addTag(t) {
    onAdd([t])
    setSuggestions(prev => prev.filter(x => x !== t))
  }

  return (
    <div style={{ marginTop: 6 }}>
      {/* Suggest button */}
      <button type="button" onClick={handleSuggest} disabled={loading || !title.trim()}
        style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'5px 10px', borderRadius:7, border:'1px solid rgba(91,75,255,0.35)',
          background:'rgba(91,75,255,0.06)', color:'#7B6FFF',
          fontSize:11, fontWeight:600, fontFamily:'inherit',
          cursor: loading||!title.trim() ? 'not-allowed' : 'pointer',
          opacity: !title.trim() ? 0.5 : 1,
          transition:'background 0.12s,border-color 0.12s',
        }}
        onMouseEnter={e=>{if(!loading&&title.trim()){e.currentTarget.style.background='rgba(91,75,255,0.14)';e.currentTarget.style.borderColor='#7B6FFF'}}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(91,75,255,0.06)';e.currentTarget.style.borderColor='rgba(91,75,255,0.35)'}}>
        <Sparkles size={12} style={{ animation: loading ? 'am-spin 0.8s linear infinite' : 'none' }}/>
        {loading ? 'Suggesting…' : '✦ Suggest tags with AI'}
      </button>

      {/* Suggested tags */}
      {shown && suggestions.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:7 }}>
          {suggestions.map(t => (
            <button key={t} type="button" onClick={() => addTag(t)}
              style={{
                fontSize:10, fontWeight:700, letterSpacing:'0.06em',
                color:'#7B6FFF', background:'rgba(91,75,255,0.1)',
                border:'1px dashed rgba(91,75,255,0.4)',
                borderRadius:99, padding:'3px 9px', cursor:'pointer',
                fontFamily:'inherit', transition:'background 0.12s',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(91,75,255,0.22)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(91,75,255,0.1)'}
              title="Click to add">
              + {t}
            </button>
          ))}
        </div>
      )}

      {shown && suggestions.length === 0 && !loading && !error && (
        <span style={{ fontSize:10, color:'#7E7EA0', marginTop:5, display:'block' }}>
          All suggested tags already added.
        </span>
      )}

      {error && (
        <span style={{ fontSize:10, color:'#E05555', marginTop:5, display:'block' }}>{error}</span>
      )}

      <style>{`@keyframes am-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
