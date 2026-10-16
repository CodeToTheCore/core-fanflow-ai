// Demo login: only mounted when DEMO_MODE=true.
// Gives every visitor a short-lived login for the shared sample artist,
// so nobody needs to sign up and nobody sees real data.
const express = require('express')
const jwt = require('jsonwebtoken')
const { query } = require('../db')
const { DEMO_EMAIL } = require('../db/seedDemo')

const router = express.Router()

router.post('/session', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, uuid, name, email, genre, location, plan FROM artists WHERE email = $1',
      [DEMO_EMAIL]
    )
    if (!rows.length) return res.status(503).json({ error: 'Demo data is not loaded yet' })
    const artist = rows[0]
    const token = jwt.sign({ artistId: artist.id, demo: true }, process.env.JWT_SECRET, { expiresIn: '2h' })
    res.json({ artist, token, demo: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
