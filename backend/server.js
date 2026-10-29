// Demo mode never reads the .env file, so your real keys can't load by accident.
if (process.env.DEMO_MODE !== 'true') require('dotenv').config()
const { isDemoMode, assertNoSecrets, blockOutboundRequests } = require('./src/lib/demoMode')

// Demo mode: refuse to start with real keys, and cut off outside calls
// BEFORE any service is loaded. See DEMO_MODE.md.
if (isDemoMode) {
  assertNoSecrets()
  blockOutboundRequests()
}

const app = require('./src/app')
const { startCronJobs } = require('./src/services/cronJobs')

// 5000 is taken by macOS AirPlay Receiver (ControlCenter), so it can never bind.
const PORT = process.env.PORT || 5050

app.listen(PORT, async () => {
  console.log(`\n🎵 FanFlow AI Backend running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV}`)
  console.log(`   API Base: http://localhost:${PORT}/api\n`)

  if (isDemoMode) {
    // Demo: reload the sample data on every start, and never run the
    // scheduled jobs (they scan LinkedIn and send email as the real artist).
    console.log('🧪 DEMO MODE: sample data only, outside services blocked, scheduled jobs off\n')
    // A fresh demo database has no tables yet, so create them before loading sample data
    const { runMigrations } = require('./src/db/migrate')
    const { seedDemo } = require('./src/db/seedDemo')
    await runMigrations()
    await seedDemo().catch((err) => console.error('Demo seed failed:', err.message))
    return
  }

  // Start AI agent scheduled jobs
  startCronJobs()
})
