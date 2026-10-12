const router = require('express').Router();
const { query } = require('../db/index')  //('../db/migration/index.js');  Adjust path to your index.js

// Create a new album
router.post('/', async (req, res) => {
  const { title, description, cover_url } = req.body;
  try {
    const { rows } = await query(
      'INSERT INTO albums (title, description, cover_url) VALUES ($1, $2, $3) RETURNING *',
      [title, description, cover_url]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all albums
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM albums ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;