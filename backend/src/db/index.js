const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('📦 PostgreSQL connected')
  }
})

async function query(text, params) {
  try {
    return await pool.query(text, params)
  } catch (err) {
    console.error('DB query error:', err.message)
    throw err
  }
}

async function getClient() {
  return pool.connect()
}

module.exports = { query, getClient, pool }
