const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { getMusicTrends, generateStudioBrief } = require('../services/oracleService')

// Trends move slowly and both NewsAPI and OpenAI cost money per call, so keep
// the last result for an hour rather than regenerating per dashboard load.
const TTL_MS = 60 * 60 * 1000
let cache = { trends: null, brief: null, at: 0 }

// GET /api/oracle/trends
router.get('/trends', auth, async (req, res, next) => {
  try {
    const trends = await getMusicTrends()
    res.json({ trends, count: trends.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/oracle/brief — headlines plus the AI studio direction drawn from them
router.get('/brief', auth, async (req, res, next) => {
  try {
    const fresh = req.query.refresh === 'true'
    if (!fresh && cache.brief && Date.now() - cache.at < TTL_MS) {
      return res.json({ ...cache, cached: true })
    }

    const trends = await getMusicTrends()
    if (trends.length === 0) {
      return res.json({ trends: [], brief: null, cached: false })
    }

    // The headlines are worth showing even if the AI step is unavailable (no
    // OPENAI_API_KEY, quota, outage), so don't fail the whole request for it.
    let brief = null
    let briefError = null
    try {
      brief = await generateStudioBrief(trends)
    } catch (err) {
      briefError = err.message
      console.error('Oracle brief generation failed:', err.message)
    }

    if (brief) cache = { trends, brief, at: Date.now() }
    res.json({ trends, brief, briefError, cached: false })
  } catch (err) {
    next(err)
  }
})

module.exports = router
