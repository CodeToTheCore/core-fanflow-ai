require('dotenv').config()
const app = require('./src/app')
const { startCronJobs } = require('./src/services/cronJobs')

// 5000 is taken by macOS AirPlay Receiver (ControlCenter), so it can never bind.
const PORT = process.env.PORT || 5050

app.listen(PORT, () => {
  console.log(`\n🎵 FanFlow AI Backend running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV}`)
  console.log(`   API Base: http://localhost:${PORT}/api\n`)

  // Start AI agent scheduled jobs
  startCronJobs()
})
