const axios = require('axios')
 
const BASE = 'https://graph.instagram.com'
 
/**
 * Get Instagram user profile via Graph API
 */
async function getUserProfile(accessToken) {
  try {
    const { data } = await axios.get(`${BASE}/me`, {
      params: {
        fields: 'id,username,account_type,media_count',
        access_token: accessToken,
      },
    })
    return data
  } catch (err) {
    console.error('Instagram profile error:', err.response?.data || err.message)
    return null
  }
}
 
/**
 * Get media insights (requires Instagram Business account)
 */
async function getMediaInsights(mediaId, accessToken) {
  try {
    const { data } = await axios.get(`${BASE}/${mediaId}/insights`, {
      params: {
        metric: 'engagement,impressions,reach,saved',
        access_token: accessToken,
      },
    })
    return data
  } catch (err) {
    console.error('Instagram insights error:', err.message)
    return null
  }
}
 
/**
 * Get follower demographics
 */
async function getFollowerDemographics(userId, accessToken) {
  try {
    const { data } = await axios.get(`${BASE}/${userId}/insights`, {
      params: {
        metric: 'follower_demographics',
        period: 'lifetime',
        breakdown: 'age,gender,country',
        access_token: accessToken,
      },
    })
    return data
  } catch (err) {
    console.error('Instagram demographics error:', err.message)
    return null
  }
}
 
/**
 * Exchange short-lived token for long-lived token
 */
async function refreshToken(shortToken) {
  try {
    const { data } = await axios.get('https://graph.instagram.com/refresh_access_token', {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: shortToken,
      },
    })
    return data.access_token
  } catch (err) {
    console.error('Token refresh error:', err.message)
    return null
  }
}
 
module.exports = { getUserProfile, getMediaInsights, getFollowerDemographics, refreshToken }
 