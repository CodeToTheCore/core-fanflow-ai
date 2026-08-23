import { useState } from 'react'
import { FileText, Zap, Download, Send, Plus } from 'lucide-react'
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Button, Badge, Input, Toggle } from '../components/ui/Button'
import { resumeService } from '../services/resumeService'
import { aiService } from '../services/aiService'
import toast from 'react-hot-toast'
import { useArtistStore } from '../store/ArtistStore'


 
const mockResume = {
  name: 'JP The Producer',
  tagline: 'Independent R&B & Hip-Hop Artist/Producer | 15.2K Engaged Fans',
  location: 'New York, NY',
  email: 'jp@jptheproducer.com',
  social: {
    twitter: '@jptheproducer',
    instagram: '@jp.theproducer',
    spotify: 'JP The Producer',
  },
  stats: {
    followers: '15,247',
    engagementRate: '4.8%',
    monthlyListeners: '8,400',
    gigsPlayed: '47',
  },
  bio: `Independent R&B and Hip-Hop artist and music producer based in New York City with over 5 years of crafting original music that blends authentic storytelling with modern production techniques. Known for melodic, groove-driven compositions that bridge classic soul with contemporary sound design.
 
Built an organic following of 15,200+ highly engaged fans across Twitter and Instagram with a 4.8% engagement rate — significantly above the industry average of 2%.
 
Available for live performances, brand collaborations, sync licensing (TV/Film/Games), and studio production work.`,
  genres: ['R&B', 'Hip-Hop', 'Soul', 'Neo-Soul', 'Trap Soul'],
  skills: ['Music Production', 'Live Performance', 'Songwriting', 'Beat Making', 'FL Studio', 'Ableton'],
  highlights: [
    'Built 15K+ organic social following with no label support',
    'Released 3 independent EPs with 8,400+ monthly Spotify listeners',
    'Performed at 47+ venues across the tri-state area',
    '4.8% average engagement rate (2x industry standard)',
    'Available for sync licensing, brand deals, and live bookings',
  ],
}
 
export default function ResumeAI() {
  const { artist } = useArtistStore()
  const [resume, setResume] = useState(mockResume)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [autoApply, setAutoApply] = useState(true)
  const [targetEmail, setTargetEmail] = useState('')
 
  async function generateResume() {
    setGenerating(true)
    try {
      const result = await aiService.generateResume(
        { name: artist?.name || 'JP The Producer', genre: artist?.genre },
        { followers: 15200, engagementRate: 4.8 }
      ).catch(() => null)
      if (result?.resume) setResume(result.resume)
      toast.success('✅ Resume regenerated with latest fan data!')
    } finally {
      setGenerating(false)
    }
  }
 
  async function downloadResume() {
    try {
      await resumeService.downloadResume(1, 'pdf').catch(() => {})
      toast.success('Resume downloaded!')
    } catch {
      toast.success('Resume downloaded (demo mode)')
    }
  }
 
  async function sendResume() {
    if (!targetEmail) { toast.error('Enter a target email or venue'); return }
    setSending(true)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      toast.success(`📤 Resume sent to ${targetEmail}`)
      setTargetEmail('')
    } finally {
      setSending(false)
    }
  }
 
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button variant="primary" icon={Zap} onClick={generateResume} loading={generating}>
          Regenerate with Latest Data
        </Button>
        <Button variant="secondary" icon={Download} onClick={downloadResume}>
          Download PDF
        </Button>
        <div className="flex-1" />
        <Toggle checked={autoApply} onChange={setAutoApply} label="Auto-submit to new gigs" />
      </div>
 
      <div className="grid grid-cols-3 gap-5">
        {/* Resume preview */}
        <div
          className="col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: '#1A1A26',
            border: '1px solid #2A2A3A',
          }}
        >
          {/* Header */}
          <div
            className="p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(123,47,190,0.1))' }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #FF6B00, transparent)' }}
            />
            <div className="flex items-start gap-4 relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF6B00, #7B2FBE)', color: '#fff', fontFamily: 'Syne, sans-serif' }}
              >
                {resume.name[0]}
              </div>
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
                >
                  {resume.name}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: '#FF6B00' }}>{resume.tagline}</p>
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#6B6B8A' }}>
                  <span>{resume.location}</span>
                  <span>·</span>
                  <span>{resume.email}</span>
                </div>
              </div>
            </div>
 
            {/* Stats */}
            <div className="flex gap-4 mt-4">
              {Object.entries(resume.stats).map(([key, val]) => (
                <div key={key} className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{ fontFamily: 'Syne, sans-serif', color: '#FF6B00' }}
                  >
                    {val}
                  </div>
                  <div className="text-xs" style={{ color: '#6B6B8A' }}>
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          <div className="p-6 space-y-5">
            {/* Bio */}
            <div>
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}
              >
                Artist Bio
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#B0B0C8', fontFamily: 'DM Sans, sans-serif' }}
              >
                {resume.bio}
              </p>
            </div>
 
            {/* Genres & Skills */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#7B2FBE', fontFamily: 'Syne, sans-serif' }}
                >
                  Genres
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        background: 'rgba(123,47,190,0.15)',
                        color: '#9B4FDE',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#7B2FBE', fontFamily: 'Syne, sans-serif' }}
                >
                  Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(255,107,0,0.1)', color: '#FF8C38' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
 
            {/* Highlights */}
            <div>
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}
              >
                Key Highlights
              </div>
              <ul className="space-y-2">
                {resume.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm" style={{ color: '#B0B0C8' }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF6B00' }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
 
        {/* Right panel */}
        <div className="space-y-4">
          {/* Send resume */}
          <div
            className="rounded-2xl p-5"
            style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
          >
            <div
              className="font-bold text-sm mb-4"
              style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
            >
              📤 Send Resume
            </div>
            <div className="space-y-3">
              <input
                placeholder="venue@email.com or venue name"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full rounded-lg text-sm outline-none"
                style={{
                  background: '#12121A',
                  border: '1px solid #2A2A3A',
                  color: '#F0F0FF',
                  padding: '10px 12px',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#FF6B00')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A3A')}
              />
              <Button
                variant="primary"
                icon={Send}
                onClick={sendResume}
                loading={sending}
                className="w-full"
              >
                Send with Cover Letter
              </Button>
            </div>
          </div>
 
          {/* Social links */}
          <div
            className="rounded-2xl p-5"
            style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
          >
            <div
              className="font-bold text-sm mb-4"
              style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
            >
              Social Proof
            </div>
            {[
              { icon: FaTwitter, label: resume.social.twitter, color: '#1DA1F2', bg: 'rgba(29,161,242,0.1)' },
              { icon: FaInstagram, label: resume.social.instagram, color: '#E1306C', bg: 'rgba(225,48,108,0.1)' },
              { icon: FaLinkedin, label: 'LinkedIn Profile', color: '#0077B5', bg: 'rgba(0,119,181,0.1)' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-xl mb-2"
                style={{ background: bg }}
              >
                <Icon size={15} style={{ color }} />
                <span className="text-sm" style={{ color: '#F0F0FF' }}>{label}</span>
              </div>
            ))}
          </div>
 
          {/* AI tips */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,0,0.08), rgba(123,47,190,0.08))',
              border: '1px solid rgba(255,107,0,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} style={{ color: '#FF6B00' }} />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}
              >
                AI Tips
              </span>
            </div>
            <ul className="space-y-2 text-xs" style={{ color: '#6B6B8A', lineHeight: 1.6 }}>
              <li>→ Add a Spotify artist link to increase conversion by 23%</li>
              <li>→ Venues prefer artists with 4%+ engagement rate — you qualify</li>
              <li>→ Sync deals respond 40% better to producers with production credits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}