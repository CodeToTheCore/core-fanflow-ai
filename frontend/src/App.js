const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
 
const authRoutes = require('./routes/auth')
const artistRoutes = require('./routes/artist')
const fanRoutes = require('./routes/fans')
const gigRoutes = require('./routes/gigs')
const resumeRoutes = require('./routes/resume')
const campaignRoutes = require('./routes/campaigns')
const aiRoutes = require('./routes/ai')
const errorHandler = require('./middleware/errorHandler')
 
const app = express()
 
// ─── Security & logging ──────────────────────────────────────────────────────
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
 
// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
 
// ─── Rate limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests. Please slow down.' },
})
app.use('/api/', limiter)
 
// AI endpoints get stricter limits (OpenAI costs money)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  message: { error: 'AI rate limit reached. Please wait a moment.' },
})
app.use('/api/ai/', aiLimiter)
 
// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
 
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FanFlow AI API', version: '1.0.0' })
})
 
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/artist', artistRoutes)
app.use('/api/fans', fanRoutes)
app.use('/api/gigs', gigRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/ai', aiRoutes)
 
// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl })
})
 
// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler)
 
module.exports = app
 