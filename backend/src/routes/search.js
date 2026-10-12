const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')

// GET /api/search?q=keyword — global search across all data
router.get('/', auth, async (req, res, next) => {
  try {
    const { q, type } = req.query
    if (!q || q.trim().length < 2) {
      return res.json({ fans: [], gigs: [], campaigns: [], media: [] })
    }

    const term = `%${q.toLowerCase()}%`
    const artistId = req.artist.id

    const [fans, gigs, campaigns, media] = await Promise.all([
      // Search fans
      type && type !== 'fans' ? { rows: [] } :
      query(
        `SELECT id, username, platform, score, tier FROM fans
         WHERE artist_id = $1 AND LOWER(username) LIKE $2
         ORDER BY score DESC LIMIT 5`,
        [artistId, term]
      ),

      // Search gigs
      type && type !== 'gigs' ? { rows: [] } :
      query(
        `SELECT id, title, venue, pay, type, match_score FROM gigs
         WHERE status = 'open'
         AND (LOWER(title) LIKE $1 OR LOWER(venue) LIKE $1 OR LOWER(description) LIKE $1)
         ORDER BY match_score DESC LIMIT 5`,
        [term]
      ),

      // Search campaigns
      type && type !== 'campaigns' ? { rows: [] } :
      query(
        `SELECT id, type, status, revenue_generated FROM campaigns
         WHERE artist_id = $1
         AND (LOWER(type) LIKE $2 OR LOWER(caption) LIKE $2)
         ORDER BY created_at DESC LIMIT 5`,
        [artistId, term]
      ),

      // Search media
      type && type !== 'media' ? { rows: [] } :
      query(
        `SELECT id, title, type, url, album_name FROM media
         WHERE artist_id = $1
         AND (LOWER(title) LIKE $2 OR LOWER(album_name) LIKE $2)
         ORDER BY created_at DESC LIMIT 5`,
        [artistId, term]
      ),
    ])

    res.json({
      fans: fans.rows || [],
      gigs: gigs.rows || [],
      campaigns: campaigns.rows || [],
      media: media.rows || [],
      total: (fans.rows?.length || 0) + (gigs.rows?.length || 0) +
             (campaigns.rows?.length || 0) + (media.rows?.length || 0),
    })
  } catch (err) { next(err) }
})

module.exports = router
