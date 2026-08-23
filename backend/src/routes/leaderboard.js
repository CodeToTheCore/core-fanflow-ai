const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')
const { calculateIndieScore } = require('../services/rankingService')

// GET /api/leaderboard?genre=R&B&limit=10
router.get('/', auth, async (req, res, next) => {
  try {
    const { genre } = req.query
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50)

    // Revenue comes from campaigns, reach and engagement from fans. Both are
    // aggregated per artist before scoring so one query feeds the whole board.
    const { rows } = await query(
      `SELECT a.id,
              a.name,
              a.genre,
              COALESCE(c.revenue, 0)    AS revenue,
              COALESCE(f.followers, 0)  AS followers,
              COALESCE(f.engagement, 0) AS engagement
         FROM artists a
         LEFT JOIN (
           SELECT artist_id, SUM(revenue_generated) AS revenue
             FROM campaigns
            GROUP BY artist_id
         ) c ON c.artist_id = a.id
         LEFT JOIN (
           SELECT artist_id,
                  SUM(followers) AS followers,
                  CASE WHEN SUM(followers) > 0
                       THEN SUM(likes_given + comments_given + shares_given)::numeric
                            / SUM(followers)
                       ELSE 0 END AS engagement
             FROM fans
            GROUP BY artist_id
         ) f ON f.artist_id = a.id
        WHERE ($1::text IS NULL OR a.genre = $1)`,
      [genre || null]
    )

    const ranked = rows
      .map((r) => ({
        artistId: r.id,
        artist: r.name,
        genre: r.genre,
        revenue: Number(r.revenue),
        followers: Number(r.followers),
        engagement: Number(r.engagement),
        score: calculateIndieScore(r.revenue, r.followers, r.engagement),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((row, i) => ({
        ...row,
        rank: i + 1,
        isUser: row.artistId === req.artist.id,
      }))

    res.json({ leaderboard: ranked, count: ranked.length, genre: genre || 'all' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
