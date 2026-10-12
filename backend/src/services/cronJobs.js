const cron = require('node-cron')
const { runDailyMonitor } = require('./linkedinAgent')
const { query } = require('../db')
const emailService = require('./emailService')

let isRunning = false

/**
 * Start all scheduled jobs
 * Call this once when server starts
 */
function startCronJobs() {
  console.log('⏰ Starting FanFlow AI scheduled jobs...')

  // Daily LinkedIn scan — every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    await runLinkedInScan()
  })

  // Fan score refresh — every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    await refreshFanScores()
  })

  // Weekly performance report — every Monday at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    await sendWeeklyReports()
  })

  console.log('✅ Cron jobs scheduled:')
  console.log('   → LinkedIn scan: daily at 8:00 AM')
  console.log('   → Fan score refresh: every 6 hours')
  console.log('   → Weekly report: every Monday 9:00 AM')
}

/**
 * Run LinkedIn gig scan for all active artists
 */
async function runLinkedInScan() {
  if (isRunning) return
  isRunning = true

  try {
    console.log('🤖 Running daily LinkedIn scan...')

    // Get all active artists with ai_manager enabled
    const { rows: artists } = await query(
      `SELECT id, name, email, genre, location, twitter_handle FROM artists
       WHERE ai_manager = true`
    )

    for (const artist of artists) {
      try {
        const opportunities = await runDailyMonitor(artist)

        if (opportunities.length === 0) continue

        // Save new gigs to DB
        for (const opp of opportunities) {
          await query(
            `INSERT INTO gigs (type, title, venue, description, pay, pay_amount, location, apply_url, source, match_score, status, deadline)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'open',$11)
             ON CONFLICT DO NOTHING`,
            [
              opp.type, opp.title, opp.venue, opp.description,
              opp.pay, opp.pay_amount, opp.location, opp.apply_url,
              opp.source, opp.match_score, opp.deadline,
            ]
          ).catch(() => {})
        }

        // Save notifications for artist
        const topOpps = opportunities.slice(0, 3)
        for (const opp of topOpps) {
          await query(
            `INSERT INTO notifications (artist_id, type, title, message, data)
             VALUES ($1, 'gig_found', $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [
              artist.id,
              `New gig match: ${opp.title}`,
              `${opp.venue} is looking for talent. ${opp.pay} — ${opp.match_score}% match for you.`,
              JSON.stringify(opp),
            ]
          ).catch(() => {})
        }

        // Send email alert if high-value opps found
        const highValue = opportunities.filter(o => o.match_score >= 85 && o.pay_amount >= 500)
        if (highValue.length > 0 && artist.email) {
          await emailService.sendGigAlert({
            to: artist.email,
            artistName: artist.name,
            gigTitle: highValue[0].title,
            venue: highValue[0].venue,
            pay: highValue[0].pay,
            deadline: highValue[0].deadline?.toLocaleDateString() || '7 days',
          }).catch(() => {})
        }

        console.log(`✅ ${artist.name}: found ${opportunities.length} opportunities, notified about ${topOpps.length}`)
      } catch (err) {
        console.error(`Error scanning for ${artist.name}:`, err.message)
      }
    }
  } finally {
    isRunning = false
  }
}

/**
 * Refresh fan engagement scores
 */
async function refreshFanScores() {
  try {
    // Boost scores for fans with recent activity
    await query(`
      UPDATE fans
      SET score = LEAST(100, score + 2),
          updated_at = NOW()
      WHERE last_active > NOW() - INTERVAL '7 days'
        AND score < 95
    `)

    // Decay scores for inactive fans
    await query(`
      UPDATE fans
      SET score = GREATEST(10, score - 1),
          updated_at = NOW()
      WHERE last_active < NOW() - INTERVAL '30 days'
        AND score > 10
    `)

    // Re-tier fans based on new scores
    await query(`
      UPDATE fans SET tier = CASE
        WHEN score >= 80 THEN 'superfan'
        WHEN score >= 60 THEN 'loyal'
        ELSE 'engaged'
      END
    `)

    console.log('✅ Fan scores refreshed')
  } catch (err) {
    console.error('Fan score refresh error:', err.message)
  }
}

/**
 * Send weekly performance report to all artists
 */
async function sendWeeklyReports() {
  try {
    const { rows: artists } = await query(
      `SELECT a.id, a.name, a.email,
        (SELECT COUNT(*) FROM fans WHERE artist_id = a.id) as fan_count,
        (SELECT COUNT(*) FROM applications WHERE artist_id = a.id AND applied_at > NOW() - INTERVAL '7 days') as apps_this_week,
        (SELECT COALESCE(SUM(revenue_generated),0) FROM campaigns WHERE artist_id = a.id AND created_at > NOW() - INTERVAL '7 days') as revenue_this_week
       FROM artists a
       WHERE a.email IS NOT NULL`
    )

    for (const artist of artists) {
      if (!artist.email) continue
      console.log(`Sending weekly report to ${artist.name}`)
      // Email sending would go here
    }
  } catch (err) {
    console.error('Weekly report error:', err.message)
  }
}

// Manual trigger for testing
async function triggerNow() {
  console.log('🔧 Manual trigger — running LinkedIn scan now...')
  await runLinkedInScan()
}

module.exports = { startCronJobs, triggerNow, runLinkedInScan }
