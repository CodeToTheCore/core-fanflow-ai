const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const { isDemoMode, demoGuard } = require('./lib/demoMode')

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(morgan('dev'))

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true)
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'FanFlow AI API', version: '2.0.0', demo: isDemoMode })
})

// Demo mode: a demo login, and a guard in front of every API route
// that would send, post, connect, upload, or apply. See DEMO_MODE.md.
if (isDemoMode) {
  app.use('/api/demo', require('./routes/demo'))
  app.use('/api', demoGuard)
}

app.use('/api/auth',      require('./routes/auth'))
app.use('/api/artist',    require('./routes/artist'))
app.use('/api/fans',      require('./routes/fans'))
app.use('/api/gigs',      require('./routes/gigs'))
app.use('/api/resume',    require('./routes/resume'))
app.use('/api/campaigns', require('./routes/campaigns'))
app.use('/api/ai',        require('./routes/ai'))
app.use('/api/social',    require('./routes/social'))
app.use('/api/media',     require('./routes/media'))
app.use('/api/portfolio', require('./routes/portfolio'))
app.use('/api/search',    require('./routes/search'))
app.use('/api/oracle',      require('./routes/oracle'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
// app.use('/api/agent',     require('./routes/agent'))
// app.use('/api/linkedin',  require('./routes/linkedin'))
app.use('/api/albums',    require('./routes/albums'))

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl })
})

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

module.exports = app