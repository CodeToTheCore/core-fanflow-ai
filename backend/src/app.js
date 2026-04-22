const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const app = express()

app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FanFlow AI API', version: '1.0.0' })
})


app.get('/api', (req, res) => {
  res.json({ message: "FanFlow API is working 🚀" });
});
// Routes
const authRoutes = require('./routes/auth')
const artistRoutes = require('./routes/artist')
const fanRoutes = require('./routes/fans')
const gigRoutes = require('./routes/gigs')
const resumeRoutes = require('./routes/resume')
const campaignRoutes = require('./routes/campaigns')
const aiRoutes = require('./routes/ai')

app.use('/api/auth', authRoutes)
app.use('/api/artist', artistRoutes)
app.use('/api/fans', fanRoutes)
app.use('/api/gigs', gigRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/ai', aiRoutes)


app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

module.exports = app
