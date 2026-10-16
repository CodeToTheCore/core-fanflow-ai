import { useEffect, useState } from 'react'
import { isDemoMode, startDemoSession } from '../../services/demo'
import { useArtistStore } from '../../store/ArtistStore'

// Shown on every page of the public demo so visitors know what they're looking at
export default function DemoBanner() {
  const token = useArtistStore((s) => s.token)
  const [ready, setReady] = useState(Boolean(token))

  // Someone opened a page directly (for example /gigs): sign them in as the sample artist
  useEffect(() => {
    if (isDemoMode && !token) startDemoSession().then(() => window.location.reload())
    else setReady(true)
  }, [token])

  if (!isDemoMode || !ready) return null
  return (
    <div
      role="status"
      className="px-4 py-2 text-xs text-center"
      style={{ background: '#1F1408', color: '#FFB27A', borderBottom: '1px solid #3A2410', fontFamily: 'DM Sans, sans-serif' }}
    >
      🔒 <strong>Demo mode.</strong> Sample data only. AI answers are pre-written, and sending,
      posting, connecting accounts, and auto-applying are turned off.
    </div>
  )
}
