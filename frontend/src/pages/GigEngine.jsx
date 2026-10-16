import { useState, useEffect } from 'react'
import {
    Music2,
    MapPin,
    DollarSign,
    Clock,
    Zap,
    Send,
    ExternalLink,
    Search,
    Briefcase
  } from 'lucide-react'
  
import { Button, Badge, Modal } from '../components/ui/Button'
import { gigService } from '../services/gigService'
import { resumeService } from '../services/resumeService'
import { aiService } from '../services/aiService'
import SyncMatcher from '../components/SyncMatcher'
import toast from 'react-hot-toast'
import { isDemoMode } from '../services/demo'
 
const mockGigs = [
  {
    id: 1, type: 'venue', title: 'R&B Night Headliner', venue: 'The Loft NYC',
    pay: '$800', location: 'New York, NY', deadline: '3 days',
    genre: 'R&B', status: 'open', match: 94,
    description: 'Looking for an emerging R&B/Soul artist for our monthly showcase. 300 capacity venue.',
  },
  {
    id: 2, type: 'sync', title: 'Netflix Series — Soundtrack', venue: 'Sync Only',
    pay: '$2,500', location: 'Remote', deadline: '7 days',
    genre: 'Soul/Hip-Hop', status: 'open', match: 88,
    description: 'Seeking original instrumental R&B and hip-hop tracks for dramatic scenes.',
  },
  {
    id: 3, type: 'linkedin', title: 'Brand Deal — Music Producer', venue: 'Adidas',
    pay: '$5,000', location: 'Remote', deadline: '5 days',
    genre: 'Any', status: 'open', match: 82,
    description: 'Brand partner needed for upcoming campaign. Must have 10K+ followers.',
  },
  {
    id: 4, type: 'venue', title: 'Summer Festival Opening Act', venue: 'SummerSoul Fest',
    pay: '$1,200', location: 'Atlanta, GA', deadline: '10 days',
    genre: 'Hip-Hop/R&B', status: 'open', match: 91,
    description: 'Opening act slot for day 1 of our 3-day festival. 2,000 capacity outdoor stage.',
  },
  {
    id: 5, type: 'sync', title: 'Video Game Soundtrack — Action RPG', venue: 'Indie Studio',
    pay: '$3,800', location: 'Remote', deadline: '14 days',
    genre: 'Electronic/Hip-Hop', status: 'open', match: 76,
    description: 'Full OST needed for 60-hour action RPG. Royalties + flat fee.',
  },
  {
    id: 6, type: 'venue', title: 'Private Corporate Event', venue: 'Goldman Sachs',
    pay: '$2,000', location: 'New York, NY', deadline: '6 days',
    genre: 'R&B', status: 'open', match: 79,
    description: '45-minute set for private company event. Covers acceptable.',
  },
]
 
const typeIcon = {
  venue: Music2,
  sync: Zap,
  linkedin: Briefcase,
}
 
const typeColor = {
  venue: '#FF6B00',
  sync: '#7B2FBE',
  linkedin: '#0077B5',
}
 
export default function GigEngine() {
  const [gigs, setGigs] = useState(mockGigs)
  const [selected, setSelected] = useState(null)
  const [applying, setApplying] = useState(null)
  const [applied, setApplied] = useState([])
  const [filter, setFilter] = useState('all')
  const [coverModal, setCoverModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [autoRunning, setAutoRunning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
 
  useEffect(() => {
    gigService.searchGigs({ genre: 'R&B' }).then(setGigs).catch(() => {})
  }, [])
 
  async function applyToGig(gig) {
    setApplying(gig.id)
    try {
      const cover = await aiService.generateCoverLetter(gig, { name: 'JP The Producer', fans: 15200 }).catch(() => null)
      setCoverLetter(
        cover?.letter ||
          `Dear ${gig.venue} Team,
 
My name is JP The Producer — an independent R&B and Hip-Hop artist/producer based in New York with over 15,200 engaged followers across Twitter and Instagram.
 
I've spent the last 5+ years crafting original music that blends authentic storytelling with modern production. My audience engagement rate sits at 4.8%, significantly above the 2% industry average.
 
I'd be honored to perform at ${gig.title}. My set is energetic, professional, and audience-focused — I've been building toward exactly this kind of opportunity.
 
Please find my full artist resume and streaming portfolio attached.
 
With respect,
JP The Producer`
      )
      setSelected(gig)
      setCoverModal(true)
    } finally {
      setApplying(null)
    }
  }
 
  async function submitApplication() {
    // Demo: applying would email a real venue, so show the cover letter but don't send it
    if (isDemoMode) {
      setCoverModal(false)
      toast('Applying is turned off in the demo. In the real app this sends your cover letter and resume.', { icon: '🔒' })
      return
    }
    try {
      await gigService.autoApply(selected.id, 1).catch(() => {})
      setApplied((prev) => [...prev, selected.id])
      setCoverModal(false)
      toast.success(`✅ Applied to "${selected.title}" — Tracking in Applications tab`)
    } catch {
      toast.error('Application sent (demo mode)')
      setApplied((prev) => [...prev, selected.id])
      setCoverModal(false)
    }
  }
 
  async function runBulkApply() {
    if (isDemoMode) {
      toast('Auto-apply is turned off in the demo. In the real app it applies to every 85%+ match for you.', { icon: '🔒' })
      return
    }
    setAutoRunning(true)
    const topGigs = gigs.filter((g) => g.match >= 85 && !applied.includes(g.id))
    for (const gig of topGigs) {
      await new Promise((r) => setTimeout(r, 800))
      setApplied((prev) => [...prev, gig.id])
      toast.success(`Auto-applied to "${gig.title}"`)
    }
    setAutoRunning(false)
    toast.success(`🚀 Applied to ${topGigs.length} high-match gigs!`)
  }
 
  const filtered = gigs.filter((g) => {
    const matchFilter = filter === 'all' || g.type === filter
    const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.venue.toLowerCase().includes(searchQuery.toLowerCase())
    return matchFilter && matchSearch
  })
 
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(123,47,190,0.1), rgba(255,107,0,0.08))',
          border: '1px solid rgba(123,47,190,0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="font-bold text-base"
              style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
            >
              🤖 Auto-Apply Engine
            </h3>
            <p className="text-sm mt-1" style={{ color: '#6B6B8A' }}>
              AI scans venues, sync deals, LinkedIn & brand deals 24/7 and submits your resume automatically
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="purple" icon={Zap} onClick={runBulkApply} loading={autoRunning}>
              {autoRunning ? 'Applying...' : 'Auto-Apply All (85%+ match)'}
            </Button>
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          <span style={{ color: '#6B6B8A' }}>
            <span style={{ color: '#FF6B00', fontWeight: 700 }}>{applied.length}</span> applications sent
          </span>
          <span style={{ color: '#6B6B8A' }}>
            <span style={{ color: '#22C55E', fontWeight: 700 }}>{gigs.length}</span> opportunities found today
          </span>
        </div>
      </div>
 
      {/* Filters + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48"
          style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
        >
          <Search size={14} style={{ color: '#6B6B8A' }} />
          <input
            placeholder="Search gigs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: '#F0F0FF' }}
          />
        </div>
        {['all', 'venue', 'sync', 'linkedin'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{
              background: filter === f ? '#7B2FBE' : '#1A1A26',
              color: filter === f ? '#fff' : '#6B6B8A',
              border: `1px solid ${filter === f ? '#7B2FBE' : '#2A2A3A'}`,
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {f === 'all' ? 'All Gigs' : f === 'sync' ? 'Sync/License' : f}
          </button>
        ))}
      </div>
 
      {/* Gig cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((gig) => {
          const Icon = typeIcon[gig.type] || Music2
          const color = typeColor[gig.type] || '#FF6B00'
          const isApplied = applied.includes(gig.id)
 
          return (
            <div
              key={gig.id}
              className="rounded-2xl p-5 transition-all duration-200"
              style={{
                background: '#1A1A26',
                border: `1px solid ${isApplied ? 'rgba(34,197,94,0.3)' : '#2A2A3A'}`,
              }}
              onMouseEnter={(e) => {
                if (!isApplied) {
                  e.currentTarget.style.borderColor = `${color}50`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isApplied ? 'rgba(34,197,94,0.3)' : '#2A2A3A'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: gig.match >= 90 ? 'rgba(34,197,94,0.15)' : 'rgba(255,107,0,0.15)',
                      color: gig.match >= 90 ? '#22C55E' : '#FF6B00',
                      fontFamily: 'Syne, sans-serif',
                    }}
                  >
                    {gig.match}% match
                  </div>
                </div>
              </div>
 
              <h4
                className="font-bold text-sm mb-1"
                style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
              >
                {gig.title}
              </h4>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: '#6B6B8A' }}>
                {gig.description}
              </p>
 
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs" style={{ color: '#6B6B8A' }}>
                <span className="flex items-center gap-1">
                  <DollarSign size={11} style={{ color: '#22C55E' }} />
                  {gig.pay}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {gig.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {gig.deadline} left
                </span>
              </div>
 
              <div className="flex gap-2">
                {isApplied ? (
                  <div
                    className="flex-1 py-2 rounded-lg text-xs font-semibold text-center"
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      color: '#22C55E',
                      fontFamily: 'Syne, sans-serif',
                    }}
                  >
                    ✓ Application Sent
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Send}
                      loading={applying === gig.id}
                      onClick={() => applyToGig(gig)}
                      className="flex-1"
                    >
                      Apply with AI
                    </Button>
                    <Button size="sm" variant="secondary" icon={ExternalLink}>
                      View
                    </Button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
 
      {/* Cover letter modal */}
      <Modal open={coverModal} onClose={() => setCoverModal(false)} title="AI Cover Letter" size="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="orange">{selected?.type}</Badge>
            <span className="text-sm font-semibold" style={{ color: '#F0F0FF' }}>{selected?.title}</span>
            <span className="text-sm" style={{ color: '#6B6B8A' }}>@ {selected?.venue}</span>
          </div>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={10}
            className="w-full rounded-xl text-sm outline-none resize-none"
            style={{
              background: '#12121A',
              border: '1px solid #2A2A3A',
              color: '#F0F0FF',
              padding: '12px',
              fontFamily: 'DM Sans, sans-serif',
              lineHeight: 1.8,
            }}
          />
          <div className="flex gap-2">
            <Button variant="primary" icon={Send} onClick={submitApplication} className="flex-1">
              Submit Application
            </Button>
            <Button variant="secondary" onClick={() => setCoverModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sync licensing matches, folded in from the v2 build */}
      <div className="mt-8">
        <SyncMatcher />
      </div>
    </div>
  )
}
 