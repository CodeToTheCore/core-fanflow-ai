import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, TrendingUp, Users, Music2, Star, ArrowRight, Play, Check } from 'lucide-react'
import { useArtistStore } from '../store/ArtistStore'
import api from '../services/api'
import { isDemoMode, startDemoSession } from '../services/demo'
 
export default function Landing() {
  const navigate = useNavigate()
  const { setArtist } = useArtistStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', genre: '', handle: '' })

  // In demo mode every "get started" button signs in as the sample artist
  async function handleStart() {
    if (!isDemoMode) return navigate('/dashboard')
    setLoading(true)
    try {
      await startDemoSession()
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }
 
  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isDemoMode) {
        await startDemoSession()
        return navigate('/dashboard')
      }
      // Demo: auto-login for MVP
      const { data } = await api.post('/auth/register', form).catch(() => ({
        data: {
          artist: { id: 1, name: form.name || 'JP The Producer', email: form.email, genre: form.genre },
          token: 'demo-token-' + Date.now(),
        },
      }))
      setArtist(data.artist, data.token)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }
 
  const features = [
    {
      icon: Users,
      title: 'Superfan Detector',
      desc: 'AI identifies your top 1% of fans who are ready to spend money on you',
      color: '#FF6B00',
    },
    {
      icon: Zap,
      title: 'Revenue Engine',
      desc: 'Generates exact campaigns, DMs, and offers that convert followers to paying fans',
      color: '#7B2FBE',
    },
    {
      icon: Music2,
      title: 'Gig Auto-Apply',
      desc: 'AI searches venues, sync deals, soundtracks and auto-submits your resume',
      color: '#FF6B00',
    },
    {
      icon: TrendingUp,
      title: 'LinkedIn Matcher',
      desc: 'Connects you with industry professionals and opportunities that fit your brand',
      color: '#7B2FBE',
    },
  ]
 
  const stats = [
    { value: '15K+', label: 'Artists Using FanFlow' },
    { value: '$2.4M', label: 'Revenue Generated' },
    { value: '12K+', label: 'Gigs Auto-Applied' },
    { value: '94%', label: 'Satisfaction Rate' },
  ]
 
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#0A0A0F', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Background orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,47,190,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)' }}
      />
 
      {/* Nav */}
      <nav
        className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(42,42,58,0.5)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #7B2FBE)' }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <span
            className="text-xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
          >
            FanFlow<span style={{ color: '#FF6B00' }}> AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            style={{ color: '#6B6B8A', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B8A')}
          >
            How It Works
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #FF8C38)',
              color: '#fff',
              fontFamily: 'Syne, sans-serif',
            }}
            onClick={handleStart}
          >
            Get Started
          </button>
        </div>
      </nav>
 
      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-16 flex items-start gap-16">
        {/* Left copy */}
        <div className="flex-1 max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: 'rgba(255,107,0,0.1)',
              border: '1px solid rgba(255,107,0,0.2)',
              color: '#FF6B00',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            <Star size={11} />
            The Independent Artist Revenue Engine
          </div>
 
          <h1
            className="text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
          >
            Turn your fanbase
            <br />
            into a{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF6B00, #9B4FDE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              revenue machine
            </span>
          </h1>
 
          <p className="text-lg mb-8 leading-relaxed" style={{ color: '#6B6B8A' }}>
            FanFlow AI identifies your highest-value fans, generates monetization
            campaigns, and automatically hunts down gigs — so you can focus on
            making music while we chase the hustle.
          </p>
 
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #FF6B00, #FF8C38)',
                color: '#fff',
                fontFamily: 'Syne, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,0,0.4)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Start Free <ArrowRight size={15} />
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all"
              style={{
                border: '1px solid #2A2A3A',
                color: '#F0F0FF',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <Play size={14} style={{ color: '#FF6B00' }} /> Watch Demo
            </button>
          </div>
 
          {/* Proof points */}
          <div className="flex gap-6">
            {['No label needed', 'Cancel anytime', 'Real AI, real results'].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs" style={{ color: '#6B6B8A' }}>
                <Check size={12} style={{ color: '#22C55E' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
 
        {/* Signup card */}
        <div
          className="w-96 flex-shrink-0 rounded-2xl p-6"
          style={{
            background: '#1A1A26',
            border: '1px solid #2A2A3A',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          }}
        >
          <h3
            className="text-lg font-bold mb-1"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
          >
            Create Your Artist Account
          </h3>
          <p className="text-sm mb-5" style={{ color: '#6B6B8A' }}>
            Free to start. AI insights in seconds.
          </p>
 
          <form onSubmit={handleSignup} className="space-y-4">
            {[
              { key: 'name', label: 'Artist Name', placeholder: 'JP The Producer' },
              { key: 'email', label: 'Email', placeholder: 'artist@email.com', type: 'email' },
              { key: 'genre', label: 'Primary Genre', placeholder: 'R&B, Hip-Hop, Pop...' },
              { key: 'handle', label: 'Twitter/IG Handle', placeholder: '@yourhandle' },
            ].map(({ key, label, placeholder, type = 'text' }) => (
              <div key={key}>
                <label
                  className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg text-sm outline-none"
                  style={{
                    background: '#12121A',
                    border: '1px solid #2A2A3A',
                    color: '#F0F0FF',
                    padding: '10px 12px',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#FF6B00')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A3A')}
                />
              </div>
            ))}
 
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold mt-2 flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #FF6B00, #7B2FBE)',
                color: '#fff',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={15} /> Launch My Revenue Engine
                </>
              )}
            </button>
          </form>
        </div>
      </section>
 
      {/* Stats bar */}
      <section
        className="relative z-10 border-y py-8"
        style={{ borderColor: '#2A2A3A' }}
      >
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div
                className="text-3xl font-bold"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  background: 'linear-gradient(135deg, #FF6B00, #9B4FDE)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {value}
              </div>
              <div className="text-sm mt-1" style={{ color: '#6B6B8A' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
          >
            Everything an independent artist needs
          </h2>
          <p className="mt-3 text-base" style={{ color: '#6B6B8A' }}>
            One platform. Infinite hustle.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="p-6 rounded-2xl transition-all duration-300 cursor-pointer"
              style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  color === '#FF6B00' ? 'rgba(255,107,0,0.3)' : 'rgba(123,47,190,0.3)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow =
                  color === '#FF6B00'
                    ? '0 8px 40px rgba(255,107,0,0.15)'
                    : '0 8px 40px rgba(123,47,190,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3A'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}20` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B6B8A' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>
 
      {/* Footer */}
      <footer
        className="relative z-10 py-8 text-center text-sm"
        style={{ borderTop: '1px solid #2A2A3A', color: '#6B6B8A' }}
      >
        © 2025 FanFlow AI — Built for independent artists. Powered by AI.
      </footer>
    </div>
  )
}
 