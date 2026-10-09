import { Image, Clock, Trash2, RotateCcw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import UserMenu from './UserMenu.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { alpha } from '../styles/tokens.js'

const NAV = [
  { id: 'gallery',  Icon: Image },
  { id: 'search',   Icon: Search },
  { id: 'recent',   Icon: Clock },
  { id: 'revived',  Icon: RotateCcw },
  { id: 'deleted',  Icon: Trash2 },
]

export default function Sidebar({ user, activeSection, onSection, onOpenSettings }) {
  const { t } = useTranslation()
  const { color, radius, font } = useTheme()
  return (
    <aside style={{
      width:200,flexShrink:0,display:'flex',flexDirection:'column',
      height:'100%',background:color.bgBase,borderRight:`1px solid ${color.bgBorder}`,
    }}>
      {/* Logo */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'18px 16px 14px'}}>
        <div style={{width:30,height:30,background:color.blue500,borderRadius:radius.control,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
            <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
            <rect x="11" y="3" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="3" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="11" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <span style={{fontWeight:700,fontSize:13,color:color.textPrimary,letterSpacing:'-0.02em'}}>Archivo Muerto</span>
      </div>

      {/* Nav */}
      <nav style={{display:'flex',flexDirection:'column',gap:2,padding:'0 8px'}}>
        {NAV.map(({id,Icon})=>{
          const active = activeSection===id
          const disabled = id==='deleted'
          const label = t(`sidebar.nav.${id}`)
          const desc  = t(`sidebar.nav.${id}Desc`)
          return (
            <button key={id} onClick={()=>!disabled&&onSection(id)} disabled={disabled}
              title={disabled?t('sidebar.nav.comingSoon'):desc}
              style={{
                display:'flex',alignItems:'center',gap:10,padding:'7px 12px',borderRadius:radius.control,border:'none',
                cursor:disabled?'not-allowed':'pointer',
                background:active?alpha(color.blue500, 0.18):'transparent',
                color:active?color.blue300:disabled?color.textTertiary:color.textSecondary,
                fontSize:13,fontWeight:active?600:400,fontFamily:font.ui,textAlign:'left',width:'100%',
                opacity:disabled?0.5:1,transition:'background 0.12s,color 0.12s',
              }}
              onMouseEnter={e=>{if(!active&&!disabled){e.currentTarget.style.background=color.hoverOverlay;e.currentTarget.style.color=color.textPrimary}}}
              onMouseLeave={e=>{if(!active&&!disabled){e.currentTarget.style.background='transparent';e.currentTarget.style.color=color.textSecondary}}}>
              <Icon size={15} strokeWidth={active?2.5:1.8}/>
              {label}
            </button>
          )
        })}
      </nav>

      <div style={{flex:1}}/>

      {/* Active Project */}
      {user?.activeProject && (
        <div style={{margin:'0 10px 10px',padding:12,borderRadius:radius.card,background:color.bgElevated,border:`1px solid ${color.bgBorder}`}}>
          <div style={{fontSize:10,color:color.textTertiary,marginBottom:8,fontFamily:font.mono}}>{t('sidebar.activeProject')}</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,background:color.blue500,borderRadius:radius.control,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,fontWeight:700,color:color.onPrimary,letterSpacing:'0.02em'}}>
              {user.activeProjectInitials}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:color.textPrimary}}>{user.activeProject}</div>
              <div style={{display:'flex',alignItems:'center',gap:5,marginTop:2}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:color.sage500,flexShrink:0}}/>
                <span style={{fontSize:10,color:color.textSecondary,fontFamily:font.mono}}>{t('sidebar.projectVersion')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User footer */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderTop:`1px solid ${color.bgBorder}`}}>
        <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,background:`linear-gradient(135deg,${color.blue500},${color.blue800})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'white'}}>
          {user?.avatarInitials||'??'}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,color:color.textPrimary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.fullName||t('sidebar.userFallback')}</div>
          <div style={{fontSize:10,color:color.textSecondary}}>{user?.plan||t('sidebar.freePlan')}</div>
        </div>
        <UserMenu user={user} onOpenSettings={onOpenSettings}/>
      </div>
    </aside>
  )
}
