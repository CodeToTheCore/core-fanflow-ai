require('dotenv').config({ path: '../.env' })
const fs = require('fs')
const path = require('path')
const { pool } = require('./index')

async function runMigrations() {
  console.log('🔄 Running database migrations...')

  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    console.log(`  → Running ${file}`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    try {
      await pool.query(sql)
      console.log(`  ✅ ${file} completed`)
    } catch (err) {
      console.error(`  ❌ ${file} failed:`, err.message)
    }
  }

  console.log('\n✅ Migrations complete!')
  await pool.end()
}

runMigrations().catch(console.error)
