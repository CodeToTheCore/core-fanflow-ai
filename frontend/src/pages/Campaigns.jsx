import { useState } from 'react'
import { Megaphone, Zap, Copy, Send, DollarSign, Users, Check } from 'lucide-react'
import { Button, Badge, Modal, Toggle } from '../components/ui/Button'
import { aiService } from '../services/aiService'
import toast from 'react-hot-toast'
 
const campaignTypes = [
  {
    id: 'vip_drop', icon: '🎯', title: 'VIP Drop',
    desc: 'Exclusive release to superfans only',
    estimatedRevenue: '$400–$1,200',
    color: '#FF6B00',
  },
  {
    id: 'behind_scenes', icon: '🎬', title: 'Behind The Scenes Pack',
    desc: 'Studio footage, process, and unreleased content',
    estimatedRevenue: '$200–$600',
    color: '#7B2FBE',
  },
  {
    id: 'listening_session', icon: '🎧', title: 'Private Listening Session',
    desc: 'Live stream for top fans before public release',
    estimatedRevenue: '$150–$500',
    color: '#FF6B00',
  },
  {
    id: 'sample_pack', icon: '🎚️', title: 'Sample Pack Sale',
    desc: 'Sell exclusive beats/samples to your producer fans',
    estimatedRevenue: '$500–$2,000',
    color: '#7B2FBE',
  },
  {
    id: 'merch_drop', icon: '👕', title: 'Limited Merch Drop',
    desc: 'Limited edition merch to your top supporters',
    estimatedRevenue: '$300–$900',
    color: '#FF6B00',
  },
  {
    id: 'feature_raffle', icon: '🎤', title: 'Feature Raffle',
    desc: 'Fans enter to be featured on your next track',
    estimatedRevenue: '$200–$800',
    color: '#7B2FBE',
  },
]
 
const mockCampaigns = [
  {
    id: 1, type: 'VIP Drop', status: 'active', reach: 152, revenue: '$840',
    caption: 'Dropping something exclusively for my day ones this Friday 🔥',
    sentAt: '2 days ago',
  },
  {
    id: 2, type: 'Sample Pack', status: 'completed', reach: 87, revenue: '$1,250',
    caption: 'New pack just dropped — 50 original loops straight from the session',
    sentAt: '2 weeks ago',
  },
]
 
export default function Campaigns() {
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [campaign, setCampaign] = useState(null)
  const [campaignModal, setCampaignModal] = useState(false)
  const [autoSend, setAutoSend] = useState(false)
  const [campaigns, setCampaigns] = useState(mockCampaigns)
 
  async function generateCampaign(type) {
    setSelectedType(type)
    setGenerating(true)
    try {
      const result = await aiService.generateCampaign(
        type.id,
        { name: 'JP The Producer', genre: 'R&B', followers: 15200 },
        { superfanCount: 152, topFans: ['melodyhunter', 'basslineQueen'] }
      ).catch(() => null)
 
      setCampaign(
        result || {
          type: type.title,
          caption: `🔥 To my real ones — I've been in the lab cooking something special.\n\nBefore I drop this publicly, I'm giving my day-ones first access. This is exclusively for YOU.\n\n${type.id === 'vip_drop' ? 'First 50 fans get early access + bonus content for $15. Reply "DROP" to get in.' : type.id === 'sample_pack' ? 'New producer pack — 50 loops, 30 samples, all original. $25 for the next 48 hours.' : 'DM me "VIP" to get access before everyone else.'}\n\nLove to my supporters. This is what independent looks like. 💯`,
          dmScript: `Hey [name]! 👊 Just wanted to personally reach out to you — you've been rocking with me since day one and it means everything.\n\nI've got something special dropping exclusively for my top supporters this week. I'm only sharing with ${type.estimatedRevenue.includes('2,0') ? '20' : '50'} people.\n\nWant in? Reply back and I'll send you everything you need.`,
          hashtags: ['#IndieArtist', '#RnB', '#NewMusic', '#Independent', '#FanExclusive'],
          estimatedReach: 152,
          estimatedRevenue: type.estimatedRevenue,
          platforms: ['twitter', 'instagram'],
        }
      )
      setCampaignModal(true)
    } finally {
      setGenerating(false)
    }
  }
 
  function copyText(text) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }
 
  function launchCampaign() {
    setCampaigns((prev) => [
      {
        id: Date.now(),
        type: campaign.type,
        status: 'active',
        reach: campaign.estimatedReach,
        revenue: '$0',
        caption: campaign.caption.slice(0, 60) + '...',
        sentAt: 'Just now',
      },
      ...prev,
    ])
    setCampaignModal(false)
    toast.success(`🚀 Campaign "${campaign.type}" launched to ${campaign.estimatedReach} superfans!`)
  }
 
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Campaign type grid */}
      <div>
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}
        >
          Generate New Campaign
        </div>
        <div className="grid grid-cols-3 gap-3">
          {campaignTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => generateCampaign(type)}
              disabled={generating}
              className="p-4 rounded-2xl text-left transition-all duration-200"
              style={{
                background: '#1A1A26',
                border: '1px solid #2A2A3A',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${type.color}40`
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3A'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div
                className="font-bold text-sm mb-1"
                style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
              >
                {type.title}
              </div>
              <div className="text-xs mb-2" style={{ color: '#6B6B8A' }}>
                {type.desc}
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: type.color, fontFamily: 'Syne, sans-serif' }}
              >
                Est. {type.estimatedRevenue}
              </div>
            </button>
          ))}
        </div>
      </div>
 
      {/* Active campaigns */}
      <div>
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}
        >
          Active & Recent Campaigns
        </div>
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,107,0,0.1)' }}
              >
                <Megaphone size={18} style={{ color: '#FF6B00' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-semibold text-sm"
                  style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
                >
                  {c.type}
                </div>
                <div className="text-xs mt-0.5 truncate" style={{ color: '#6B6B8A' }}>
                  {c.caption}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs flex-shrink-0">
                <span style={{ color: '#6B6B8A' }}>
                  <Users size={11} className="inline mr-1" />
                  {c.reach}
                </span>
                <span style={{ color: '#22C55E', fontWeight: 700 }}>
                  <DollarSign size={11} className="inline" />
                  {c.revenue}
                </span>
                <Badge variant={c.status === 'active' ? 'orange' : 'muted'}>
                  {c.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Campaign modal */}
      <Modal open={campaignModal} onClose={() => setCampaignModal(false)} title={`${campaign?.type} Campaign`} size="lg">
        {campaign && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Est. Reach', value: `${campaign.estimatedReach} fans`, color: '#FF6B00' },
                { label: 'Est. Revenue', value: campaign.estimatedRevenue, color: '#22C55E' },
                { label: 'Platforms', value: campaign.platforms?.join(', '), color: '#7B2FBE' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-xl text-center" style={{ background: '#12121A' }}>
                  <div className="text-xs mb-1" style={{ color: '#6B6B8A' }}>{label}</div>
                  <div className="text-sm font-bold" style={{ color, fontFamily: 'Syne, sans-serif' }}>{value}</div>
                </div>
              ))}
            </div>
 
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B6B8A' }}>
                  Post Caption
                </span>
                <button onClick={() => copyText(campaign.caption)}>
                  <Copy size={13} style={{ color: '#6B6B8A' }} />
                </button>
              </div>
              <div
                className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line"
                style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF' }}
              >
                {campaign.caption}
              </div>
            </div>
 
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B6B8A' }}>
                  DM Script (send to superfans)
                </span>
                <button onClick={() => copyText(campaign.dmScript)}>
                  <Copy size={13} style={{ color: '#6B6B8A' }} />
                </button>
              </div>
              <div
                className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line"
                style={{ background: '#12121A', border: '1px solid #2A2A3A', color: '#F0F0FF' }}
              >
                {campaign.dmScript}
              </div>
            </div>
 
            <div className="flex items-center justify-between">
              <Toggle checked={autoSend} onChange={setAutoSend} label="Auto-send DMs to superfans" />
            </div>
 
            <div className="flex gap-2">
              <Button variant="primary" icon={Zap} onClick={launchCampaign} className="flex-1">
                Launch Campaign
              </Button>
              <Button variant="secondary" icon={Copy} onClick={() => copyText(campaign.caption + '\n\n' + campaign.dmScript)}>
                Copy All
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}