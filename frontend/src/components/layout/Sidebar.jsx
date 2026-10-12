import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Megaphone, Music2,
  FileText, BarChart3, Settings, Zap, LogOut,
  PlaySquare, BookOpen
} from 'lucide-react'
import { useArtistStore } from '../../store/ArtistStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/superfans', icon: Users, label: 'Superfans' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/gigs', icon: Music2, label: 'Gig Engine' },
  { to: '/media', icon: PlaySquare, label: 'Media Studio' },
  { to: '/portfolio', icon: BookOpen, label: 'Portfolio' },
  { to: '/resume', icon: FileText, label: 'AI Resume' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar() {
  const { artist, logout } = useArtistStore()

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen"
      style={{ background: '#12121A', borderRight: '1px solid #2A2A3A' }}>
      <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid #2A2A3A' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FF6B00, #7B2FBE)' }}>
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>FanFlow</span>
          <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#FF6B00' }}> AI</span>
          <div className="text-xs" style={{ color: '#6B6B8A' }}>Revenue Engine</div>
        </div>
      </div>

      <div className="p-4 mx-3 mt-4 rounded-xl" style={{ background: '#1A1A26' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #7B2FBE)', color: '#fff' }}>
            {artist?.name?.[0] || 'J'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#F0F0FF' }}>
              {artist?.name || 'JP The Producer'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="pulse-dot w-1.5 h-1.5" />
              <span className="text-xs" style={{ color: '#FF6B00' }}>Active</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'nav-active' : ''}`
            }
            style={({ isActive }) => ({ color: isActive ? '#FF6B00' : '#6B6B8A', fontFamily: 'DM Sans, sans-serif' })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ color: isActive ? '#FF6B00' : '#6B6B8A' }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-1" style={{ borderTop: '1px solid #2A2A3A' }}>
        <NavLink to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: '#6B6B8A' }}>
          <Settings size={17} /> Settings
        </NavLink>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: '#6B6B8A' }}
          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B6B8A'}>
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
