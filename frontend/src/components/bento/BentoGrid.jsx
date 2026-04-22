import { clsx } from 'clsx'
 
export function BentoGrid({ children, className }) {
  return (
    <div
      className={clsx(
        'grid grid-cols-4 gap-4 auto-rows-[180px]',
        className
      )}
    >
      {children}
    </div>
  )
}
 
export function BentoCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
  glow = null, // 'orange' | 'purple' | null
  onClick,
}) {
  const glowStyle =
    glow === 'orange'
      ? '0 0 40px rgba(255,107,0,0.15)'
      : glow === 'purple'
      ? '0 0 40px rgba(123,47,190,0.15)'
      : '0 4px 24px rgba(0,0,0,0.3)'
 
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative rounded-2xl overflow-hidden transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        background: '#1A1A26',
        border: '1px solid #2A2A3A',
        boxShadow: glowStyle,
      }}
      onMouseEnter={(e) => {
        if (glow === 'orange') {
          e.currentTarget.style.boxShadow = '0 0 60px rgba(255,107,0,0.25), 0 8px 32px rgba(0,0,0,0.4)'
          e.currentTarget.style.borderColor = 'rgba(255,107,0,0.3)'
        } else if (glow === 'purple') {
          e.currentTarget.style.boxShadow = '0 0 60px rgba(123,47,190,0.25), 0 8px 32px rgba(0,0,0,0.4)'
          e.currentTarget.style.borderColor = 'rgba(123,47,190,0.3)'
        } else {
          e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = glowStyle
        e.currentTarget.style.borderColor = '#2A2A3A'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </div>
  )
}
 
export function StatCard({ label, value, change, icon: Icon, color = 'orange', colSpan = 1 }) {
  const isPositive = change >= 0
  const colorMap = {
    orange: '#FF6B00',
    purple: '#7B2FBE',
    green: '#22C55E',
    blue: '#3B82F6',
  }
  const accent = colorMap[color] || colorMap.orange
 
  return (
    <BentoCard colSpan={colSpan} glow={color === 'orange' ? 'orange' : color === 'purple' ? 'purple' : null}>
      <div className="p-5 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}20` }}
          >
            {Icon && <Icon size={18} style={{ color: accent }} />}
          </div>
          {change !== undefined && (
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                background: isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: isPositive ? '#22C55E' : '#EF4444',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              {isPositive ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <div>
          <div
            className="text-3xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
          >
            {value}
          </div>
          <div className="text-sm mt-1" style={{ color: '#6B6B8A' }}>
            {label}
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
 
export function FanScoreCard({ fan }) {
  const score = fan?.score || 0
  const percentage = Math.min((score / 100) * 100, 100)
 
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{ background: '#12121A', cursor: 'pointer' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#1E1E2E')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#12121A')}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #FF6B00, #7B2FBE)',
          color: '#fff',
          fontFamily: 'Syne, sans-serif',
        }}
      >
        {fan?.username?.[0]?.toUpperCase() || 'F'}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold truncate"
          style={{ color: '#F0F0FF', fontFamily: 'DM Sans, sans-serif' }}
        >
          @{fan?.username}
        </div>
        <div className="progress-bar mt-1">
          <div
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div
        className="text-sm font-bold flex-shrink-0"
        style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}
      >
        {score}
      </div>
    </div>
  )
}
 
export function RevenueCard({ amount, label, period, trend }) {
  return (
    <BentoCard colSpan={2} glow="orange">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(circle at 80% 50%, #FF6B00, transparent 60%)',
        }}
      />
      <div className="relative p-6 h-full flex flex-col justify-between">
        <div
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}
        >
          {label}
        </div>
        <div>
          <div
            className="text-4xl font-bold"
            style={{
              fontFamily: 'Syne, sans-serif',
              background: 'linear-gradient(135deg, #FF6B00, #FF8C38)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {amount}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
            >
              +{trend}%
            </span>
            <span className="text-xs" style={{ color: '#6B6B8A' }}>
              vs last {period}
            </span>
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
 