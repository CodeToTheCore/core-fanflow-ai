import { useEffect, useState } from 'react'
import { Users, DollarSign, TrendingUp, Music2, Zap, ArrowRight, Bell } from 'lucide-react'
import { BentoGrid, StatCard, RevenueCard, FanScoreCard, BentoCard } from '../components/bento/BentoGrid'
import { Button, Badge } from '../components/ui/Button'
import { fanService } from '../services/fanService'
import { aiService } from '../services/aiService'
import { useArtistStore } from '../store/ArtistStore'
import TrendRadar from '../components/TrendRadar'
import Leaderboard from '../components/Leaderboard'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
 
const mockGrowthData = [
  { month: 'Jan', fans: 9200, revenue: 320 },
  { month: 'Feb', fans: 10100, revenue: 480 },
  { month: 'Mar', fans: 11400, revenue: 610 },
  { month: 'Apr', fans: 12200, revenue: 720 },
  { month: 'May', fans: 13500, revenue: 890 },
  { month: 'Jun', fans: 15200, revenue: 1140 },
]
 
const mockSuperfans = [
  { username: 'melodyhunter', score: 97, platform: 'twitter' },
  { username: 'basslineQueen', score: 94, platform: 'instagram' },
  { username: 'nocturnal_wav', score: 91, platform: 'twitter' },
  { username: 'soulpatch99', score: 88, platform: 'instagram' },
  { username: 'loopmaster_k', score: 86, platform: 'twitter' },
]
 
const mockSuggestions = [
  { id: 1, type: 'campaign', text: 'Drop a $10 exclusive sample pack to your top 120 fans — estimated $1,200 revenue', priority: 'high' },
  { id: 2, type: 'gig', text: 'New venue opening in your city looking for R&B acts — deadline in 3 days', priority: 'urgent' },
  { id: 3, type: 'content', text: 'Behind-the-scenes studio session would spike engagement 40% based on your data', priority: 'medium' },
]
 
export default function Dashboard() {
  const { artist, addNotification } = useArtistStore()
  const navigate = useNavigate()
  const [superfans, setSuperfans] = useState(mockSuperfans)
  const [suggestions, setSuggestions] = useState(mockSuggestions)
  const [loadingAI, setLoadingAI] = useState(false)
 
  useEffect(() => {
    fanService.getSuperfans(5).then(setSuperfans).catch(() => {})
    aiService.getMonetizationSuggestions({ genre: artist?.genre }).then((d) => {
      if (d?.suggestions) setSuggestions(d.suggestions)
    }).catch(() => {})
  }, [])
 


  
  async function generateQuickCampaign() {
    setLoadingAI(true)
    try {
      const result = await aiService.generateCampaign('vip_drop', artist, { fanCount: 15200, topFanCount: 152 })
      addNotification({ msg: '🎯 New campaign generated! Check Campaigns tab.', type: 'success' })
    } catch {
      addNotification({ msg: 'Quick campaign generated (demo mode)', type: 'success' })
    } finally {
      setLoadingAI(false)
    }
  }
 
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
        <div style={{ color: '#FF6B00' }}>Fans: {payload[0]?.value?.toLocaleString()}</div>
        <div style={{ color: '#9B4FDE' }}>Rev: ${payload[1]?.value}</div>
      </div>
    )
  }
 
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(123,47,190,0.1))',
          border: '1px solid rgba(255,107,0,0.2)',
        }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10"
          style={{ background: 'radial-gradient(circle at right, #FF6B00, transparent)' }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
            >
              Welcome back, {artist?.name || 'JP'} 👊
            </h2>
            <p className="text-sm mt-1" style={{ color: '#6B6B8A' }}>
              Your AI is actively hunting gigs and analyzing your fans right now.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={generateQuickCampaign}
            loading={loadingAI}
            icon={Zap}
          >
            Generate Campaign
          </Button>
        </div>
      </div>
 
      {/* Bento stats grid */}
      <BentoGrid>
        <StatCard
          label="Total Followers"
          value="15,247"
          change={12.4}
          icon={Users}
          color="orange"
        />
        <StatCard
          label="Superfans (Top 1%)"
          value="152"
          change={8.1}
          icon={TrendingUp}
          color="purple"
        />
        <RevenueCard
          amount="$1,140"
          label="Revenue This Month"
          period="month"
          trend={34}
        />
        <StatCard
          label="Gigs Applied"
          value="47"
          change={22}
          icon={Music2}
          color="orange"
        />
 
        {/* Fan growth chart */}
        <BentoCard colSpan={3} rowSpan={2}>
          <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div
                  className="text-sm font-bold"
                  style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
                >
                  Fan & Revenue Growth
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#6B6B8A' }}>
                  Last 6 months
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: '#6B6B8A' }}>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF6B00' }} />
                  Fans
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#9B4FDE' }} />
                  Revenue
                </span>
              </div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockGrowthData}>
                  <defs>
                    <linearGradient id="fanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9B4FDE" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#9B4FDE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#6B6B8A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="fans" stroke="#FF6B00" strokeWidth={2} fill="url(#fanGrad)" dot={false} />
                  <Area type="monotone" dataKey="revenue" stroke="#9B4FDE" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </BentoCard>
 
        {/* Superfans list */}
        <BentoCard colSpan={1} rowSpan={2}>
          <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-sm font-bold"
                style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
              >
                Top Superfans
              </div>
              <button
                className="text-xs transition-colors"
                style={{ color: '#FF6B00' }}
                onClick={() => navigate('/superfans')}
              >
                View all
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {superfans.map((fan) => (
                <FanScoreCard key={fan.username} fan={fan} />
              ))}
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
 
      {/* AI Suggestions */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} style={{ color: '#FF6B00' }} />
          <span
            className="text-sm font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
          >
            AI Recommendations
          </span>
          <Badge variant="orange">Live</Badge>
        </div>
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer"
              style={{ background: '#12121A', border: '1px solid #2A2A3A' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,107,0,0.3)'
                e.currentTarget.style.background = '#1A1A26'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3A'
                e.currentTarget.style.background = '#12121A'
              }}
            >
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{
                  background:
                    s.priority === 'urgent'
                      ? '#EF4444'
                      : s.priority === 'high'
                      ? '#FF6B00'
                      : '#9B4FDE',
                }}
              />
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#F0F0FF' }}>
                  {s.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      s.priority === 'urgent' ? 'red' : s.priority === 'high' ? 'orange' : 'purple'
                    }
                  >
                    {s.priority}
                  </Badge>
                  <Badge variant="muted">{s.type}</Badge>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: '#6B6B8A', flexShrink: 0, marginTop: 2 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Trend Radar + global rankings, folded in from the v2 build */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TrendRadar />
        <Leaderboard />
      </div>
    </div>
  )
}
 