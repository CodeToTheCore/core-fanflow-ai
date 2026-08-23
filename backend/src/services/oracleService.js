const axios = require('axios')
const { chat } = require('./openaiService')

/**
 * Trend Oracle — pulls music-industry headlines and turns them into
 * actionable studio direction. Ported from the v2 build.
 */

const NEWS_URL = 'https://newsapi.org/v2/everything'

async function getMusicTrends(limit = 5) {
  if (!process.env.NEWS_API_KEY) {
    console.warn('Oracle: NEWS_API_KEY not set — returning no trends')
    return []
  }

  try {
    const { data } = await axios.get(NEWS_URL, {
      params: {
        // NewsAPI ANDs bare terms, so a long phrase matches nothing. Quote the
        // phrases and OR them together.
        q: '"music industry" OR "sync licensing" OR "music licensing"',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: limit,
        apiKey: process.env.NEWS_API_KEY,
      },
      timeout: 15000,
    })

    return (data.articles || []).slice(0, limit).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source?.name,
      publishedAt: a.publishedAt,
    }))
  } catch (err) {
    // A dead news feed shouldn't take the dashboard down with it.
    console.error('Oracle trend fetch failed:', err.message)
    return []
  }
}

/**
 * Turns headlines into three concrete briefs: what to make, what to make it
 * with, and which sync market to aim it at.
 */
async function generateStudioBrief(trends) {
  if (!trends || trends.length === 0) {
    return null
  }

  const headlines = trends.map((t) => `- ${t.title}`).join('\n')

  const prompt = `Based on these music industry headlines:
${headlines}

Give exactly 3 Studio Briefs for an independent producer. For each, state:
1. The genre/vibe to target
2. Specific instruments or textures to use
3. The sync market to aim at (e.g. video game radio, streaming drama, ad spot)

Be concrete and produceable. No preamble.`

  return chat(
    [{ role: 'user', content: prompt }],
    'You are a world-class A&R and sync licensing agent.',
    700
  )
}

module.exports = { getMusicTrends, generateStudioBrief }
