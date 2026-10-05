import { Search, Plus, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const FILTERS  = ['All', 'Visuals', 'Drafts']
const SORT_OPT = [
  { field:'date',     label:'Date discarded' },
  { field:'title',    label:'Title' },
  { field:'category', label:'Category' },
  { field:'status',   label:'Status' },
]

export default function TopBar({ search, setSearch, filter, setFilter, onNewRelic, sortField, sortDir, cycleSort }) {
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef                 = useRef(null)

  useEffect(() => {
    function h(e) { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const currentLabel = SORT_OPT.find(o => o.field === sortField)?.label ?? 'Date discarded'

  return (
    <div style={{
      display:'flex',alignItems:'center',gap:10,
      padding:'10px 20px',borderBottom:'1px solid #1E1E3A',
      background:'#14142B',flexShrink:0,flexWrap:'wrap',
    }}>
      {/* Search */}
      <div style={{flex:1,minWidth:180,position:'relative'}}>
        <Search size={13} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#7E7EA0',pointerEvents:'none'}}/>
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search your museum of ideas…"
          style={{width:'100%',padding:'8px 12px 8px 32px',borderRadius:8,background:'#0F0F22',border:'1px solid #2A2A48',color:'#E8E8F0',fontSize:13,fontFamily:'inherit',outline:'none'}}
          onFocus={e=>{e.target.style.borderColor='#5B4BFF';e.target.style.boxShadow='0 0 0 3px rgba(91,75,255,0.12)'}}
          onBlur={e=>{e.target.style.borderColor='#2A2A48';e.target.style.boxShadow='none'}}/>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',borderRadius:8,padding:3,background:'#0F0F22',border:'1px solid #2A2A48',flexShrink:0}}>
        {FILTERS.map(f=>{
          const active = filter===f.toLowerCase()
          return (
            <button key={f} onClick={()=>setFilter(f.toLowerCase())}
              style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',background:active?'#5B4BFF':'transparent',color:active?'#fff':'#7E7EA0',fontSize:12,fontWeight:500,fontFamily:'inherit',transition:'background 0.12s,color 0.12s'}}>
              {f}
            </button>
          )
        })}
      </div>

      {/* Sort dropdown */}
      <div ref={sortRef} style={{position:'relative',flexShrink:0}}>
        <button onClick={()=>setSortOpen(o=>!o)}
          style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:8,border:'1px solid #2A2A48',background:'#0F0F22',color:'#C8C8E0',fontSize:12,fontWeight:500,fontFamily:'inherit',cursor:'pointer',transition:'border-color 0.12s'}}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#5B4BFF'}
          onMouseLeave={e=>{if(!sortOpen)e.currentTarget.style.borderColor='#2A2A48'}}>
          {sortDir==='asc' ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
          {currentLabel}
          <ChevronDown size={11} style={{transform:sortOpen?'rotate(180deg)':'rotate(0)',transition:'transform 0.15s'}}/>
        </button>

        {sortOpen && (
          <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,background:'#1A1A35',border:'1px solid #2A2A48',borderRadius:10,padding:'4px 0',minWidth:168,zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,0.4)',animation:'tb-fade 0.12s ease'}}>
            {SORT_OPT.map(o=>(
              <button key={o.field}
                onClick={()=>{cycleSort(o.field);setSortOpen(false)}}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'8px 14px',background:'none',border:'none',cursor:'pointer',color:sortField===o.field?'#7B6FFF':'#C8C8E0',fontSize:12,fontFamily:'inherit',transition:'background 0.1s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                {o.label}
                {sortField===o.field && (sortDir==='asc' ? <ArrowUp size={11}/> : <ArrowDown size={11}/>)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Relic */}
      <button onClick={onNewRelic}
        style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',background:'#5B4BFF',color:'white',fontSize:13,fontWeight:600,fontFamily:'inherit',flexShrink:0,transition:'background 0.12s'}}
        onMouseEnter={e=>e.currentTarget.style.background='#4A3AEE'}
        onMouseLeave={e=>e.currentTarget.style.background='#5B4BFF'}>
        <Plus size={14} strokeWidth={2.5}/> New Relic
      </button>

      <style>{`@keyframes tb-fade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
