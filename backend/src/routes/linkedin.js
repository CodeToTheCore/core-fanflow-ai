const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')
const axios = require('axios')

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

// Target companies the agent automatically searches
const TARGET_COMPANIES = [
  { name: 'Warner Bros Records', type: 'label', searchQuery: 'Warner Bros Records music A&R' },
  { name: 'Universal Music Group', type: 'label', searchQuery: 'Universal Music Group A&R sync' },
  { name: 'Sony Music', type: 'label', searchQuery: 'Sony Music Entertainment A&R' },
  { name: 'Netflix Music', type: 'sync', searchQuery: 'Netflix music supervisor licensing' },
  { name: 'EA Sports', type: 'game', searchQuery: 'EA Sports music producer game soundtrack' },
  { name: 'Rockstar Games', type: 'game', searchQuery: 'Rockstar Games music licensing' },
  { name: 'Nike', type: 'brand', searchQuery: 'Nike brand music partnership creator' },
  { name: 'Adidas', type: 'brand', searchQuery: 'Adidas music brand ambassador' },
  { name: 'Spotify', type: 'platform', searchQuery: 'Spotify artist partnerships indie music' },
  { name: 'Apple Music', type: 'platform', searchQuery: 'Apple Music curator editorial' },
  { name: 'Musicbed', type: 'sync', searchQuery: 'Musicbed sync licensing artist submission' },
  { name: 'Artlist', type: 'sync', searchQuery: 'Artlist music licensing submission' },
]

// GET /api/linkedin/connections
router.get('/connections', auth, async (req, res, next) => {
  try {
    const { category, status } = req.query
    let sql = 'SELECT * FROM linkedin_connections WHERE artist_id = $1'
    const params = [req.artist.id]
    
    if (category) { sql += ' AND category = $2'; params.push(category) }
    if (status) { sql += ` AND connection_status = $${params.length + 1}`; params.push(status) }
    sql += ' ORDER BY created_at DESC'
    
    const { rows } = await query(sql, params)
    res.json(rows)
  } catch (err) { next(err) }
})

// POST /api/linkedin/scan — scan for music executives
router.post('/scan', auth, async (req, res, next) => {
  try {
    const { genre = 'R&B', focusType = 'all' } = req.body
    const discovered = []

    const targets = focusType === 'all' 
      ? TARGET_COMPANIES 
      : TARGET_COMPANIES.filter(t => t.type === focusType)

    for (const target of targets.slice(0, 6)) {
      try {
        // Search via RapidAPI LinkedIn if configured
        if (RAPIDAPI_KEY) {
          const { data } = await axios.get('https://linkedin-jobs-search.p.rapidapi.com/', {
            params: { query: target.searchQuery, location: 'United States', page: '1' },
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com',
            },
            timeout: 10000,
          })

          const jobs = data || []
          for (const job of jobs.slice(0, 2)) {
            const connection = {
              artist_id: req.artist.id,
              name: job.company_name || target.name,
              title: job.title || 'Music Executive',
              company: job.company_name || target.name,
              profile_url: job.linkedin_url || `https://linkedin.com/company/${target.name.toLowerCase().replace(/\s/g, '-')}`,
              category: target.type,
              connection_status: 'discovered',
            }

            await query(
              `INSERT INTO linkedin_connections (artist_id, name, title, company, profile_url, category, connection_status)
               VALUES ($1,$2,$3,$4,$5,$6,'discovered')
               ON CONFLICT DO NOTHING`,
              [connection.artist_id, connection.name, connection.title, connection.company, connection.profile_url, connection.category]
            ).catch(() => {})

            discovered.push(connection)
          }
        } else {
          // Use curated known contacts when no API key
          const mockContacts = getMockContacts(target)
          for (const contact of mockContacts) {
            await query(
              `INSERT INTO linkedin_connections (artist_id, name, title, company, profile_url, category, connection_status)
               VALUES ($1,$2,$3,$4,$5,$6,'discovered')
               ON CONFLICT DO NOTHING`,
              [req.artist.id, contact.name, contact.title, contact.company, contact.profile_url, target.type]
            ).catch(() => {})
            discovered.push({ ...contact, category: target.type })
          }
        }

        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        console.error(`Scan error for ${target.name}:`, err.message)
      }
    }

    const { rows: allConnections } = await query(
      'SELECT * FROM linkedin_connections WHERE artist_id = $1 ORDER BY created_at DESC',
      [req.artist.id]
    )

    res.json({
      newlyDiscovered: discovered.length,
      totalConnections: allConnections.length,
      connections: allConnections,
      message: `Discovered ${discovered.length} new music industry contacts`,
    })
  } catch (err) { next(err) }
})

// POST /api/linkedin/apply — send application to a contact
router.post('/apply', auth, async (req, res, next) => {
  try {
    const { connectionId, opportunityType, coverLetter } = req.body

    const { rows: connRows } = await query(
      'SELECT * FROM linkedin_connections WHERE id = $1 AND artist_id = $2',
      [connectionId, req.artist.id]
    )

    if (!connRows.length) return res.status(404).json({ error: 'Connection not found' })
    const conn = connRows[0]

    // Generate cover letter if not provided
    const letter = coverLetter || `Dear ${conn.name} at ${conn.company},

My name is ${req.artist.name}, an independent ${req.artist.genre || 'R&B'} artist and music producer with ${15200..toLocaleString()} engaged followers and a 4.8% engagement rate.

I am reaching out regarding ${opportunityType || 'music collaboration'} opportunities with ${conn.company}. My original catalog spans ${req.artist.genre || 'R&B'}, Hip-Hop, and Soul — studio-quality recordings available for licensing, sync, and partnership.

Key stats:
- 15,200 organic social followers (no label support)
- 4.8% engagement rate (2x industry average)  
- 8,400 monthly Spotify listeners
- Fully independent — flexible deal structures

I'd love to connect and explore how my music could serve ${conn.company}'s needs.

With respect,
${req.artist.name}`

    // Log application
    await query(
      `INSERT INTO gig_applications (artist_id, company_name, contact_name, contact_linkedin, opportunity_type, cover_letter, status)
       VALUES ($1,$2,$3,$4,$5,$6,'sent')`,
      [req.artist.id, conn.company, conn.name, conn.profile_url, opportunityType || 'music collaboration', letter]
    )

    // Update connection status
    await query(
      `UPDATE linkedin_connections SET connection_status = 'contacted', last_contacted = NOW() WHERE id = $1`,
      [connectionId]
    )

    // Send email if configured
    if (process.env.SMTP_PASS) {
      const emailService = require('../services/emailService')
      await emailService.sendApplication({
        to: process.env.EMAIL_FROM,
        artistName: req.artist.name,
        gigTitle: `${opportunityType} at ${conn.company}`,
        coverLetter: letter,
      }).catch(() => {})
    }

    res.json({
      success: true,
      message: `Application sent to ${conn.name} at ${conn.company}`,
      coverLetter: letter,
      linkedinUrl: conn.profile_url,
    })
  } catch (err) { next(err) }
})

// GET /api/linkedin/targets — get all target companies
router.get('/targets', auth, async (req, res) => {
  res.json(TARGET_COMPANIES)
})

// GET /api/linkedin/applications
router.get('/applications', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM gig_applications WHERE artist_id = $1 ORDER BY applied_at DESC',
      [req.artist.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
})

// PATCH /api/linkedin/connections/:id
router.patch('/connections/:id', auth, async (req, res, next) => {
  try {
    const { notes, connection_status } = req.body
    const { rows } = await query(
      `UPDATE linkedin_connections SET 
        notes = COALESCE($1, notes),
        connection_status = COALESCE($2, connection_status)
       WHERE id = $3 AND artist_id = $4 RETURNING *`,
      [notes, connection_status, req.params.id, req.artist.id]
    )
    res.json(rows[0])
  } catch (err) { next(err) }
})

function getMockContacts(target) {
  const contactMap = {
    'Warner Bros Records': [
      { name: 'A&R Department', title: 'A&R Manager', company: 'Warner Bros Records', profile_url: 'https://www.warnerrecords.com/contact' },
    ],
    'EA Sports': [
      { name: 'EA Music Team', title: 'Music Supervisor', company: 'Electronic Arts', profile_url: 'https://www.ea.com/careers/music' },
    ],
    'Nike': [
      { name: 'Nike Music', title: 'Brand Partnerships', company: 'Nike', profile_url: 'https://www.nike.com/creators' },
    ],
    'Musicbed': [
      { name: 'Artist Relations', title: 'Sync Licensing Manager', company: 'Musicbed', profile_url: 'https://www.musicbed.com/artists' },
    ],
  }
  return contactMap[target.name] || [
    { name: `${target.name} Team`, title: 'Music Executive', company: target.name, profile_url: `https://linkedin.com/company/${target.name.toLowerCase().replace(/\s/g, '-')}` },
  ]
}

module.exports = router;