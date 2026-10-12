const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')
const { importTwitterFans, importInstagramFans, getSpotifyArtistData } = require('../services/socialService')

// POST /api/social/connect/twitter
router.post('/connect/twitter', auth, async (req, res, next) => {
  try {
    const { handle } = req.body
    if (!handle) return res.status(400).json({ error: 'Twitter handle required' })

    const result = await importTwitterFans(req.artist.id, handle)

    await query(
      `UPDATE artists SET twitter_handle = $1, twitter_connected = true WHERE id = $2`,
      [handle.replace('@', ''), req.artist.id]
    )

    res.json({
      success: true,
      platform: 'twitter',
      handle,
      ...result,
      message: `Connected @${handle} — imported ${result.imported} fans`,
    })
  } catch (err) { next(err) }
})

// POST /api/social/connect/instagram
router.post('/connect/instagram', auth, async (req, res, next) => {
  try {
    const { handle, accessToken, igUserId } = req.body

    const result = await importInstagramFans(req.artist.id, accessToken, igUserId)

    await query(
      `UPDATE artists SET instagram_handle = $1, instagram_connected = true,
       ig_access_token = $2, ig_user_id = $3 WHERE id = $4`,
      [handle?.replace('@', '') || '', accessToken || null, igUserId || null, req.artist.id]
    )

    res.json({
      success: true,
      platform: 'instagram',
      handle,
      ...result,
      message: `Connected Instagram — imported ${result.imported} fans`,
    })
  } catch (err) { next(err) }
})

// POST /api/social/connect/spotify
router.post('/connect/spotify', auth, async (req, res, next) => {
  try {
    const spotifyData = await getSpotifyArtistData(req.artist.name)

    if (spotifyData.spotifyId) {
      await query(
        `UPDATE artists SET spotify_artist_id = $1, spotify_connected = true WHERE id = $2`,
        [spotifyData.spotifyId, req.artist.id]
      )
    }

    res.json({
      success: true,
      platform: 'spotify',
      ...spotifyData,
      message: `Spotify data loaded for ${req.artist.name}`,
    })
  } catch (err) { next(err) }
})

// GET /api/social/stats — all connected platform stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const { rows: artistRows } = await query(
      `SELECT twitter_handle, instagram_handle, twitter_connected, instagram_connected,
              spotify_connected, spotify_artist_id FROM artists WHERE id = $1`,
      [req.artist.id]
    )

    const { rows: fanRows } = await query(
      `SELECT platform, COUNT(*) as count, ROUND(AVG(score),1) as avg_score
       FROM fans WHERE artist_id = $1 GROUP BY platform`,
      [req.artist.id]
    )

    const platforms = {}
    fanRows.forEach(r => {
      platforms[r.platform] = {
        fans: parseInt(r.count),
        avgScore: parseFloat(r.avg_score),
      }
    })

    const artist = artistRows[0] || {}

    res.json({
      twitter: {
        connected: artist.twitter_connected || false,
        handle: artist.twitter_handle,
        fans: platforms.twitter?.fans || 0,
        avgEngagement: platforms.twitter?.avgScore || 0,
      },
      instagram: {
        connected: artist.instagram_connected || false,
        handle: artist.instagram_handle,
        fans: platforms.instagram?.fans || 0,
        avgEngagement: platforms.instagram?.avgScore || 0,
      },
      spotify: {
        connected: artist.spotify_connected || false,
        artistId: artist.spotify_artist_id,
      },
    })
  } catch (err) { next(err) }
})

// GET /api/social/notifications — get AI agent notifications
router.get('/notifications', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE artist_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [req.artist.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
})

// PATCH /api/social/notifications/read
router.patch('/notifications/read', auth, async (req, res, next) => {
  try {
    await query(
      `UPDATE notifications SET read = true WHERE artist_id = $1`,
      [req.artist.id]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
