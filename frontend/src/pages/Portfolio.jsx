import { useState, useEffect } from 'react'
import { Save, Eye, Plus, X, Link, Award } from 'lucide-react'
import { FaTwitter, FaInstagram, FaSpotify, FaLinkedin, FaSoundcloud } from 'react-icons/fa'
import { Button, Badge } from '../components/ui/Button'
import { portfolioService } from '../services/mediaService'
import { useArtistStore } from '../store/ArtistStore'
import LiveEPK from '../components/LiveEPK'
import toast from 'react-hot-toast'

export default function Portfolio() {
  const { artist } = useArtistStore()
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('bio')
  const [portfolio, setPortfolio] = useState({
    bio: '',
    shortBio: '',
    pressQuote: '',
    influences: [],
    achievements: [],
    links: { twitter: '', instagram: '', spotify: '', linkedin: '', soundcloud: '', website: '' },
    isPublic: true,
  })
  const [newInfluence, setNewInfluence] = useState('')
  const [newAchievement, setNewAchievement] = useState('')

  useEffect(() => {
    portfolioService.get().then(data => {
      if (data) setPortfolio(prev => ({ ...prev, ...data }))
    }).catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    try {
      await portfolioService.save(portfolio)
      toast.success('Portfolio saved!')
    } catch {
      toast.error('Save failed — check backend connection')
    } finally {
      setSaving(false)
    }
  }

  function addInfluence() {
    if (!newInfluence.trim()) return
    setPortfolio(p => ({ ...p, influences: [...(p.influences || []), newInfluence.trim()] }))
    setNewInfluence('')
  }

  function removeInfluence(i) {
    setPortfolio(p => ({ ...p, influences: p.influences.filter((_, idx) => idx !== i) }))
  }

  function addAchievement() {
    if (!newAchievement.trim()) return
    setPortfolio(p => ({ ...p, achievements: [...(p.achievements || []), newAchievement.trim()] }))
    setNewAchievement('')
  }

  function removeAchievement(i) {
    setPortfolio(p => ({ ...p, achievements: p.achievements.filter((_, idx) => idx !== i) }))
  }

  const sections = [
    { key: 'bio', label: 'Bio & Story' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'links', label: 'Social Links' },
    { key: 'preview', label: 'Preview' },
  ]

  const socialLinks = [
    { key: 'twitter', icon: FaTwitter, color: '#1DA1F2', placeholder: 'https://twitter.com/yourhandle' },
    { key: 'instagram', icon: FaInstagram, color: '#E1306C', placeholder: 'https://instagram.com/yourhandle' },
    { key: 'spotify', icon: FaSpotify, color: '#1DB954', placeholder: 'https://open.spotify.com/artist/...' },
    { key: 'linkedin', icon: FaLinkedin, color: '#0077B5', placeholder: 'https://linkedin.com/in/yourname' },
    { key: 'soundcloud', icon: FaSoundcloud, color: '#FF5500', placeholder: 'https://soundcloud.com/yourname' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Section tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeSection === s.key ? '#FF6B00' : '#1A1A26',
                color: activeSection === s.key ? '#fff' : '#6B6B8A',
                border: `1px solid ${activeSection === s.key ? '#FF6B00' : '#2A2A3A'}`,
                fontFamily: 'Syne, sans-serif',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Button variant="primary" icon={Save} onClick={save} loading={saving}>
          Save Portfolio
        </Button>
      </div>

      {/* Bio & Story */}
      {activeSection === 'bio' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>
              Full Artist Bio
            </label>
            <p className="text-xs mb-3" style={{ color: '#6B6B8A' }}>
              Tell your full story. Where you're from, how you started, what drives your music. This goes in your press kit and resume.
            </p>
            <textarea
              rows={8}
              placeholder={`My name is ${artist?.name || 'your name'}. I started making music because...`}
              value={portfolio.bio}
              onChange={e => setPortfolio(p => ({ ...p, bio: e.target.value }))}
              className="w-full rounded-xl text-sm outline-none resize-none"
              style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF', padding: '12px', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.8 }}
              onFocus={e => e.currentTarget.style.borderColor = '#FF6B00'}
              onBlur={e => e.currentTarget.style.borderColor = '#2A2A3A'}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: '#6B6B8A' }}>{portfolio.bio?.length || 0} characters</span>
              <span className="text-xs" style={{ color: portfolio.bio?.length > 100 ? '#22C55E' : '#6B6B8A' }}>
                {portfolio.bio?.length > 500 ? '✓ Great length' : portfolio.bio?.length > 200 ? '✓ Good' : 'Write more...'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#7B2FBE', fontFamily: 'Syne, sans-serif' }}>
                Short Bio (for press + socials)
              </label>
              <textarea
                rows={3}
                placeholder="One powerful paragraph about who you are as an artist..."
                value={portfolio.shortBio}
                onChange={e => setPortfolio(p => ({ ...p, shortBio: e.target.value }))}
                className="w-full rounded-xl text-sm outline-none resize-none"
                style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF', padding: '10px 12px', lineHeight: 1.7 }}
                onFocus={e => e.currentTarget.style.borderColor = '#7B2FBE'}
                onBlur={e => e.currentTarget.style.borderColor = '#2A2A3A'}
              />
            </div>

            <div className="rounded-2xl p-5" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#7B2FBE', fontFamily: 'Syne, sans-serif' }}>
                Press Quote / Tagline
              </label>
              <textarea
                rows={3}
                placeholder='"The most authentic voice in independent R&B today..." — Your words here'
                value={portfolio.pressQuote}
                onChange={e => setPortfolio(p => ({ ...p, pressQuote: e.target.value }))}
                className="w-full rounded-xl text-sm outline-none resize-none"
                style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF', padding: '10px 12px', lineHeight: 1.7 }}
                onFocus={e => e.currentTarget.style.borderColor = '#7B2FBE'}
                onBlur={e => e.currentTarget.style.borderColor = '#2A2A3A'}
              />
            </div>
          </div>

          {/* Influences */}
          <div className="rounded-2xl p-5" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
            <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>
              Musical Influences
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(portfolio.influences || []).map((inf, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(255,107,0,0.15)', color: '#FF6B00' }}>
                  {inf}
                  <button onClick={() => removeInfluence(i)}><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                placeholder="Add an artist (e.g. D'Angelo, J Dilla, Frank Ocean)"
                value={newInfluence}
                onChange={e => setNewInfluence(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addInfluence()}
                className="flex-1 rounded-lg text-sm outline-none"
                style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF', padding: '8px 12px' }}
              />
              <Button size="sm" variant="primary" icon={Plus} onClick={addInfluence}>Add</Button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {activeSection === 'achievements' && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>
            Career Highlights & Achievements
          </label>
          <p className="text-xs" style={{ color: '#6B6B8A' }}>
            Add milestones, gigs played, media coverage, streams, collaborations — anything that proves your credibility.
          </p>
          <div className="space-y-2">
            {(portfolio.achievements || []).map((ach, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#12121A', border: '1px solid #2A2A3A' }}>
                <Award size={14} style={{ color: '#FF6B00', flexShrink: 0 }} />
                <span className="flex-1 text-sm" style={{ color: '#F0F0FF' }}>{ach}</span>
                <button onClick={() => removeAchievement(i)} style={{ color: '#6B6B8A' }}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="e.g. Performed at SummerSoul Fest 2024 (2,000 capacity)"
              value={newAchievement}
              onChange={e => setNewAchievement(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAchievement()}
              className="flex-1 rounded-lg text-sm outline-none"
              style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF', padding: '10px 12px' }}
            />
            <Button size="sm" variant="primary" icon={Plus} onClick={addAchievement}>Add</Button>
          </div>
        </div>
      )}

      {/* Social Links */}
      {activeSection === 'links' && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>
            Social & Streaming Links
          </label>
          <p className="text-xs mb-4" style={{ color: '#6B6B8A' }}>
            These links go in your public portfolio and AI-generated resume.
          </p>
          {socialLinks.map(({ key, icon: Icon, color, placeholder }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <input
                placeholder={placeholder}
                value={portfolio.links?.[key] || ''}
                onChange={e => setPortfolio(p => ({ ...p, links: { ...p.links, [key]: e.target.value } }))}
                className="flex-1 rounded-lg text-sm outline-none"
                style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF', padding: '10px 12px' }}
                onFocus={e => e.currentTarget.style.borderColor = color}
                onBlur={e => e.currentTarget.style.borderColor = '#2A2A3A'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {activeSection === 'preview' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
          <div className="p-6" style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(123,47,190,0.1))' }}>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
              {artist?.name || 'Artist Name'}
            </div>
            <div className="text-sm mt-1" style={{ color: '#FF6B00' }}>{artist?.genre || 'R&B'} Artist</div>
            {portfolio.pressQuote && (
              <div className="mt-3 text-sm italic" style={{ color: '#6B6B8A' }}>"{portfolio.pressQuote}"</div>
            )}
          </div>
          <div className="p-6 space-y-4">
            {portfolio.bio && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>Bio</div>
                <p className="text-sm leading-relaxed" style={{ color: '#B0B0C8' }}>{portfolio.bio}</p>
              </div>
            )}
            {portfolio.influences?.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#7B2FBE', fontFamily: 'Syne, sans-serif' }}>Influences</div>
                <div className="flex flex-wrap gap-2">
                  {portfolio.influences.map((inf, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(123,47,190,0.15)', color: '#9B4FDE' }}>{inf}</span>
                  ))}
                </div>
              </div>
            )}
            {portfolio.achievements?.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>Highlights</div>
                <ul className="space-y-1">
                  {portfolio.achievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#B0B0C8' }}>
                      <span style={{ color: '#FF6B00', marginTop: 4 }}>•</span>{ach}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live press kit, folded in from the v2 build */}
      <LiveEPK artistData={{ ...artist, bio: portfolio.bio || artist?.bio }} />
    </div>
  )
}
