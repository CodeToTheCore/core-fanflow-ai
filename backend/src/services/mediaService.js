const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

const dirs = ['audio', 'video', 'images']
dirs.forEach(dir => {
  const p = path.join(UPLOAD_DIR, dir)
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true })
  }
})

function getTypeFromFile(file) {
  const name = file.originalname || ''
  const ext = path.extname(name).toLowerCase()

  const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

  if (audioExts.includes(ext)) return 'audio'
  if (videoExts.includes(ext)) return 'video'
  if (imageExts.includes(ext)) return 'images'

  const mime = file.mimetype || ''
  if (mime.startsWith('audio')) return 'audio'
  if (mime.startsWith('video')) return 'video'
  if (mime.startsWith('image')) return 'images'

  return null
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = getTypeFromFile(file)
    if (!type) {
      return cb(new Error('Unsupported file type: ' + file.originalname))
    }
    cb(null, path.join(UPLOAD_DIR, type))
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
    cb(null, uuidv4() + ext)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }
})

function getFileType(file) {
  return getTypeFromFile(file)
}

module.exports = { upload, getFileType, UPLOAD_DIR }