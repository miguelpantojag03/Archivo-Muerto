import { Image, FolderOpen, Clock, Trash2, RotateCcw } from 'lucide-react'
import UserMenu from './UserMenu.jsx'

const NAV = [
  { id: 'gallery',  label: 'The Gallery',        Icon: Image,      desc: 'All relics' },
  { id: 'recent',   label: 'Recent Relics',       Icon: Clock,      desc: 'Last 10 added' },
  { id: 'revived',  label: 'Revived',             Icon: RotateCcw,  desc: 'Back in action' },
  { id: 'deleted',  label: 'Permanently Deleted', Icon: Trash2,     desc: 'Coming soon' },
]

export default function Sidebar({ user, activeSection, onSection, onOpenSettings }) {
  return (
    <aside style={{
      width:200,flexShrink:0,display:'flex',flexDirection:'column',
      height:'100%',background:'#0F0F22',borderRight:'1px solid #1E1E3A',
    }}>
      {/* Logo */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'18px 16px 14px'}}>
        <div style={{width:30,height:30,background:'#5B4BFF',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
            <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
            <rect x="11" y="3" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="3" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="11" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <span style={{fontWeight:700,fontSize:13,color:'#E8E8F0',letterSpacing:'-0.02em'}}>Archivo Muerto</span>
      </div>

      {/* Nav */}
      <nav style={{display:'flex',flexDirection:'column',gap:2,padding:'0 8px'}}>
        {NAV.map(({id,label,Icon,desc})=>{
          const active = activeSection===id
          const disabled = id==='deleted'
          return (
            <button key={id} onClick={()=>!disabled&&onSection(id)} disabled={disabled}
              title={disabled?'Coming soon':desc}
              style={{
                display:'flex',alignItems:'center',gap:10,padding:'7px 12px',borderRadius:8,border:'none',
                cursor:disabled?'not-allowed':'pointer',
                background:active?'rgba(91,75,255,0.18)':'transparent',
                color:active?'#7B6FFF':disabled?'#3A3A5C':'#7E7EA0',
                fontSize:13,fontWeight:active?600:400,fontFamily:'inherit',textAlign:'left',width:'100%',
                opacity:disabled?0.5:1,transition:'background 0.12s,color 0.12s',
              }}
              onMouseEnter={e=>{if(!active&&!disabled){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#C8C8E0'}}}
              onMouseLeave={e=>{if(!active&&!disabled){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#7E7EA0'}}}>
              <Icon size={15} strokeWidth={active?2.5:1.8}/>
              {label}
            </button>
          )
        })}
      </nav>

      <div style={{flex:1}}/>

      {/* Active Project */}
      {user?.activeProject && (
        <div style={{margin:'0 10px 10px',padding:12,borderRadius:12,background:'#141428',border:'1px solid #1E1E3A'}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.12em',color:'#7E7EA0',marginBottom:8}}>ACTIVE PROJECT</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,background:'#5B4BFF',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,fontWeight:700,color:'white',letterSpacing:'0.02em'}}>
              {user.activeProjectInitials}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#E8E8F0'}}>{user.activeProject}</div>
              <div style={{fontSize:10,color:'#7E7EA0',marginTop:1}}>v2.4 · active</div>
            </div>
          </div>
        </div>
      )}

      {/* User footer */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderTop:'1px solid #1E1E3A'}}>
        <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,#5B4BFF,#9B6BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'white'}}>
          {user?.avatarInitials||'??'}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,color:'#E8E8F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.fullName||'User'}</div>
          <div style={{fontSize:10,color:'#7E7EA0'}}>{user?.plan||'Free Plan'}</div>
        </div>
        <UserMenu user={user} onOpenSettings={onOpenSettings}/>
      </div>
    </aside>
  )
}
