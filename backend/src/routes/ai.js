const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const openaiService = require('../services/openaiService')
 
// POST /api/ai/campaign — generate a monetization campaign
router.post('/campaign', auth, async (req, res, next) => {
  try {
    const { type, artistData, fanData } = req.body
 
    const prompt = `You are an expert music industry monetization consultant. 
    
Artist Profile:
- Name: ${artistData?.name || 'Independent Artist'}
- Genre: ${artistData?.genre || 'R&B'}
- Total Followers: ${fanData?.fanCount || 15000}
- Superfans (top 1%): ${fanData?.topFanCount || 150}
 
Generate a ${type} campaign for this independent artist. Include:
1. A compelling Instagram/Twitter caption (2-3 paragraphs, authentic voice, not corporate)
2. A personalized DM script to send to their top 50 superfans
3. 5 relevant hashtags
4. Estimated revenue range
5. Best platforms to run this on
 
Campaign type: ${type.replace(/_/g, ' ').toUpperCase()}
 
Respond in JSON format:
{
  "caption": "...",
  "dmScript": "...",
  "hashtags": ["#...", "..."],
  "estimatedRevenue": "$X–$Y",
  "platforms": ["twitter", "instagram"],
  "type": "${type}"
}`
 
    const result = await openaiService.complete(prompt)
    const parsed = JSON.parse(result.replace(/```json|```/g, '').trim())
    res.json(parsed)
  } catch (err) {
    // Fallback response if OpenAI fails
    res.json({
      caption: `🔥 To my real ones — something special is dropping exclusively for my day-ones this week. Stay locked in. 💯 #IndieArtist #NewMusic`,
      dmScript: `Hey [name]! You've been rocking with me since day one. I'm dropping something exclusively for my top supporters — DM me "VIP" to get first access.`,
      hashtags: ['#IndieArtist', '#RnB', '#NewMusic', '#Independent', '#FanExclusive'],
      estimatedRevenue: '$400–$1,200',
      platforms: ['twitter', 'instagram'],
      type: req.body.type,
    })
  }
})
 
// POST /api/ai/dm-script — generate DM script for fan segment
router.post('/dm-script', auth, async (req, res, next) => {
  try {
    const { fanSegment, offer } = req.body
 
    const prompt = `You are writing a personalized direct message from an independent R&B/Hip-Hop artist to their most loyal fans.
 
Offer type: ${offer}
Fan count: ${fanSegment?.length || 50}
 
Write a SHORT, authentic DM script (150-200 words max) that:
- Sounds personal and real, not corporate
- Creates urgency without being pushy
- Acknowledges the fan's loyalty
- Makes a clear offer with a clear CTA
- Uses the artist's voice (urban, authentic, grateful)
 
Format: Just the message text, no JSON wrapping.`
 
    const script = await openaiService.complete(prompt)
    res.json({ script })
  } catch (err) {
    res.json({
      script: `Hey [name]! 👊 Appreciate you rocking with me — real talk. You've been with me from the beginning and it means everything.\n\nI'm dropping something this week that I'm ONLY sharing with my closest supporters. No label. No middleman. Just me and my day-ones.\n\nReply "IN" and I'll send you everything you need.\n\n— JP`,
    })
  }
})
 
// POST /api/ai/resume — generate artist resume from social data
router.post('/resume', auth, async (req, res, next) => {
  try {
    const { artistProfile, socialData } = req.body
 
    const prompt = `Create a professional artist resume/bio for an independent musician.
 
Artist Data:
- Name: ${artistProfile?.name || 'JP The Producer'}
- Genre: ${artistProfile?.genre || 'R&B/Hip-Hop'}
- Followers: ${socialData?.followers || 15200}
- Engagement Rate: ${socialData?.engagementRate || 4.8}%
- Monthly Listeners: ${socialData?.monthlyListeners || 8400}
- Location: ${artistProfile?.location || 'New York, NY'}
 
Generate a JSON resume with:
{
  "name": "...",
  "tagline": "...", 
  "bio": "...(2-3 paragraphs, professional but authentic)",
  "genres": ["..."],
  "skills": ["..."],
  "highlights": ["...", "...", "...", "...", "..."],
  "stats": {
    "followers": "...",
    "engagementRate": "...",
    "monthlyListeners": "...",
    "gigsPlayed": "..."
  }
}`
 
    const result = await openaiService.complete(prompt)
    const resume = JSON.parse(result.replace(/```json|```/g, '').trim())
    res.json({ resume })
  } catch (err) {
    res.json({
      resume: {
        name: req.body.artistProfile?.name || 'JP The Producer',
        tagline: `Independent R&B & Hip-Hop Artist/Producer | ${(req.body.socialData?.followers || 15200).toLocaleString()} Engaged Fans`,
        bio: `Independent R&B and Hip-Hop artist and music producer with over 5 years of crafting original music that blends authentic storytelling with modern production techniques.`,
        genres: ['R&B', 'Hip-Hop', 'Soul', 'Neo-Soul'],
        skills: ['Music Production', 'Live Performance', 'Songwriting', 'Beat Making', 'FL Studio', 'Ableton'],
        highlights: [
          `Built ${(req.body.socialData?.followers || 15200).toLocaleString()} organic social following with no label support`,
          '4.8% engagement rate (2x industry standard)',
          'Available for sync licensing, brand deals, and live bookings',
        ],
      },
    })
  }
})
 
// POST /api/ai/cover-letter — generate cover letter for gig
router.post('/cover-letter', auth, async (req, res, next) => {
  try {
    const { gigDetails, artistProfile } = req.body
 
    const prompt = `Write a professional cover letter/application from an independent artist for this opportunity.
 
Opportunity:
- Title: ${gigDetails?.title}
- Venue/Company: ${gigDetails?.venue}
- Type: ${gigDetails?.type}
- Pay: ${gigDetails?.pay}
- Description: ${gigDetails?.description}
 
Artist:
- Name: ${artistProfile?.name || 'JP The Producer'}
- Followers: ${artistProfile?.fans || 15200}
- Genre: R&B/Hip-Hop
 
Write a 3-4 paragraph cover letter that:
- Is professional but has the artist's authentic voice
- References specific details about the opportunity
- Highlights their fanbase and engagement as proof of audience
- Includes a strong call to action
 
Format: Just the letter text, no JSON.`
 
    const letter = await openaiService.complete(prompt)
    res.json({ letter })
  } catch (err) {
    res.json({
      letter: `Dear ${req.body.gigDetails?.venue || 'Team'},\n\nMy name is ${req.body.artistProfile?.name || 'JP The Producer'}, an independent R&B and Hip-Hop artist/producer based in New York with over ${(req.body.artistProfile?.fans || 15200).toLocaleString()} engaged followers across Twitter and Instagram.\n\nI've spent the last 5+ years crafting original music and I'd be honored to bring that energy to ${req.body.gigDetails?.title}.\n\nWith respect,\n${req.body.artistProfile?.name || 'JP The Producer'}`,
    })
  }
})
 
// POST /api/ai/monetization — get AI monetization suggestions
router.post('/monetization', auth, async (req, res, next) => {
  try {
    const { artistData } = req.body
 
    const prompt = `You are an AI music industry manager. Give 3 specific monetization recommendations for this independent artist.
 
Artist: ${JSON.stringify(artistData || {})}
Followers: ~15,000
Genre: R&B/Hip-Hop
 
Return JSON:
{
  "suggestions": [
    { "id": 1, "type": "campaign|gig|content", "text": "...", "priority": "urgent|high|medium" },
    ...
  ]
}`
 
    const result = await openaiService.complete(prompt)
    const parsed = JSON.parse(result.replace(/```json|```/g, '').trim())
    res.json(parsed)
  } catch (err) {
    res.json({
      suggestions: [
        { id: 1, type: 'campaign', text: 'Drop a $10 exclusive sample pack to your top 120 fans — estimated $1,200 revenue', priority: 'high' },
        { id: 2, type: 'gig', text: 'New venue opening in your city looking for R&B acts — deadline in 3 days', priority: 'urgent' },
        { id: 3, type: 'content', text: 'Behind-the-scenes studio session would spike engagement 40% based on your data', priority: 'medium' },
      ],
    })
  }
})
 
// POST /api/ai/caption — generate social caption
router.post('/caption', auth, async (req, res, next) => {
  try {
    const { postType, context, platform } = req.body
    const prompt = `Write an authentic ${platform} caption for an independent R&B/Hip-Hop artist.
Post type: ${postType}
Context: ${context}
Keep it under 150 words. Authentic, not corporate. Include 3-5 hashtags at the end.`
 
    const caption = await openaiService.complete(prompt)
    res.json({ caption })
  } catch (err) {
    res.json({ caption: `New music dropping soon. Stay locked in. 🎵 #NewMusic #IndieArtist #RnB` })
  }
})
 
// POST /api/ai/chat — chat with AI manager
router.post('/chat', auth, async (req, res, next) => {
  try {
    const { messages, artistContext } = req.body
 
    const systemPrompt = `You are an AI music industry manager for ${artistContext?.name || 'an independent artist'}. 
You help them grow their fanbase, increase revenue, find gigs, and navigate the music industry.
Be direct, practical, and encouraging. You know the music industry inside and out.
Artist profile: ${JSON.stringify(artistContext || {})}`
 
    const reply = await openaiService.chat(messages, systemPrompt)
    res.json({ reply })
  } catch (err) {
    res.json({ reply: 'Your AI manager is thinking... Try again in a moment.' })
  }
})
 
module.exports = router
 