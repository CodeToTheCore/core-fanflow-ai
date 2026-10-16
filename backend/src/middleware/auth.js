const jwt = require('jsonwebtoken')
const { query } = require('../db')
const { isDemoMode } = require('../lib/demoMode')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    // Local development shortcut only. Never allowed in demo mode or production.
    if (process.env.NODE_ENV === 'development' && !isDemoMode && token.startsWith('demo-token-')) {
      req.artist = {
        id: 1,
        uuid: 'demo-uuid',
        name: 'JP The Producer',
        email: 'jp@demo.com',
        genre: 'R&B',
        plan: 'pro',
      }
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { rows } = await query(
      'SELECT id, uuid, name, email, genre, location, plan, twitter_handle, instagram_handle, auto_apply, ai_manager FROM artists WHERE id = $1',
      [decoded.artistId]
    )

    if (!rows.length) {
      return res.status(401).json({ error: 'Artist not found' })
    }

    req.artist = rows[0]
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = authMiddleware
