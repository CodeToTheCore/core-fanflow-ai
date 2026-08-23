import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp } from 'lucide-react'
import { leaderboardService } from '../services/leaderboardService'

/**
 * Global indie-score rankings — folded in from the v2 build, where the rows
 * were hardcoded. Scores come from /api/leaderboard, which derives them from
 * campaign revenue against fan reach and engagement.
 */

const LeaderboardRow = ({ rank, artist, genre, score, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center justify-between p-4 mb-2 rounded-2xl border ${
      isUser ? 'bg-brand-purple/20 border-brand-purple' : 'bg-white/5 border-white/5'
    }`}
  >
    <div className="flex items-center gap-4">
      <span className="font-mono text-gray-500 w-6">{rank}</span>
      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-orange to-brand-purple flex items-center justify-center font-bold text-white">
        {(artist || '?')[0]}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">
          {artist} {isUser && '(You)'}
        </h4>
        <p className="text-[10px] text-gray-500 uppercase">{genre || 'Unsigned'}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-brand-orange font-black text-lg">{score}</div>
      <p className="text-[8px] text-gray-500 uppercase tracking-widest">Indie Score</p>
    </div>
  </motion.div>
)

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    leaderboardService
      .getLeaderboard({ limit: 10 })
      .then((data) => active && setRows(data.leaderboard || []))
      .catch(() => active && setRows([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="bg-card-bg p-8 rounded-[40px] border border-white/5 h-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black italic flex items-center gap-2 text-white">
          <Trophy className="text-brand-orange" /> GLOBAL RANKINGS
        </h3>
        <TrendingUp className="text-gray-600" size={20} />
      </div>

      <div className="space-y-1">
        {loading && <p className="text-xs text-gray-500">Loading rankings…</p>}
        {!loading && rows.length === 0 && (
          <p className="text-xs text-gray-500">
            No ranked artists yet. Scores appear once campaigns and fans are tracked.
          </p>
        )}
        {rows.map((item) => (
          <LeaderboardRow key={item.artistId} {...item} />
        ))}
      </div>

      <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors">
        VIEW FULL GENRE RANKINGS
      </button>
    </div>
  )
}
