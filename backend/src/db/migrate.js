const fs = require('fs')
const path = require('path')
const { pool } = require('./index')

// Runs every .sql file in migrations/ in order. Safe to run again: the SQL uses
// CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
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

  console.log('✅ Migrations complete!')
}

module.exports = { runMigrations }

// `node src/db/migrate.js` runs them once and exits
if (require.main === module) {
  require('dotenv').config({ path: '../.env' })
  runMigrations().then(() => pool.end()).catch(console.error)
}
