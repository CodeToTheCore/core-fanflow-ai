import { useState } from 'react'
import { TrendingUp, Users, DollarSign, Music2, BarChart3 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { BentoGrid, StatCard, BentoCard } from '../components/bento/BentoGrid'
 
const fanGrowthData = [
  { month: 'Oct', twitter: 5200, instagram: 3100 },
  { month: 'Nov', twitter: 6100, instagram: 3800 },
  { month: 'Dec', twitter: 7400, instagram: 4500 },
  { month: 'Jan', twitter: 8200, instagram: 5100 },
  { month: 'Feb', twitter: 9800, instagram: 5900 },
  { month: 'Mar', twitter: 10400, instagram: 6500 },
  { month: 'Apr', twitter: 10900, instagram: 7200 },
  { month: 'May', twitter: 11800, instagram: 7900 },
  { month: 'Jun', twitter: 9800, instagram: 5400 },
]
 
const revenueData = [
  { month: 'Jan', revenue: 320, gigs: 150, merch: 80, streaming: 90 },
  { month: 'Feb', revenue: 480, gigs: 200, merch: 120, streaming: 160 },
  { month: 'Mar', revenue: 610, gigs: 300, merch: 160, streaming: 150 },
  { month: 'Apr', revenue: 720, gigs: 350, merch: 200, streaming: 170 },
  { month: 'May', revenue: 890, gigs: 400, merch: 290, streaming: 200 },
  { month: 'Jun', revenue: 1140, gigs: 600, merch: 340, streaming: 200 },
]
 
const platformData = [
  { name: 'Twitter', value: 10900, color: '#1DA1F2' },
  { name: 'Instagram', value: 7200, color: '#E1306C' },
  { name: 'Spotify', value: 8400, color: '#1DB954' },
  { name: 'TikTok', value: 2100, color: '#FF0050' },
]
 
const engagementData = [
  { day: 'Mon', rate: 3.2 },
  { day: 'Tue', rate: 4.1 },
  { day: 'Wed', rate: 5.8 },
  { day: 'Thu', rate: 4.9 },
  { day: 'Fri', rate: 6.2 },
  { day: 'Sat', rate: 7.1 },
  { day: 'Sun', rate: 5.4 },
]
 
const topContent = [
  { title: 'Studio session reel', platform: 'Instagram', reach: 4200, engRate: '8.2%', type: 'Reel' },
  { title: 'New beat preview thread', platform: 'Twitter', reach: 3800, engRate: '6.7%', type: 'Thread' },
  { title: 'Behind the beat — vocal chops', platform: 'Instagram', reach: 3100, engRate: '5.9%', type: 'Post' },
  { title: 'Fan reaction compilation', platform: 'Twitter', reach: 2900, engRate: '5.1%', type: 'Thread' },
  { title: 'Sample pack announcement', platform: 'Instagram', reach: 2700, engRate: '4.8%', type: 'Story' },
]
 
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs space-y-1" style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}>
      <div className="font-semibold mb-1" style={{ color: '#F0F0FF', fontFamily: 'Syne, sans-serif' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? p.value.toLocaleString() : p.value}
          {p.name === 'rate' ? '%' : ''}
        </div>
      ))}
    </div>
  )
}
 
export default function Analytics() {
  const [period, setPeriod] = useState('6m')
 
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {['7d', '30d', '3m', '6m', '1y'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: period === p ? '#FF6B00' : '#1A1A26',
              color: period === p ? '#fff' : '#6B6B8A',
              border: `1px solid ${period === p ? '#FF6B00' : '#2A2A3A'}`,
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {p}
          </button>
        ))}
      </div>
 
      {/* Stats row */}
      <BentoGrid className="auto-rows-[140px]">
        <StatCard label="Total Reach" value="28.6K" change={18.2} icon={Users} color="orange" />
        <StatCard label="Avg Engagement" value="4.8%" change={0.6} icon={TrendingUp} color="purple" />
        <StatCard label="Total Revenue" value="$4,160" change={34} icon={DollarSign} color="orange" />
        <StatCard label="Gig Conversion" value="12%" change={5} icon={Music2} color="purple" />
      </BentoGrid>
 
      {/* Fan Growth Chart */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
              Fan Growth by Platform
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#6B6B8A' }}>Monthly follower growth across channels</div>
          </div>
          <div className="flex gap-3 text-xs" style={{ color: '#6B6B8A' }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#1DA1F2' }} />Twitter</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#E1306C' }} />Instagram</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={fanGrowthData}>
            <defs>
              <linearGradient id="twitterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1DA1F2" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#1DA1F2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E1306C" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#E1306C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: '#6B6B8A', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B6B8A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="twitter" name="Twitter" stroke="#1DA1F2" strokeWidth={2} fill="url(#twitterGrad)" dot={false} />
            <Area type="monotone" dataKey="instagram" name="Instagram" stroke="#E1306C" strokeWidth={2} fill="url(#igGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
 
      <div className="grid grid-cols-2 gap-5">
        {/* Revenue Breakdown */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
        >
          <div className="text-sm font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
            Revenue Breakdown
          </div>
          <div className="text-xs mb-4" style={{ color: '#6B6B8A' }}>By stream (gigs, merch, streaming)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData}>
              <XAxis dataKey="month" tick={{ fill: '#6B6B8A', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B6B8A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="gigs" name="Gigs" stackId="a" fill="#FF6B00" radius={[0,0,0,0]} />
              <Bar dataKey="merch" name="Merch" stackId="a" fill="#7B2FBE" />
              <Bar dataKey="streaming" name="Streaming" stackId="a" fill="#2A2A3A" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
 
        {/* Platform split pie */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
        >
          <div className="text-sm font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
            Audience by Platform
          </div>
          <div className="text-xs mb-4" style={{ color: '#6B6B8A' }}>Where your fans live</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {platformData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {platformData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span style={{ color: '#6B6B8A' }}>{p.name}</span>
                  </div>
                  <span style={{ color: '#F0F0FF', fontWeight: 600 }}>{p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      {/* Engagement rate by day */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
              Engagement Rate by Day of Week
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#6B6B8A' }}>Best days to post: <span style={{ color: '#FF6B00' }}>Friday & Saturday</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={engagementData} barSize={32}>
            <XAxis dataKey="day" tick={{ fill: '#6B6B8A', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B6B8A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" name="rate" radius={[6, 6, 0, 0]}>
              {engagementData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.rate === Math.max(...engagementData.map(d => d.rate)) ? '#FF6B00' : '#2A2A3A'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
 
      {/* Top content */}
      <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A2A3A' }}>
        <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}>
          Top Performing Content
        </div>
      </div>
      <table className="w-full fan-table">
        <thead>
          <tr>
            <th>Content</th>
            <th>Platform</th>
            <th>Type</th>
            <th>Reach</th>
            <th>Eng. Rate</th>
          </tr>
        </thead>
        <tbody>
          {topContent.map((c, i) => (
            <tr key={i}>
              <td style={{ color: '#F0F0FF' }}>{c.title}</td>
              <td style={{ color: '#6B6B8A' }}>{c.platform}</td>
              <td>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(123,47,190,0.15)', color: '#9B4FDE' }}
                >
                  {c.type}
                </span>
              </td>
              <td style={{ color: '#F0F0FF' }}>{c.reach.toLocaleString()}</td>
              <td style={{ color: '#22C55E', fontWeight: 600 }}>{c.engRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
}
