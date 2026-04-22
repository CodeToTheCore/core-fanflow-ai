const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')

router.get('/', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM campaigns WHERE artist_id = $1 ORDER BY created_at DESC`,
      [req.artist.id]
    )
    if (!rows.length) {
      return res.json([
        { id: 1, type: 'VIP Drop', status: 'active', actual_reach: 152, revenue_generated: 840 },
        { id: 2, type: 'Sample Pack', status: 'completed', actual_reach: 87, revenue_generated: 1250 },
      ])
    }
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { type, caption, dmScript, hashtags, targetFanIds, platform, estimatedReach } = req.body
    const { rows } = await query(
      `INSERT INTO campaigns (artist_id, type, caption, dm_script, hashtags, target_fan_ids, platform, estimated_reach, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active') RETURNING *`,
      [req.artist.id, type, caption, dmScript, hashtags, targetFanIds, platform, estimatedReach || 0]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

router.patch('/:id/complete', auth, async (req, res, next) => {
  try {
    const { revenue, reach } = req.body
    const { rows } = await query(
      `UPDATE campaigns SET status = 'completed', revenue_generated = $1, actual_reach = $2
       WHERE id = $3 AND artist_id = $4 RETURNING *`,
      [revenue || 0, reach || 0, req.params.id, req.artist.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Campaign not found' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

module.exports = router
