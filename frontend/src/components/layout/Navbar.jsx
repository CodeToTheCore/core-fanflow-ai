import { useState, useEffect, useRef } from 'react'
import { Bell, Search, Sparkles, X, Music2, Users, Megaphone, PlaySquare } from 'lucide-react'
import { useArtistStore } from '../../store/ArtistStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { searchService } from '../../services/mediaService'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your revenue command center' },
  '/superfans': { title: 'Superfans', sub: 'Identify your highest-value audience' },
  '/campaigns': { title: 'Campaigns', sub: 'AI-generated monetization campaigns' },
  '/gigs': { title: 'Gig Engine', sub: 'Auto-find & apply to opportunities' },
  '/media': { title: 'Media Studio', sub: 'Upload music, videos, and images' },
  '/portfolio': { title: 'Portfolio', sub: 'Your artist bio and press kit' },
  '/resume': { title: 'AI Resume', sub: 'Your AI-built artist profile' },
  '/analytics': { title: 'Analytics', sub: 'Deep audience insights' },
  '/settings': { title: 'Settings', sub: 'Account & integrations' },
}

const typeIcon = { fans: Users, gigs: Music2, campaigns: Megaphone, media: PlaySquare }
const typeRoute = { fans: '/superfans', gigs: '/gigs', campaigns: '/campaigns', media: '/media' }

export default function Navbar() {
  const { notifications, markAllRead } = useArtistStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef()
  const searchDebounce = useRef()
  const page = pageTitles[location.pathname] || { title: 'FanFlow AI', sub: '' }
  const unread = notifications?.filter(n => !n.read)?.length || 0

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null)
      return
    }
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchService.search(searchQuery)
        setSearchResults(results)
      } catch {
        setSearchResults(null)
      } finally {
        setSearching(false)
      }
    }, 350)
  }, [searchQuery])

  function handleResultClick(type, item) {
    navigate(typeRoute[type] || '/dashboard')
    setSearchQuery('')
    setSearchResults(null)
    setShowSearch(false)
  }

  const totalResults = searchResults
    ? Object.values(searchResults).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
    : 0

  return (
    <header className="flex items-center justify-between px-6 py-4 flex-shrink-0 relative"
      style={{ borderBottom: '1px solid #2A2A3A', background: '#0A0A0F' }}>
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>{page.title}</h1>
        <p className="text-xs mt-0.5" style={{ color: '#6B6B8A' }}>{page.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: '#1A1A26', border: '1px solid #2A2A3A', minWidth: 220 }}
            onClick={() => { setShowSearch(true); searchRef.current?.focus() }}>
            <Search size={14} style={{ color: '#6B6B8A', flexShrink: 0 }} />
            <input
              ref={searchRef}
              placeholder="Search fans, gigs, media..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true) }}
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: '#F0F0FF', fontFamily: 'DM Sans, sans-serif' }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults(null) }}>
                <X size={12} style={{ color: '#6B6B8A' }} />
              </button>
            )}
            {!searchQuery && (
              <span className="text-xs px-1.5 py-0.5 rounded ml-auto" style={{ background: '#2A2A3A', color: '#6B6B8A' }}>⌘K</span>
            )}
          </div>

          {/* Search results dropdown */}
          {showSearch && searchQuery.length >= 2 && (
            <div className="absolute top-12 left-0 right-0 rounded-xl z-50 overflow-hidden animate-fade-in"
              style={{ background: '#1A1A26', border: '1px solid #2A2A3A', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', minWidth: 320 }}>
              {searching ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: '#6B6B8A' }}>Searching...</div>
              ) : searchResults && totalResults === 0 ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: '#6B6B8A' }}>No results for "{searchQuery}"</div>
              ) : searchResults ? (
                <div>
                  {Object.entries(searchResults).map(([type, items]) => {
                    if (!Array.isArray(items) || !items.length) return null
                    const Icon = typeIcon[type] || Search
                    return (
                      <div key={type}>
                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: '#6B6B8A', borderBottom: '1px solid #2A2A3A', fontFamily: 'Syne, sans-serif' }}>
                          {type}
                        </div>
                        {items.map((item, i) => (
                          <button key={i} onClick={() => handleResultClick(type, item)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{ borderBottom: '1px solid rgba(42,42,58,0.5)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,0,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Icon size={14} style={{ color: '#FF6B00', flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate" style={{ color: '#F0F0FF' }}>
                                {item.title || item.username || item.type || 'Result'}
                              </div>
                              <div className="text-xs" style={{ color: '#6B6B8A' }}>
                                {item.venue || item.platform || item.status || ''}
                              </div>
                            </div>
                            {item.score && (
                              <span className="text-xs font-bold flex-shrink-0" style={{ color: '#FF6B00' }}>{item.score}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Close search when clicking outside */}
        {showSearch && (
          <div className="fixed inset-0 z-40" onClick={() => { setShowSearch(false); setSearchResults(null) }} />
        )}

        <div className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium"
          style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>
          <Sparkles size={12} />AI Active
        </div>

        <div className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); markAllRead && markAllRead() }}
            className="relative p-2 rounded-lg transition-all"
            style={{ background: '#1A1A26', border: '1px solid #2A2A3A', color: '#6B6B8A' }}>
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                style={{ background: '#FF6B00', color: '#fff', fontSize: '10px' }}>
                {unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-72 rounded-xl z-50 py-2 animate-fade-in"
              style={{ background: '#1A1A26', border: '1px solid #2A2A3A', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div className="px-4 py-2 text-xs font-semibold"
                style={{ color: '#6B6B8A', borderBottom: '1px solid #2A2A3A', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em' }}>
                NOTIFICATIONS
              </div>
              {!notifications?.length ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: '#6B6B8A' }}>No notifications yet</div>
              ) : notifications.slice(0, 5).map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="text-sm" style={{ color: '#F0F0FF' }}>{n.msg || n.message || n.title}</div>
                  <div className="text-xs mt-1" style={{ color: '#6B6B8A' }}>
                    {new Date(n.time || n.created_at || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
