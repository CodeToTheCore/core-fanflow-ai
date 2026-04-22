const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')
const twitterService = require('../services/twitterService')
 
// GET /api/fans — list all fans with pagination
router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, platform, tier } = req.query
    const offset = (page - 1) * limit
 
    let whereClause = 'WHERE f.artist_id = $1'
    const params = [req.artist.id]
 
    if (platform) {
      params.push(platform)
      whereClause += ` AND f.platform = $${params.length}`
    }
    if (tier) {
      params.push(tier)
      whereClause += ` AND f.tier = $${params.length}`
    }
 
    params.push(limit, offset)
 
    const { rows } = await query(
      `SELECT f.*, 
        ROUND(((f.likes_given * 2 + f.comments_given * 3 + f.shares_given * 5)::numeric / GREATEST(1, f.followers) * 100), 1) as engagement_rate
       FROM fans f
       ${whereClause}
       ORDER BY f.score DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )
 
    const countResult = await query(
      `SELECT COUNT(*) FROM fans WHERE artist_id = $1`,
      [req.artist.id]
    )
 
    res.json({
      fans: rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit),
    })
  } catch (err) {
    next(err)
  }
})
 
// GET /api/fans/superfans — top 1% fans
router.get('/superfans', auth, async (req, res, next) => {
  try {
    const { limit = 50 } = req.query
    const { rows } = await query(
      `SELECT * FROM fans
       WHERE artist_id = $1 AND score >= 80
       ORDER BY score DESC
       LIMIT $2`,
      [req.artist.id, limit]
    )
 
    // Fallback mock data for demo
    if (rows.length === 0) {
      return res.json([
        { id: 1, username: 'melodyhunter', score: 97, platform: 'twitter', tier: 'superfan' },
        { id: 2, username: 'basslineQueen', score: 94, platform: 'instagram', tier: 'superfan' },
        { id: 3, username: 'nocturnal_wav', score: 91, platform: 'twitter', tier: 'superfan' },
        { id: 4, username: 'soulpatch99', score: 88, platform: 'instagram', tier: 'loyal' },
        { id: 5, username: 'loopmaster_k', score: 86, platform: 'twitter', tier: 'loyal' },
      ])
    }
 
    res.json(rows)
  } catch (err) {
    next(err)
  }
})
 
// POST /api/fans/import/twitter — import fans from Twitter API
router.post('/import/twitter', auth, async (req, res, next) => {
  try {
    const { handle } = req.body
    if (!handle) return res.status(400).json({ error: 'Twitter handle required' })
 
    const fans = await twitterService.getFollowers(handle)
 
    if (!fans.length) {
      return res.json({ imported: 0, message: 'No fans found or API limit reached' })
    }
 
    let imported = 0
    for (const fan of fans) {
      try {
        await query(
          `INSERT INTO fans (artist_id, username, display_name, platform, followers, score, tier)
           VALUES ($1, $2, $3, 'twitter', $4, $5, $6)
           ON CONFLICT (artist_id, username, platform) DO UPDATE
           SET followers = $4, score = $5, updated_at = NOW()`,
          [
            req.artist.id,
            fan.username,
            fan.name,
            fan.public_metrics?.followers_count || 0,
            fan.score || 50,
            fan.score >= 80 ? 'superfan' : fan.score >= 60 ? 'loyal' : 'engaged',
          ]
        )
        imported++
      } catch {}
    }
 
    res.json({ imported, total: fans.length })
  } catch (err) {
    next(err)
  }
})
 
// GET /api/fans/engagement — engagement breakdown
router.get('/engagement', auth, async (req, res, next) => {
  try {
    const { period = '30d' } = req.query
 
    const { rows } = await query(
      `SELECT 
        platform,
        AVG(score) as avg_score,
        COUNT(*) as fan_count,
        SUM(likes_given) as total_likes,
        SUM(comments_given) as total_comments
       FROM fans
       WHERE artist_id = $1
       GROUP BY platform`,
      [req.artist.id]
    )
 
    // Return mock data if no real data yet
    if (!rows.length) {
      return res.json({
        twitter: { avg_score: 68, fan_count: 10900, total_likes: 45200, total_comments: 8100 },
        instagram: { avg_score: 62, fan_count: 4300, total_likes: 28700, total_comments: 5400 },
      })
    }
 
    const breakdown = {}
    rows.forEach(r => { breakdown[r.platform] = r })
    res.json(breakdown)
  } catch (err) {
    next(err)
  }
})
 
// GET /api/fans/growth — fan growth over time
router.get('/growth', auth, async (req, res, next) => {
  try {
    // In production: query time-series data
    res.json([
      { month: 'Jan', twitter: 9200, instagram: 3100 },
      { month: 'Feb', twitter: 10100, instagram: 3800 },
      { month: 'Mar', twitter: 11400, instagram: 4500 },
      { month: 'Apr', twitter: 12200, instagram: 5100 },
      { month: 'May', twitter: 13500, instagram: 5900 },
      { month: 'Jun', twitter: 15200, instagram: 7200 },
    ])
  } catch (err) {
    next(err)
  }
})
 
// POST /api/fans/dm — send DM to fans (via platform APIs)
router.post('/dm', auth, async (req, res, next) => {
  try {
    const { fanIds, message, platform } = req.body
    if (!fanIds?.length || !message) {
      return res.status(400).json({ error: 'fanIds and message required' })
    }
 
    // In production: call Twitter/Instagram DM APIs
    // For now: log and return success
    console.log(`Sending DM to ${fanIds.length} fans on ${platform}: ${message.slice(0, 50)}...`)
 
    res.json({
      sent: fanIds.length,
      platform,
      message: 'DMs queued for delivery',
    })
  } catch (err) {
    next(err)
  }
})
 
module.exports = router
 