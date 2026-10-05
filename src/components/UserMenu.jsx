import { useEffect, useRef, useState } from 'react'
import { Settings, LogOut, User, Sliders } from 'lucide-react'
import { useAuth }      from '../auth/AuthProvider.jsx'
import { useToast }     from './Toast.jsx'
import { useNavigate }  from 'react-router-dom'

export default function UserMenu({ user, onOpenSettings }) {
  const [open, setOpen] = useState(false)
  const { signOut }     = useAuth()
  const { push }        = useToast()
  const navigate        = useNavigate()
  const ref             = useRef(null)

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    push('Signed out.', 'info')
    navigate('/login', { replace: true })
  }

  function handleSettings() {
    setOpen(false)
    onOpenSettings?.()
  }

  const ITEMS = [
    { icon: <User size={13}/>,    label: 'Profile',  action: ()=>setOpen(false), color:'#C8C8E0' },
    { icon: <Sliders size={13}/>, label: 'Settings', action: handleSettings,     color:'#C8C8E0' },
    { divider: true },
    { icon: <LogOut size={13}/>,  label: 'Sign out', action: handleSignOut,      color:'#E05555' },
  ]

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{background:'none',border:'none',cursor:'pointer',color:open?'#E8E8F0':'#7E7EA0',padding:2,display:'flex',alignItems:'center',transition:'color 0.15s'}}
        onMouseEnter={e=>e.currentTarget.style.color='#E8E8F0'}
        onMouseLeave={e=>{if(!open)e.currentTarget.style.color='#7E7EA0'}}
        aria-label="User menu">
        <Settings size={14}/>
      </button>

      {open && (
        <div style={{
          position:'absolute',bottom:'130%',left:'50%',transform:'translateX(-50%)',
          background:'#1A1A35',border:'1px solid #2A2A48',borderRadius:10,
          padding:'4px 0',minWidth:160,zIndex:100,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          animation:'um-fade 0.12s ease',
        }}>
          {ITEMS.map((item,i) =>
            item.divider
              ? <div key={i} style={{height:1,background:'#2A2A48',margin:'4px 0'}}/>
              : (
                <button key={i} onClick={item.action}
                  style={{display:'flex',alignItems:'center',gap:9,width:'100%',padding:'8px 14px',background:'none',border:'none',cursor:'pointer',color:item.color,fontSize:13,fontFamily:'inherit',transition:'background 0.1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                  onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  {item.icon}{item.label}
                </button>
              )
          )}
        </div>
      )}
      <style>{`@keyframes um-fade{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}
