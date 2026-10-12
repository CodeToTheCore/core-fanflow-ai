const axios = require('axios')
const cheerio = require('cheerio')

/**
 * FanFlow AI LinkedIn Agent
 * Monitors LinkedIn daily for music industry opportunities
 * Uses LinkedIn's public job search + RapidAPI LinkedIn scraper
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = 'linkedin-jobs-search.p.rapidapi.com'

// Keywords the agent monitors every day
const MUSIC_GIG_KEYWORDS = [
  'music producer needed',
  'soundtrack composer',
  'music supervisor',
  'background music artist',
  'sync licensing artist',
  'live performer wanted',
  'brand music partnership',
  'artist brand deal',
  'music for film',
  'video game music composer',
  'R&B artist wanted',
  'hip hop producer contract',
  'independent artist opportunity',
  'music content creator',
  'label A&R looking',
]

const EXECUTIVE_TITLES = [
  'Music Supervisor',
  'A&R Manager',
  'Music Director',
  'Creative Director Music',
  'Head of Music',
  'Music Producer',
  'Sync Licensing Manager',
  'Brand Partnerships Music',
  'Entertainment Director',
  'Music Publisher',
]

/**
 * Search LinkedIn Jobs via RapidAPI
 * Sign up free at rapidapi.com — linkedin-jobs-search API
 */
async function searchLinkedInJobs(keyword, location = 'United States') {
  try {
    if (!RAPIDAPI_KEY) {
      console.log('No RAPIDAPI_KEY — returning mock LinkedIn data')
      return getMockLinkedInJobs(keyword)
    }

    const { data } = await axios.request({
      method: 'GET',
      url: 'https://linkedin-jobs-search.p.rapidapi.com/',
      params: {
        query: keyword,
        location,
        page: '1',
        datePosted: 'past week',
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      timeout: 15000,
    })

    return (data || []).map(job => ({
      type: 'linkedin',
      title: job.title || keyword,
      venue: job.company || 'Unknown Company',
      description: job.description || job.summary || '',
      location: job.location || location,
      apply_url: job.linkedin_url || job.url || '',
      pay: extractPay(job.description || ''),
      pay_amount: extractPayAmount(job.description || ''),
      match_score: scoreJob(job, keyword),
      source: 'linkedin_jobs',
      deadline: new Date(Date.now() + 7 * 86400000),
      status: 'open',
    }))
  } catch (err) {
    console.error(`LinkedIn search error for "${keyword}":`, err.message)
    return getMockLinkedInJobs(keyword)
  }
}

/**
 * Search for music executives to connect with
 */
async function findMusicExecutives(artistGenre = 'R&B') {
  const executives = []

  for (const title of EXECUTIVE_TITLES.slice(0, 5)) {
    try {
      const jobs = await searchLinkedInJobs(`${title} ${artistGenre}`, 'United States')
      executives.push(...jobs.map(j => ({ ...j, contact_type: 'executive' })))
      await sleep(1000) // be respectful with rate limits
    } catch {}
  }

  return executives
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20)
}

/**
 * Run the daily monitoring job
 * Called by cron scheduler every morning at 8am
 */
async function runDailyMonitor(artistProfile) {
  console.log(`🤖 LinkedIn Agent running daily scan for ${artistProfile.name}...`)

  const allOpportunities = []

  // Search all keyword categories
  const keywordsToSearch = MUSIC_GIG_KEYWORDS.slice(0, 8) // limit API calls
  for (const keyword of keywordsToSearch) {
    const results = await searchLinkedInJobs(keyword)
    allOpportunities.push(...results)
    await sleep(500)
  }

  // Also search genre-specific
  const genreResults = await searchLinkedInJobs(
    `${artistProfile.genre || 'R&B'} artist opportunity`
  )
  allOpportunities.push(...genreResults)

  // Deduplicate by title+company
  const seen = new Set()
  const unique = allOpportunities.filter(opp => {
    const key = `${opp.title}-${opp.venue}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Score and rank
  const ranked = unique
    .map(opp => ({
      ...opp,
      match_score: scoreOpportunityForArtist(opp, artistProfile),
    }))
    .filter(opp => opp.match_score >= 60)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 15)

  console.log(`✅ LinkedIn Agent found ${ranked.length} opportunities`)
  return ranked
}

/**
 * Score a job opportunity for a specific artist
 */
function scoreOpportunityForArtist(opp, artist) {
  let score = 50
  const desc = (opp.description + opp.title).toLowerCase()
  const genre = (artist.genre || 'R&B').toLowerCase()

  // Genre match
  if (desc.includes(genre)) score += 20
  if (desc.includes('r&b') || desc.includes('hip hop') || desc.includes('soul')) score += 15

  // Pay mentioned
  if (opp.pay_amount > 0) score += 10
  if (opp.pay_amount >= 1000) score += 10

  // Remote work
  if (opp.location?.toLowerCase().includes('remote')) score += 5

  // Urgency keywords
  if (desc.includes('urgent') || desc.includes('immediately')) score += 5

  // Type bonuses
  if (desc.includes('sync') || desc.includes('soundtrack')) score += 15
  if (desc.includes('brand') || desc.includes('partnership')) score += 10
  if (desc.includes('festival') || desc.includes('venue')) score += 10

  return Math.min(100, score)
}

function scoreJob(job, keyword) {
  let score = 60
  const text = ((job.title || '') + (job.description || '')).toLowerCase()
  if (text.includes('music')) score += 10
  if (text.includes('artist')) score += 10
  if (text.includes('producer')) score += 8
  if (text.includes('sync') || text.includes('license')) score += 12
  if (text.includes('r&b') || text.includes('hip hop')) score += 10
  return Math.min(100, score)
}

function extractPay(text) {
  const match = text.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*\/\s*(?:hr|hour|month|year))?/i)
  return match ? match[0] : 'Negotiable'
}

function extractPayAmount(text) {
  const match = text.match(/\$([\d,]+)/)
  if (!match) return 0
  return parseInt(match[1].replace(',', ''))
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getMockLinkedInJobs(keyword) {
  return [
    {
      type: 'linkedin',
      title: `Music Producer — ${keyword}`,
      venue: 'Warner Music Group',
      description: 'Looking for an independent R&B/Hip-Hop producer for upcoming project. Must have 10K+ social following and proven track record.',
      location: 'New York, NY (Remote OK)',
      apply_url: 'https://linkedin.com/jobs/view/demo',
      pay: '$3,000–$8,000',
      pay_amount: 5000,
      match_score: 88,
      source: 'linkedin_jobs',
      deadline: new Date(Date.now() + 7 * 86400000),
      status: 'open',
    },
    {
      type: 'linkedin',
      title: 'Sync Licensing — R&B Artist',
      venue: 'Musicbed',
      description: 'Seeking original R&B and soul tracks for TV/Film sync licensing. Non-exclusive deals available. Artists keep masters.',
      location: 'Remote',
      apply_url: 'https://musicbed.com/artists',
      pay: '$500–$5,000 per placement',
      pay_amount: 2500,
      match_score: 92,
      source: 'linkedin_jobs',
      deadline: new Date(Date.now() + 14 * 86400000),
      status: 'open',
    },
    {
      type: 'linkedin',
      title: 'Brand Music Partnership',
      venue: 'Nike',
      description: 'Independent artists with 10K+ engaged following for Q4 campaign. Must be able to produce 2 original tracks.',
      location: 'Remote',
      apply_url: 'https://linkedin.com/jobs/view/nike-music',
      pay: '$5,000 flat',
      pay_amount: 5000,
      match_score: 85,
      source: 'linkedin_jobs',
      deadline: new Date(Date.now() + 5 * 86400000),
      status: 'open',
    },
  ]
}

module.exports = {
  searchLinkedInJobs,
  findMusicExecutives,
  runDailyMonitor,
  MUSIC_GIG_KEYWORDS,
}
