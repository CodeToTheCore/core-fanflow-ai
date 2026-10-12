const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const auth = require('../middleware/auth')
const { query } = require('../db/index')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const UPLOAD_DIR = path.join(__dirname, '../../uploads')






;['audio', 'video', 'images'].forEach(dir => {
  const p = path.join(UPLOAD_DIR, dir)
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
})

function detectType(filename) {
  const ext = path.extname(filename || '').toLowerCase()
  if (['.mp3','.wav','.ogg','.flac','.m4a','.aac'].includes(ext)) return 'audio'
  if (['.mp4','.mov','.avi','.mkv','.webm'].includes(ext)) return 'video'
  if (['.jpg','.jpeg','.png','.gif','.webp'].includes(ext)) return 'images'
  return 'audio'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOAD_DIR, detectType(file.originalname)))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3'
    cb(null, uuidv4() + ext)
  }
})

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } })

router.get('/', auth, async (req, res, next) => {
  try {
    const { type } = req.query
    let sql = 'SELECT * FROM media WHERE artist_id = $1'
    const params = [req.artist.id]
    if (type) { sql += ' AND type = $2'; params.push(type) }
    sql += ' ORDER BY created_at DESC'
    const { rows } = await query(sql, params)
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/upload', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const fileType = detectType(req.file.originalname)
    const { title, description, isPublic, albumName, genre } = req.body
    const fileUrl = '/uploads/' + fileType + '/' + req.file.filename

    console.log('Upload:', req.file.originalname, '→', fileType)

    const { rows } = await query(
      `INSERT INTO media (artist_id, title, description, type, filename, url, mimetype, size, album_name, genre, is_public)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        req.artist.id,
        title || req.file.originalname,
        description || '',
        fileType,
        req.file.filename,
        fileUrl,
        req.file.mimetype || 'audio/mpeg',
        req.file.size,
        albumName || null,
        genre || 'R&B',
        isPublic === 'true' || isPublic === true,
      ]
    )

    res.status(201).json({ success: true, media: rows[0], message: fileType + ' uploaded successfully' })
  } catch (err) {
    console.error('Upload error:', err.message)
    next(err)
  }
})

router.patch('/:id', auth, async (req, res, next) => {
  try {
    const { title, description, isPublic, albumName } = req.body
    const { rows } = await query(
      `UPDATE media SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        is_public = COALESCE($3, is_public),
        album_name = COALESCE($4, album_name)
       WHERE id = $5 AND artist_id = $6 RETURNING *`,
      [title, description, isPublic, albumName, req.params.id, req.artist.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Media not found' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM media WHERE id = $1 AND artist_id = $2',
      [req.params.id, req.artist.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Media not found' })
    const filePath = path.join(UPLOAD_DIR, rows[0].type, rows[0].filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    await query('DELETE FROM media WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.get('/portfolio/:artistId', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT m.*, a.name as artist_name FROM media m
       JOIN artists a ON m.artist_id = a.id
       WHERE m.artist_id = $1 AND m.is_public = true
       ORDER BY m.created_at DESC`,
      [req.params.artistId]
    )
    res.json(rows)
  } catch (err) { next(err) }
})

module.exports = router;