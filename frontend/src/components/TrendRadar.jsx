import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, ArrowRight, ExternalLink } from 'lucide-react'
import { oracleService } from '../services/oracleService'

/**
 * Trend Radar — folded in from the v2 build. Where that version took a static
 * `brief` prop, this pulls live headlines and the AI studio brief from
 * /api/oracle/brief.
 */
export default function TrendRadar() {
  const [brief, setBrief] = useState(null)
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState(null)

  useEffect(() => {
    let active = true
    oracleService
      .getBrief()
      .then((data) => {
        if (!active) return
        setBrief(data.brief)
        setTrends(data.trends || [])
        // Headlines can arrive without the AI step if OPENAI_API_KEY is unset.
        if (!data.brief && data.trends?.length) {
          setNote('Headlines live — add an OpenAI key for the studio brief.')
        }
      })
      .catch(() => active && setNote('Trend feed unavailable.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0a0a0a] border-2 border-brand-purple/30 p-8 rounded-[40px] glow-purple relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="animate-pulse p-2 bg-brand-purple rounded-full">
          <Radio size={20} className="text-white" />
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
          Trend Radar
        </h3>
      </div>

      <div className="space-y-4 text-gray-300 font-medium relative z-10">
        <p className="text-sm leading-relaxed border-l-2 border-brand-purple pl-4 italic whitespace-pre-line">
          {loading
            ? 'Analyzing global airplay and sync demand…'
            : brief || note || 'No trend data yet — check back after the next scan.'}
        </p>
      </div>

      {trends.length > 0 && (
        <div className="mt-6 space-y-2 relative z-10">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Sourced from</p>
          {trends.slice(0, 3).map((t) => (
            <a
              key={t.url}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 text-xs text-gray-400 hover:text-brand-purple transition-colors"
            >
              <ExternalLink size={12} className="mt-0.5 shrink-0" />
              <span className="line-clamp-1">{t.title}</span>
            </a>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setLoading(true)
          oracleService
            .getBrief(true)
            .then((d) => {
              setBrief(d.brief)
              setTrends(d.trends || [])
            })
            .finally(() => setLoading(false))
        }}
        className="mt-8 flex items-center gap-2 text-brand-purple font-bold hover:text-white transition-colors group relative z-10"
      >
        Refresh Brief
        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
      </button>

      {/* Decorative waveform */}
      <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
        <svg width="200" height="100" viewBox="0 0 200 100">
          <path
            d="M0 50 Q 25 10, 50 50 T 100 50 T 150 50 T 200 50"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>
    </motion.div>
  )
}
