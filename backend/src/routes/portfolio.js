const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')

// GET /api/portfolio — get artist portfolio
router.get('/', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM portfolios WHERE artist_id = $1 LIMIT 1',
      [req.artist.id]
    )

    if (!rows.length) {
      return res.json({
        artist_id: req.artist.id,
        bio: '',
        shortBio: '',
        pressQuote: '',
        influences: [],
        achievements: [],
        links: {},
        isPublic: true,
      })
    }

    const p = rows[0]
    res.json({
      ...p,
      influences: p.influences || [],
      achievements: p.achievements || [],
      links: p.links || {},
    })
  } catch (err) { next(err) }
})

// POST /api/portfolio — save/update portfolio
router.post('/', auth, async (req, res, next) => {
  try {
    const {
      bio, shortBio, pressQuote,
      influences, achievements, links, isPublic,
    } = req.body

    const { rows } = await query(
      `INSERT INTO portfolios (artist_id, bio, short_bio, press_quote, influences, achievements, links, is_public)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (artist_id) DO UPDATE SET
         bio = $2, short_bio = $3, press_quote = $4,
         influences = $5, achievements = $6, links = $7,
         is_public = $8, updated_at = NOW()
       RETURNING *`,
      [
        req.artist.id,
        bio || '',
        shortBio || '',
        pressQuote || '',
        JSON.stringify(influences || []),
        JSON.stringify(achievements || []),
        JSON.stringify(links || {}),
        isPublic !== false,
      ]
    )

    res.json({ success: true, portfolio: rows[0] })
  } catch (err) { next(err) }
})

// GET /api/portfolio/public/:artistId — public view
router.get('/public/:artistId', async (req, res, next) => {
  try {
    const [portfolioRes, mediaRes, artistRes] = await Promise.all([
      query('SELECT * FROM portfolios WHERE artist_id = $1 AND is_public = true', [req.params.artistId]),
      query('SELECT * FROM media WHERE artist_id = $1 AND is_public = true ORDER BY created_at DESC LIMIT 20', [req.params.artistId]),
      query('SELECT name, genre, location FROM artists WHERE id = $1', [req.params.artistId]),
    ])

    res.json({
      artist: artistRes.rows[0] || {},
      portfolio: portfolioRes.rows[0] || {},
      media: mediaRes.rows || [],
    })
  } catch (err) { next(err) }
})

module.exports = router;
