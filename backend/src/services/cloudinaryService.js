const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase()
    const audioExts = ['mp3','wav','ogg','flac','m4a','aac']
    const videoExts = ['mp4','mov','avi','mkv','webm']
    
    let resourceType = 'image'
    let folder = 'fanflow/images'
    
    if (audioExts.includes(ext)) {
      resourceType = 'video' // Cloudinary uses 'video' for audio too
      folder = 'fanflow/audio'
    } else if (videoExts.includes(ext)) {
      resourceType = 'video'
      folder = 'fanflow/video'
    }

    return {
      folder,
      resource_type: resourceType,
      public_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }
  },
})

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }
})

// Local fallback storage when Cloudinary not configured
const localPath = require('path').join(__dirname, '../../uploads')
const fs = require('fs')
;['audio','video','images'].forEach(d => {
  const p = require('path').join(localPath, d)
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
})

function getTypeFromExt(filename) {
  const ext = require('path').extname(filename || '').toLowerCase()
  if (['.mp3','.wav','.ogg','.flac','.m4a','.aac'].includes(ext)) return 'audio'
  if (['.mp4','.mov','.avi','.mkv','.webm'].includes(ext)) return 'video'
  return 'images'
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = getTypeFromExt(file.originalname)
    cb(null, require('path').join(localPath, type))
  },
  filename: (req, file, cb) => {
    const ext = require('path').extname(file.originalname).toLowerCase()
    cb(null, require('uuid').v4() + ext)
  }
})

const localUpload = multer({
  storage: localStorage,
  limits: { fileSize: 500 * 1024 * 1024 }
})

// Use Cloudinary if configured, otherwise local
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

module.exports = {
  upload: isCloudinaryConfigured ? upload : localUpload,
  cloudinary,
  isCloudinaryConfigured,
  getTypeFromExt,
}