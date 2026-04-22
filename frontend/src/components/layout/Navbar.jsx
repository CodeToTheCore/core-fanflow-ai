import { useState } from 'react'
import { Bell, Search, Sparkles } from 'lucide-react'
import { useArtistStore } from '../../store/ArtistStore'
import { useLocation } from 'react-router-dom'
 
const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your revenue command center' },
  '/superfans': { title: 'Superfans', sub: 'Identify your highest-value audience' },
  '/campaigns': { title: 'Campaigns', sub: 'AI-generated monetization campaigns' },
  '/gigs': { title: 'Gig Engine', sub: 'Auto-find & apply to opportunities' },
  '/resume': { title: 'AI Resume', sub: 'Your AI-built artist profile' },
  '/analytics': { title: 'Analytics', sub: 'Deep audience insights' },
  '/settings': { title: 'Settings', sub: 'Account & integrations' },
}
 
export default function Navbar() {
  const { notifications, markAllRead } = useArtistStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const location = useLocation()
  const page = pageTitles[location.pathname] || { title: 'FanFlow AI', sub: '' }
  const unread = notifications.filter((n) => !n.read).length
 
  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{ borderBottom: '1px solid #2A2A3A', background: '#0A0A0F' }}
    >
      {/* Page title */}
      <div>
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
        >
          {page.title}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#6B6B8A' }}>
          {page.sub}
        </p>
      </div>
 
      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{
            background: '#1A1A26',
            border: '1px solid #2A2A3A',
            color: '#6B6B8A',
            cursor: 'pointer',
            minWidth: 200,
          }}
        >
          <Search size={14} />
          <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Search...</span>
          <span
            className="ml-auto text-xs px-1.5 py-0.5 rounded"
            style={{ background: '#2A2A3A', color: '#6B6B8A' }}
          >
            ⌘K
          </span>
        </div>
 
        {/* AI status pill */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(255,107,0,0.1)',
            border: '1px solid rgba(255,107,0,0.2)',
            color: '#FF6B00',
            fontFamily: 'Syne, sans-serif',
          }}
        >
          <Sparkles size={12} />
          AI Active
        </div>
 
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); markAllRead() }}
            className="relative p-2 rounded-lg transition-all"
            style={{
              background: '#1A1A26',
              border: '1px solid #2A2A3A',
              color: '#6B6B8A',
            }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                style={{ background: '#FF6B00', color: '#fff', fontSize: '10px' }}
              >
                {unread}
              </span>
            )}
          </button>
 
          {showNotifs && (
            <div
              className="absolute right-0 top-12 w-72 rounded-xl z-50 py-2 animate-fade-in"
              style={{
                background: '#1A1A26',
                border: '1px solid #2A2A3A',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="px-4 py-2 text-xs font-semibold"
                style={{
                  color: '#6B6B8A',
                  borderBottom: '1px solid #2A2A3A',
                  fontFamily: 'Syne, sans-serif',
                  letterSpacing: '0.05em',
                }}
              >
                NOTIFICATIONS
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: '#6B6B8A' }}>
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="text-sm" style={{ color: '#F0F0FF' }}>
                      {n.msg || n.message}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#6B6B8A' }}>
                      {new Date(n.time || n.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
 