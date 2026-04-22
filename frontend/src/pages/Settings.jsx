import { useState } from 'react'
import { Music, CreditCard, Bell, Zap, Shield, Check } from 'lucide-react'
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"
import { Toggle, Button, Badge } from '../components/ui/Button'
import toast from 'react-hot-toast'
import { useArtistStore } from '../store/ArtistStore'
 
export default function Settings() {
  const { artist, updateArtist } = useArtistStore()
  const [connected, setConnected] = useState({ twitter: true, instagram: false, spotify: false, linkedin: false })
  const [notifications, setNotifications] = useState({
    gigAlerts: true, fanMilestones: true, campaignResults: true, weeklyReport: true, newSuperfan: false,
  })
  const [autoApply, setAutoApply] = useState(true)
  const [aiManager, setAiManager] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plan] = useState('free') // 'free' | 'pro'
 
  async function connectPlatform(platform) {
    // In production: OAuth flow
    toast.loading(`Connecting ${platform}...`, { duration: 1500 })
    await new Promise(r => setTimeout(r, 1500))
    setConnected(c => ({ ...c, [platform]: !c[platform] }))
    toast.success(connected[platform] ? `Disconnected ${platform}` : `Connected ${platform}!`)
  }
 
  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    toast.success('Profile saved!')
    setSaving(false)
  }
 
  const integrations = [
    {
      key: 'twitter',
      icon: FaTwitter,
      label: 'Twitter / X',
      desc: 'Pull followers, engagement, DM automation',
      color: '#1DA1F2'
    },
    {
      key: 'instagram',
      icon: FaInstagram,
      label: 'Instagram',
      desc: 'Story analytics, follower insights',
      color: '#E1306C'
    },
    {
      key: 'spotify',
      icon: Music,
      label: 'Spotify for Artists',
      desc: 'Monthly listeners, stream data',
      color: '#1DB954'
    },
    {
      key: 'linkedin',
      icon: FaLinkedin,
      label: 'LinkedIn',
      desc: 'Industry connections, brand deals discovery',
      color: '#0077B5'
    },
  ]
 
  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Plan banner */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between"
        style={{
          background: plan === 'pro'
            ? 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(123,47,190,0.1))'
            : 'rgba(26,26,38,1)',
          border: `1px solid ${plan === 'pro' ? 'rgba(255,107,0,0.3)' : '#2A2A3A'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: plan === 'pro' ? 'linear-gradient(135deg, #FF6B00, #7B2FBE)' : '#2A2A3A' }}
          >
            <Zap size={18} style={{ color: plan === 'pro' ? '#fff' : '#6B6B8A' }} />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
              {plan === 'pro' ? 'FanFlow Pro' : 'Free Plan'}
            </div>
            <div className="text-xs" style={{ color: '#6B6B8A' }}>
              {plan === 'pro' ? 'Unlimited campaigns · AI manager · Auto-apply' : '3 campaigns/month · Basic analytics'}
            </div>
          </div>
        </div>
        {plan !== 'pro' && (
          <Button variant="primary" icon={Zap}>
            Upgrade to Pro — $19/mo
          </Button>
        )}
        {plan === 'pro' && <Badge variant="orange">Active</Badge>}
      </div>
 
      {/* Artist Profile */}
      <section
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
          Artist Profile
        </h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Artist Name', key: 'name', placeholder: 'JP The Producer' },
              { label: 'Email', key: 'email', placeholder: 'jp@email.com' },
              { label: 'Primary Genre', key: 'genre', placeholder: 'R&B, Hip-Hop...' },
              { label: 'Location', key: 'location', placeholder: 'New York, NY' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}>
                  {label}
                </label>
                <input
                  defaultValue={artist?.[key] || ''}
                  placeholder={placeholder}
                  className="w-full rounded-lg text-sm outline-none"
                  style={{
                    background: '#12121A', border: '1px solid #2A2A3A',
                    color: '#F0F0FF', padding: '10px 12px', fontFamily: 'DM Sans, sans-serif',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#FF6B00'}
                  onBlur={e => e.currentTarget.style.borderColor = '#2A2A3A'}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}>
              Artist Bio
            </label>
            <textarea
              rows={3}
              defaultValue={artist?.bio || ''}
              placeholder="Tell venues and fans who you are..."
              className="w-full rounded-lg text-sm outline-none resize-none"
              style={{
                background: '#12121A', border: '1px solid #2A2A3A',
                color: '#F0F0FF', padding: '10px 12px', fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#FF6B00'}
              onBlur={e => e.currentTarget.style.borderColor = '#2A2A3A'}
            />
          </div>
          <Button variant="primary" loading={saving} className="w-full">
            Save Profile
          </Button>
        </form>
      </section>
 
      {/* Integrations */}
      <section
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
          Platform Integrations
        </h3>
        <div className="space-y-3">
          {integrations.map(({ key, icon: Icon, label, desc, color }) => (
            <div
              key={key}
              className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{ background: '#12121A', border: '1px solid #2A2A3A' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: '#F0F0FF', fontFamily: 'DM Sans, sans-serif' }}>
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#6B6B8A' }}>{desc}</div>
              </div>
              <div className="flex items-center gap-3">
                {connected[key] && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#22C55E' }}>
                    <Check size={12} /> Connected
                  </div>
                )}
                <Button
                  size="sm"
                  variant={connected[key] ? 'secondary' : 'primary'}
                  onClick={() => connectPlatform(key)}
                >
                  {connected[key] ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* AI Settings */}
      <section
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
          AI Automation
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: '#F0F0FF' }}>Auto-Apply to Gigs</div>
              <div className="text-xs" style={{ color: '#6B6B8A' }}>AI submits your resume to 85%+ match gigs automatically</div>
            </div>
            <Toggle checked={autoApply} onChange={setAutoApply} />
          </div>
          <div style={{ borderTop: '1px solid #2A2A3A' }} />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: '#F0F0FF' }}>AI Manager Mode</div>
              <div className="text-xs" style={{ color: '#6B6B8A' }}>Let AI proactively suggest campaigns and opportunities</div>
            </div>
            <Toggle checked={aiManager} onChange={setAiManager} />
          </div>
        </div>
      </section>
 
      {/* Notifications */}
      <section
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
          Notifications
        </h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, val]) => {
            const labels = {
              gigAlerts: { label: 'New Gig Alerts', desc: 'When new high-match gigs are found' },
              fanMilestones: { label: 'Fan Milestones', desc: 'When you hit follower milestones' },
              campaignResults: { label: 'Campaign Results', desc: 'Revenue and reach updates' },
              weeklyReport: { label: 'Weekly AI Report', desc: 'Sunday summary of your performance' },
              newSuperfan: { label: 'New Superfan Detected', desc: 'When a fan crosses into top 1%' },
            }
            const { label, desc } = labels[key]
            return (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium" style={{ color: '#F0F0FF' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#6B6B8A' }}>{desc}</div>
                </div>
                <Toggle
                  checked={val}
                  onChange={(v) => setNotifications(n => ({ ...n, [key]: v }))}
                />
              </div>
            )
          })}
        </div>
      </section>
 
      {/* Payment */}
      <section
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
          <CreditCard size={15} className="inline mr-2" style={{ color: '#FF6B00' }} />
          Payment & Billing
        </h3>
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-4"
          style={{ background: '#12121A', border: '1px solid #2A2A3A' }}
        >
          <div className="w-8 h-5 rounded" style={{ background: 'linear-gradient(135deg, #1DA1F2, #7B2FBE)' }} />
          <span className="text-sm" style={{ color: '#F0F0FF' }}>No payment method on file</span>
          <Button size="sm" variant="secondary" className="ml-auto">Add Card</Button>
        </div>
        <p className="text-xs" style={{ color: '#6B6B8A' }}>
          Stripe-secured payments. Cancel anytime. Revenue split: 5% of gig revenue generated through FanFlow AI.
        </p>
      </section>
    </div>
  )
}
 