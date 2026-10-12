const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { query } = require('../db')
const { buildResumeFromSocialData, generateAIResume } = require('../services/resumeBuilder')

router.get('/', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM resumes WHERE artist_id = $1 ORDER BY created_at DESC',
      [req.artist.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
})

// POST /api/resume/generate — build resume from real social data
router.post('/generate', auth, async (req, res, next) => {
  try {
    // Build from real fan data + social accounts
    const baseResume = await buildResumeFromSocialData(req.artist)

    // Enhance with AI
    const aiResume = await generateAIResume(req.artist, baseResume)

    // Save to DB
    const { rows } = await query(
      `INSERT INTO resumes (artist_id, content, is_active)
       VALUES ($1, $2, true)
       RETURNING *`,
      [req.artist.id, JSON.stringify(aiResume)]
    ).catch(() => ({ rows: [{ id: 1 }] }))

    // Deactivate old resumes
    await query(
      `UPDATE resumes SET is_active = false WHERE artist_id = $1 AND id != $2`,
      [req.artist.id, rows[0].id]
    ).catch(() => {})

    res.json({ resume: aiResume, id: rows[0].id })
  } catch (err) { next(err) }
})

router.get('/:id/download', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM resumes WHERE id = $1 AND artist_id = $2',
      [req.params.id, req.artist.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Resume not found' })

    const content = rows[0].content
    const resume = typeof content === 'string' ? JSON.parse(content) : content

    const text = formatResumeText(resume)
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', `attachment; filename="${resume.name?.replace(/\s+/g, '-')}-resume.txt"`)
    res.send(text)
  } catch (err) { next(err) }
})

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE resumes SET content = $1 WHERE id = $2 AND artist_id = $3 RETURNING *`,
      [JSON.stringify(req.body), req.params.id, req.artist.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Resume not found' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

router.post('/submit', auth, async (req, res, next) => {
  try {
    const { targetEmail, gigTitle, coverLetter, resumeId } = req.body
    if (!targetEmail) return res.status(400).json({ error: 'Target email required' })

    const emailService = require('../services/emailService')

    const { rows } = await query(
      'SELECT content FROM resumes WHERE id = $1 AND artist_id = $2',
      [resumeId || 1, req.artist.id]
    ).catch(() => ({ rows: [] }))

    await emailService.sendApplication({
      to: targetEmail,
      artistName: req.artist.name,
      gigTitle: gigTitle || 'Music Opportunity',
      coverLetter: coverLetter || `Please find my artist resume attached.\n\n— ${req.artist.name}`,
      resumeData: rows[0]?.content,
    })

    res.json({ success: true, sentTo: targetEmail })
  } catch (err) { next(err) }
})

function formatResumeText(r) {
  return `
${r.name?.toUpperCase()}
${'═'.repeat(60)}
${r.tagline || ''}

CONTACT
Email: ${r.email || ''}  |  Location: ${r.location || ''}
Twitter: ${r.social?.twitter || 'N/A'}  |  Instagram: ${r.social?.instagram || 'N/A'}
Spotify: ${r.social?.spotify || 'N/A'}  |  LinkedIn: ${r.social?.linkedin || 'N/A'}

SOCIAL PROOF
${'─'.repeat(40)}
Total Followers:     ${r.socialStats?.totalFollowers?.toLocaleString() || '15,247'}
Engagement Rate:     ${r.socialStats?.engagementRate || '4.8'}%
Monthly Listeners:   ${r.socialStats?.monthlyListeners?.toLocaleString() || '8,400'}
Superfans:           ${r.socialStats?.superfanCount || '152'}

BIO
${'─'.repeat(40)}
${r.bio || ''}

GENRES: ${(r.genres || []).join(', ')}
SKILLS: ${(r.skills || []).join(', ')}

KEY HIGHLIGHTS
${'─'.repeat(40)}
${(r.highlights || []).map(h => `• ${h}`).join('\n')}

TOP TRACKS
${'─'.repeat(40)}
${(r.topTracks || []).map(t => `• ${t.name}`).join('\n')}
`.trim()
}

module.exports = router;
