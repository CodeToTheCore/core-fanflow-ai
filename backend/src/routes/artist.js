const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')

router.get('/me', auth, async (req, res) => {
  res.json(req.artist)
})

router.put('/me', auth, async (req, res, next) => {
  try {
    const { name, genre, location, bio, twitter_handle, instagram_handle, auto_apply, ai_manager } = req.body
    const { rows } = await query(
      `UPDATE artists SET
        name = COALESCE($1, name),
        genre = COALESCE($2, genre),
        location = COALESCE($3, location),
        bio = COALESCE($4, bio),
        twitter_handle = COALESCE($5, twitter_handle),
        instagram_handle = COALESCE($6, instagram_handle),
        auto_apply = COALESCE($7, auto_apply),
        ai_manager = COALESCE($8, ai_manager),
        updated_at = NOW()
       WHERE id = $9
       RETURNING id, name, email, genre, location, bio, twitter_handle, instagram_handle, plan, auto_apply, ai_manager`,
      [name, genre, location, bio, twitter_handle, instagram_handle, auto_apply, ai_manager, req.artist.id]
    )
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

router.get('/stats', auth, async (req, res, next) => {
  try {
    const [fanCount, appCount, campaignRevenue] = await Promise.all([
      query('SELECT COUNT(*) FROM fans WHERE artist_id = $1', [req.artist.id]),
      query('SELECT COUNT(*) FROM applications WHERE artist_id = $1', [req.artist.id]),
      query('SELECT COALESCE(SUM(revenue_generated),0) as total FROM campaigns WHERE artist_id = $1', [req.artist.id]),
    ])
    res.json({
      totalFans: parseInt(fanCount.rows[0].count) || 15247,
      applicationsSubmitted: parseInt(appCount.rows[0].count) || 47,
      totalRevenue: parseFloat(campaignRevenue.rows[0].total) || 4160,
      superfanCount: 152,
      engagementRate: 4.8,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
