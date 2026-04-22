const axios = require('axios')
 
const TWITTER_BASE = 'https://api.twitter.com/2'
 
const headers = {
  Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
}
 
/**
 * Get user by handle
 */
async function getUserByHandle(handle) {
  const clean = handle.replace('@', '')
  const { data } = await axios.get(
    `${TWITTER_BASE}/users/by/username/${clean}`,
    {
      headers,
      params: {
        'user.fields': 'public_metrics,description,profile_image_url',
      },
    }
  )
  return data.data
}
 
/**
 * Get followers list (up to 1000)
 * Returns scored fan objects
 */
async function getFollowers(handle) {
  try {
    const user = await getUserByHandle(handle)
    if (!user) return []
 
    const { data } = await axios.get(
      `${TWITTER_BASE}/users/${user.id}/followers`,
      {
        headers,
        params: {
          max_results: 1000,
          'user.fields': 'public_metrics,description,created_at',
        },
      }
    )
 
    const followers = data.data || []
 
    // Score each follower
    return followers.map((f) => ({
      username: f.username,
      name: f.name,
      platform: 'twitter',
      followers: f.public_metrics?.followers_count || 0,
      following: f.public_metrics?.following_count || 0,
      tweets: f.public_metrics?.tweet_count || 0,
      score: calculateEngagementScore(f),
    }))
  } catch (err) {
    console.error('Twitter API error:', err.response?.data || err.message)
    return []
  }
}
 
/**
 * Get recent mentions of an artist
 */
async function getMentions(userId) {
  try {
    const { data } = await axios.get(
      `${TWITTER_BASE}/users/${userId}/mentions`,
      {
        headers,
        params: {
          max_results: 100,
          'tweet.fields': 'author_id,created_at,public_metrics',
          'expansions': 'author_id',
          'user.fields': 'username,public_metrics',
        },
      }
    )
    return data
  } catch (err) {
    console.error('Twitter mentions error:', err.message)
    return { data: [] }
  }
}
 
/**
 * Score a follower 0–100 based on available metrics
 */
function calculateEngagementScore(user) {
  const metrics = user.public_metrics || {}
  let score = 40 // base
 
  // Active tweeters
  if (metrics.tweet_count > 1000) score += 15
  else if (metrics.tweet_count > 500) score += 10
  else if (metrics.tweet_count > 100) score += 5
 
  // Not bot-like (ratio check)
  const ratio = metrics.followers_count / Math.max(1, metrics.following_count)
  if (ratio > 0.5 && ratio < 10) score += 15
 
  // Has followers themselves (amplification potential)
  if (metrics.followers_count > 5000) score += 20
  else if (metrics.followers_count > 1000) score += 12
  else if (metrics.followers_count > 200) score += 6
 
  // Account age matters
  if (user.created_at) {
    const ageMonths = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 30)
    if (ageMonths > 36) score += 10
    else if (ageMonths > 12) score += 5
  }
 
  return Math.min(100, score)
}
 
module.exports = { getUserByHandle, getFollowers, getMentions }
 