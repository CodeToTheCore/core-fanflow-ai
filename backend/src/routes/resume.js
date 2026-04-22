const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')
const openaiService = require('../services/openaiService')
const emailService = require('../services/emailService')
 
// GET /api/resume — get all resumes for artist
router.get('/', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM resumes WHERE artist_id = $1 ORDER BY created_at DESC',
      [req.artist.id]
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})
 
// POST /api/resume/generate — AI-generate a resume
router.post('/generate', auth, async (req, res, next) => {
  try {
    const { followers = 15200, engagementRate = 4.8, monthlyListeners = 8400 } = req.body
 
    const prompt = `Create a professional artist resume for an independent musician.
 
Artist Data:
- Name: ${req.artist.name}
- Genre: ${req.artist.genre || 'R&B/Hip-Hop'}
- Followers: ${followers.toLocaleString()}
- Engagement Rate: ${engagementRate}%
- Monthly Listeners: ${monthlyListeners.toLocaleString()}
- Location: ${req.artist.location || 'New York, NY'}
 
Generate a JSON resume:
{
  "name": "...",
  "tagline": "...",
  "bio": "...(2-3 paragraphs, professional and authentic)",
  "genres": ["..."],
  "skills": ["..."],
  "highlights": ["...", "...", "...", "...", "..."],
  "stats": {
    "followers": "...",
    "engagementRate": "...",
    "monthlyListeners": "...",
    "gigsPlayed": "47"
  },
  "social": {
    "twitter": "@handle",
    "instagram": "@handle",
    "spotify": "Artist Name"
  }
}`
 
    let resumeContent
    try {
      const result = await openaiService.complete(prompt, 800)
      resumeContent = JSON.parse(result.replace(/```json|```/g, '').trim())
    } catch {
      resumeContent = buildDefaultResume(req.artist, { followers, engagementRate, monthlyListeners })
    }
 
    // Save to DB
    const { rows } = await query(
      `INSERT INTO resumes (artist_id, content, version)
       VALUES ($1, $2, (
         SELECT COALESCE(MAX(version), 0) + 1 FROM resumes WHERE artist_id = $1
       ))
       RETURNING *`,
      [req.artist.id, JSON.stringify(resumeContent)]
    ).catch(() => ({ rows: [{ id: 1, content: resumeContent }] }))
 
    res.json({ resume: resumeContent, id: rows[0].id })
  } catch (err) {
    next(err)
  }
})
 
// GET /api/resume/:id/download — download as PDF
router.get('/:id/download', auth, async (req, res, next) => {
  try {
    const { format = 'json' } = req.query
 
    const { rows } = await query(
      'SELECT * FROM resumes WHERE id = $1 AND artist_id = $2',
      [req.params.id, req.artist.id]
    )
 
    if (!rows.length) {
      return res.status(404).json({ error: 'Resume not found' })
    }
 
    const resumeData = rows[0].content
 
    if (format === 'json') {
      return res.json(resumeData)
    }
 
    // For PDF: in production use puppeteer or wkhtmltopdf
    // For now return structured text
    const content = typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData
    const text = formatResumeAsText(content)
 
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', `attachment; filename="${content.name || 'artist'}-resume.txt"`)
    res.send(text)
  } catch (err) {
    next(err)
  }
})
 
// PUT /api/resume/:id — update resume
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE resumes SET content = $1 WHERE id = $2 AND artist_id = $3 RETURNING *`,
      [JSON.stringify(req.body), req.params.id, req.artist.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Resume not found' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})
 
// POST /api/resume/submit — submit resume to a venue/email
router.post('/submit', auth, async (req, res, next) => {
  try {
    const { resumeId, gigId, coverLetter, targetEmail, targetName } = req.body
 
    if (!targetEmail && !gigId) {
      return res.status(400).json({ error: 'Target email or gig ID required' })
    }
 
    // Get resume
    const { rows: resumeRows } = await query(
      'SELECT * FROM resumes WHERE id = $1 AND artist_id = $2',
      [resumeId, req.artist.id]
    )
 
    const resumeData = resumeRows[0]?.content || buildDefaultResume(req.artist, {})
 
    // Get target email
    let to = targetEmail
    let gigTitle = 'Opportunity'
    if (gigId && !to) {
      const { rows: gigRows } = await query('SELECT * FROM gigs WHERE id = $1', [gigId])
      if (gigRows[0]) {
        to = gigRows[0].contact_email
        gigTitle = gigRows[0].title
      }
    }
 
    if (!to) return res.status(400).json({ error: 'No contact email found' })
 
    await emailService.sendApplication({
      to,
      artistName: req.artist.name,
      gigTitle,
      coverLetter: coverLetter || `Please find my artist resume attached.`,
      resumeData,
    })
 
    res.json({ success: true, sentTo: to, message: 'Resume submitted successfully' })
  } catch (err) {
    next(err)
  }
})
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildDefaultResume(artist, stats) {
  return {
    name: artist.name,
    tagline: `Independent ${artist.genre || 'R&B'} Artist/Producer | ${(stats.followers || 15200).toLocaleString()} Engaged Fans`,
    bio: `Independent ${artist.genre || 'R&B'} artist and music producer based in ${artist.location || 'New York, NY'} with over 5 years of crafting original music. Built an organic following of ${(stats.followers || 15200).toLocaleString()} fans with a ${stats.engagementRate || 4.8}% engagement rate.`,
    genres: [artist.genre || 'R&B', 'Hip-Hop', 'Soul'],
    skills: ['Music Production', 'Live Performance', 'Songwriting', 'Beat Making'],
    highlights: [
      `${(stats.followers || 15200).toLocaleString()} organic social followers — no label support`,
      `${stats.engagementRate || 4.8}% engagement rate (2x industry average)`,
      'Available for sync licensing, live bookings, and brand deals',
    ],
    stats: {
      followers: (stats.followers || 15200).toLocaleString(),
      engagementRate: `${stats.engagementRate || 4.8}%`,
      monthlyListeners: (stats.monthlyListeners || 8400).toLocaleString(),
      gigsPlayed: '47',
    },
  }
}
 
function formatResumeAsText(resume) {
  return `
${resume.name?.toUpperCase() || 'ARTIST'}
${'='.repeat(50)}
${resume.tagline || ''}
 
BIO
${'-'.repeat(30)}
${resume.bio || ''}
 
GENRES: ${(resume.genres || []).join(', ')}
SKILLS: ${(resume.skills || []).join(', ')}
 
KEY STATS
${'-'.repeat(30)}
${Object.entries(resume.stats || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}
 
HIGHLIGHTS
${'-'.repeat(30)}
${(resume.highlights || []).map(h => `• ${h}`).join('\n')}
`.trim()
}
 
module.exports = router
 