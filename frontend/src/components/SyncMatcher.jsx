import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, CheckCircle2 } from 'lucide-react'
import { gigService } from '../services/gigService'

/**
 * Sync licensing matches — folded in from the v2 build. That version required a
 * `matches` prop and crashed without one; this fetches its own and accepts an
 * override.
 */
export default function SyncMatcher({ matches: provided }) {
  const [matches, setMatches] = useState(provided || [])
  const [loading, setLoading] = useState(!provided)

  useEffect(() => {
    if (provided) return
    let active = true
    gigService
      .getSyncMatches()
      .then((data) => active && setMatches(data.matches || []))
      .catch(() => active && setMatches([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [provided])

  return (
    <div className="p-6 bg-card-bg rounded-3xl border border-white/5 glow-purple">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black italic flex items-center gap-2 text-white">
          <Target className="text-brand-purple" /> SYNC MATCHES
        </h3>
        <span className="text-xs bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full font-bold">
          AI SCANNING LIVE
        </span>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-xs text-gray-500">Scanning sync opportunities…</p>}
        {!loading && matches.length === 0 && (
          <p className="text-xs text-gray-500">No sync matches open right now.</p>
        )}
        {matches.map((match, idx) => (
          <motion.div
            key={`${match.project}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{match.project}</p>
              <p className="text-xs text-gray-500 truncate">
                {match.category} • {match.budget}
              </p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-brand-orange text-black p-2 rounded-full shrink-0 ml-3">
              <CheckCircle2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
