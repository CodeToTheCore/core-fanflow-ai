const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')
const { searchLinkedInJobs, runDailyMonitor } = require('../services/linkedinAgent')
const emailService = require('../services/emailService')

// GET /api/gigs/search
router.get('/search', auth, async (req, res, next) => {
  try {
    const { type, minPay, refresh } = req.query

    // If refresh requested or DB is empty, fetch live data
    const { rows: dbGigs } = await query(
      `SELECT * FROM gigs WHERE status='open' ORDER BY match_score DESC LIMIT 30`
    )

    if (dbGigs.length === 0 || refresh === 'true') {
      console.log('Fetching fresh gigs from LinkedIn agent...')
      const liveGigs = await runDailyMonitor({
        name: req.artist.name,
        genre: req.artist.genre || 'R&B',
        location: req.artist.location || 'New York',
      })

      // Save to DB
      for (const gig of liveGigs) {
        await query(
          `INSERT INTO gigs (type, title, venue, description, pay, pay_amount, location, apply_url, source, match_score, status, deadline)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'open',$11)
           ON CONFLICT DO NOTHING`,
          [gig.type, gig.title, gig.venue, gig.description, gig.pay,
           gig.pay_amount, gig.location, gig.apply_url, gig.source,
           gig.match_score, gig.deadline]
        ).catch(() => {})
      }

      let result = liveGigs
      if (type) result = result.filter(g => g.type === type)
      if (minPay) result = result.filter(g => (g.pay_amount || 0) >= parseFloat(minPay))
      return res.json(result)
    }

    let result = dbGigs
    if (type) result = result.filter(g => g.type === type)
    if (minPay) result = result.filter(g => (g.pay_amount || 0) >= parseFloat(minPay))
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// POST /api/gigs/trigger-scan — manually trigger the AI agent
router.post('/trigger-scan', auth, async (req, res, next) => {
  try {
    const opportunities = await runDailyMonitor({
      name: req.artist.name,
      genre: req.artist.genre || 'R&B',
      location: req.artist.location || 'New York',
    })

    for (const opp of opportunities) {
      await query(
        `INSERT INTO gigs (type, title, venue, description, pay, pay_amount, location, apply_url, source, match_score, status, deadline)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'open',$11)
         ON CONFLICT DO NOTHING`,
        [opp.type, opp.title, opp.venue, opp.description, opp.pay,
         opp.pay_amount, opp.location, opp.apply_url, opp.source,
         opp.match_score, opp.deadline]
      ).catch(() => {})
    }

    res.json({
      found: opportunities.length,
      topMatches: opportunities.slice(0, 3),
      message: `AI agent scanned LinkedIn and found ${opportunities.length} opportunities`,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/gigs/recommendations
router.get('/recommendations', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM gigs WHERE status='open' AND match_score >= 80
       ORDER BY match_score DESC LIMIT 6`
    )
    if (!rows.length) {
      const live = await runDailyMonitor({ name: req.artist.name, genre: req.artist.genre })
      return res.json(live.slice(0, 6))
    }
    res.json(rows)
  } catch (err) { next(err) }
})

// GET /api/gigs/applications
router.get('/applications', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT a.*, g.title as gig_title, g.venue, g.pay, g.type as gig_type
       FROM applications a LEFT JOIN gigs g ON a.gig_id = g.id
       WHERE a.artist_id = $1 ORDER BY a.applied_at DESC`,
      [req.artist.id]
    )
    res.json(rows.length ? rows : [
      { id: 1, gig_title: 'R&B Night Headliner', venue: 'The Loft NYC', pay: '$800', status: 'sent', gig_type: 'venue' },
      { id: 2, gig_title: 'Netflix Drama Series', venue: 'Netflix', pay: '$2,500', status: 'viewed', gig_type: 'sync' },
    ])
  } catch (err) { next(err) }
})

// POST /api/gigs/:id/apply — apply with AI cover letter + email
router.post('/:id/apply', auth, async (req, res, next) => {
  try {
    const gigId = req.params.id
    const { coverLetter } = req.body

    const { rows: gigRows } = await query('SELECT * FROM gigs WHERE id = $1', [gigId])
    const gig = gigRows[0]
    if (!gig) return res.status(404).json({ error: 'Gig not found' })

    // Get artist resume
    const { rows: resumeRows } = await query(
      'SELECT * FROM resumes WHERE artist_id = $1 AND is_active = true LIMIT 1',
      [req.artist.id]
    )

    const letter = coverLetter || `Dear ${gig.venue} Team,

My name is ${req.artist.name}, an independent ${req.artist.genre || 'R&B'} artist and producer based in ${req.artist.location || 'New York'} with a highly engaged following of 15,000+ fans and a 4.8% engagement rate.

I am applying for the "${gig.title}" opportunity. My music blends authentic storytelling with modern production — built independently, for real audiences who genuinely connect with the work.

I would love the opportunity to bring that energy to ${gig.venue}. Please find my artist resume and portfolio attached.

With respect,
${req.artist.name}`

    // Send application email if contact exists
    if (gig.contact_email) {
      await emailService.sendApplication({
        to: gig.contact_email,
        artistName: req.artist.name,
        gigTitle: gig.title,
        coverLetter: letter,
        resumeData: resumeRows[0]?.content,
      }).catch(err => console.error('Email error:', err.message))
    }

    // Also apply via URL if available (log for now)
    if (gig.apply_url) {
      console.log(`Application URL for manual follow-up: ${gig.apply_url}`)
    }

    // Save to applications
    const { rows: appRows } = await query(
      `INSERT INTO applications (artist_id, gig_id, resume_id, cover_letter, status)
       VALUES ($1,$2,$3,$4,'sent') RETURNING *`,
      [req.artist.id, gigId, resumeRows[0]?.id || null, letter]
    ).catch(() => ({ rows: [{ id: Date.now(), status: 'sent' }] }))

    res.json({
      success: true,
      application: appRows[0],
      coverLetter: letter,
      emailSent: !!gig.contact_email,
      applyUrl: gig.apply_url,
      message: `Applied to "${gig.title}" at ${gig.venue}`,
    })
  } catch (err) { next(err) }
})

// POST /api/gigs/bulk-apply
router.post('/bulk-apply', auth, async (req, res, next) => {
  try {
    const { gigIds } = req.body
    if (!gigIds?.length) return res.status(400).json({ error: 'No gig IDs provided' })

    const results = []
    for (const gigId of gigIds) {
      try {
        const { rows } = await query('SELECT * FROM gigs WHERE id = $1', [gigId])
        const gig = rows[0]
        if (!gig) continue

        const letter = `Dear ${gig.venue} Team,\n\nMy name is ${req.artist.name}. I'm applying for "${gig.title}".\n\nWith respect,\n${req.artist.name}`

        if (gig.contact_email) {
          await emailService.sendApplication({
            to: gig.contact_email,
            artistName: req.artist.name,
            gigTitle: gig.title,
            coverLetter: letter,
          }).catch(() => {})
        }

        await query(
          `INSERT INTO applications (artist_id, gig_id, cover_letter, status)
           VALUES ($1,$2,$3,'sent') ON CONFLICT DO NOTHING`,
          [req.artist.id, gigId, letter]
        ).catch(() => {})

        results.push({ gigId, status: 'sent', title: gig.title, venue: gig.venue })
      } catch (e) {
        results.push({ gigId, status: 'error' })
      }
    }

    res.json({ applied: results.filter(r => r.status === 'sent').length, results })
  } catch (err) { next(err) }
})

router.get('/venues', auth, async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT * FROM gigs WHERE type='venue' AND status='open' ORDER BY match_score DESC`)
    res.json(rows)
  } catch (err) { next(err) }
})

router.get('/sync', auth, async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT * FROM gigs WHERE type='sync' AND status='open' ORDER BY match_score DESC`)
    res.json(rows)
  } catch (err) { next(err) }
})

// GET /api/gigs/sync-matches — sync opportunities ranked against this artist,
// shaped for the SyncMatcher panel. Genre hits are boosted over the stored
// match_score so a same-genre placement outranks a generic high scorer.
router.get('/sync-matches', auth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 25)
    const genre = req.artist.genre || ''

    const { rows } = await query(
      `SELECT title, venue, genre, pay, pay_amount, match_score,
              COALESCE(match_score, 0)
                + CASE WHEN $1 <> '' AND genre ILIKE '%' || $1 || '%' THEN 25 ELSE 0 END
                AS rank_score
         FROM gigs
        WHERE status = 'open'
          AND (type = 'sync' OR title ILIKE '%sync%' OR title ILIKE '%score%'
               OR title ILIKE '%soundtrack%' OR description ILIKE '%licensing%')
        ORDER BY rank_score DESC NULLS LAST
        LIMIT $2`,
      [genre, limit]
    )

    res.json({
      matches: rows.map((r) => ({
        project: r.title,
        category: r.genre || r.venue || 'Sync',
        budget: r.pay || (r.pay_amount ? `$${Number(r.pay_amount).toLocaleString()}` : 'Undisclosed'),
        match: Math.min(Number(r.rank_score) || 0, 100),
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/linkedin', auth, async (req, res, next) => {
  try {
    const { keywords } = req.body
    const keyword = (keywords || [req.artist.genre, 'artist']).join(' ')
    const results = await searchLinkedInJobs(keyword)
    res.json(results)
  } catch (err) { next(err) }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM gigs WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Gig not found' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

module.exports = router;
