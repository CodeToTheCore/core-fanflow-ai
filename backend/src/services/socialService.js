const axios = require('axios')
const { query } = require('../db')

/**
 * ─── TWITTER / X ─────────────────────────────────────────────────────────────
 * Uses Twitter API v2 Bearer Token (free tier)
 * Get yours at: developer.twitter.com
 */
async function importTwitterFans(artistId, twitterHandle) {
  const BEARER = process.env.TWITTER_BEARER_TOKEN
  if (!BEARER) {
    console.log('No Twitter token — using mock data')
    return insertMockFans(artistId, 'twitter', 50)
  }

  try {
    const handle = twitterHandle.replace('@', '')

    // Get user ID from handle
    const userRes = await axios.get(
      `https://api.twitter.com/2/users/by/username/${handle}`,
      {
        headers: { Authorization: `Bearer ${BEARER}` },
        params: { 'user.fields': 'public_metrics,description' },
      }
    )

    const userId = userRes.data?.data?.id
    const metrics = userRes.data?.data?.public_metrics || {}
    if (!userId) throw new Error('Twitter user not found')

    // Get followers
    const followersRes = await axios.get(
      `https://api.twitter.com/2/users/${userId}/followers`,
      {
        headers: { Authorization: `Bearer ${BEARER}` },
        params: {
          max_results: 1000,
          'user.fields': 'public_metrics,created_at,description',
        },
      }
    )

    const followers = followersRes.data?.data || []
    let imported = 0

    for (const fan of followers) {
      const score = calcTwitterScore(fan)
      try {
        await query(
          `INSERT INTO fans (artist_id, username, display_name, platform, followers, score, tier, last_active)
           VALUES ($1,$2,$3,'twitter',$4,$5,$6,NOW())
           ON CONFLICT (artist_id, username, platform)
           DO UPDATE SET score=$5, followers=$4, updated_at=NOW()`,
          [
            artistId,
            fan.username,
            fan.name,
            fan.public_metrics?.followers_count || 0,
            score,
            score >= 80 ? 'superfan' : score >= 60 ? 'loyal' : 'engaged',
          ]
        )
        imported++
      } catch {}
    }

    // Update artist Twitter stats
    await query(
      `UPDATE artists SET twitter_connected=true, twitter_handle=$1 WHERE id=$2`,
      [handle, artistId]
    )

    return {
      imported,
      total: followers.length,
      artistFollowers: metrics.followers_count,
      platform: 'twitter',
    }
  } catch (err) {
    console.error('Twitter import error:', err.message)
    return insertMockFans(artistId, 'twitter', 30)
  }
}

/**
 * ─── INSTAGRAM ────────────────────────────────────────────────────────────────
 * Uses Instagram Graph API (requires Facebook Developer account)
 * Artists must connect via OAuth — we store their access token
 */
async function importInstagramFans(artistId, accessToken, igUserId) {
  if (!accessToken || !igUserId) {
    return insertMockFans(artistId, 'instagram', 25)
  }

  try {
    // Get media list
    const mediaRes = await axios.get(
      `https://graph.instagram.com/${igUserId}/media`,
      {
        params: {
          fields: 'id,like_count,comments_count,timestamp,media_type',
          access_token: accessToken,
          limit: 50,
        },
      }
    )

    const posts = mediaRes.data?.data || []
    const engagedUsers = new Map()

    // Get commenters on recent posts
    for (const post of posts.slice(0, 10)) {
      try {
        const commentsRes = await axios.get(
          `https://graph.instagram.com/${post.id}/comments`,
          {
            params: {
              fields: 'username,timestamp',
              access_token: accessToken,
            },
          }
        )

        const comments = commentsRes.data?.data || []
        for (const comment of comments) {
          const existing = engagedUsers.get(comment.username) || { comments: 0, likes: 0 }
          engagedUsers.set(comment.username, {
            ...existing,
            comments: existing.comments + 1,
          })
        }
      } catch {}
    }

    let imported = 0
    for (const [username, engagement] of engagedUsers) {
      const score = Math.min(100, 40 + engagement.comments * 8 + engagement.likes * 2)
      try {
        await query(
          `INSERT INTO fans (artist_id, username, platform, comments_given, score, tier, last_active)
           VALUES ($1,$2,'instagram',$3,$4,$5,NOW())
           ON CONFLICT (artist_id, username, platform)
           DO UPDATE SET score=$4, comments_given=$3, updated_at=NOW()`,
          [
            artistId,
            username,
            engagement.comments,
            score,
            score >= 80 ? 'superfan' : score >= 60 ? 'loyal' : 'engaged',
          ]
        )
        imported++
      } catch {}
    }

    await query(
      `UPDATE artists SET instagram_connected=true WHERE id=$1`,
      [artistId]
    )

    return { imported, total: engagedUsers.size, platform: 'instagram' }
  } catch (err) {
    console.error('Instagram import error:', err.message)
    return insertMockFans(artistId, 'instagram', 20)
  }
}

/**
 * ─── SPOTIFY ──────────────────────────────────────────────────────────────────
 * Uses Spotify Web API — client credentials flow
 * Get credentials at: developer.spotify.com
 */
async function getSpotifyArtistData(artistName) {
  try {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return getMockSpotifyData(artistName)
    }

    // Get access token
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const token = tokenRes.data.access_token

    // Search for artist
    const searchRes = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: artistName, type: 'artist', limit: 1 },
    })

    const artist = searchRes.data?.artists?.items?.[0]
    if (!artist) return getMockSpotifyData(artistName)

    // Get top tracks
    const tracksRes = await axios.get(
      `https://api.spotify.com/v1/artists/${artist.id}/top-tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { market: 'US' },
      }
    )

    return {
      spotifyId: artist.id,
      monthlyListeners: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      genres: artist.genres || [],
      topTracks: tracksRes.data?.tracks?.slice(0, 5).map(t => ({
        name: t.name,
        streams: t.popularity,
        previewUrl: t.preview_url,
      })) || [],
      imageUrl: artist.images?.[0]?.url || null,
    }
  } catch (err) {
    console.error('Spotify error:', err.message)
    return getMockSpotifyData(artistName)
  }
}

/**
 * Calculate Twitter fan engagement score
 */
function calcTwitterScore(fan) {
  const m = fan.public_metrics || {}
  let score = 40

  if (m.tweet_count > 500) score += 10
  if (m.followers_count > 1000) score += 15
  else if (m.followers_count > 200) score += 8

  const ratio = (m.followers_count || 0) / Math.max(1, m.following_count || 1)
  if (ratio > 0.3 && ratio < 15) score += 10

  if (fan.created_at) {
    const months = (Date.now() - new Date(fan.created_at)) / (1000 * 60 * 60 * 24 * 30)
    if (months > 24) score += 10
    else if (months > 12) score += 5
  }

  if (fan.description?.length > 20) score += 5

  return Math.min(100, score)
}

async function insertMockFans(artistId, platform, count) {
  const mockNames = [
    'melodyhunter', 'basslineQueen', 'nocturnal_wav', 'soulpatch99',
    'loopmaster_k', 'deepcuts_ty', 'rhythmsage', 'wavlength23',
    'drumline_d', 'samplequeen', 'beatsmith_j', 'soulvibes22',
    'jazzfusion_k', 'trapsouls', 'rnbdaily', 'musichead_t',
    'groovemaster', 'vibecheck99', 'lowkey_fan', 'topfan_real',
  ]

  let imported = 0
  for (let i = 0; i < Math.min(count, mockNames.length); i++) {
    const score = Math.max(40, 97 - i * 3)
    try {
      await query(
        `INSERT INTO fans (artist_id, username, platform, score, tier, last_active)
         VALUES ($1,$2,$3,$4,$5,NOW())
         ON CONFLICT (artist_id, username, platform) DO NOTHING`,
        [
          artistId,
          mockNames[i] + '_' + platform[0],
          platform,
          score,
          score >= 80 ? 'superfan' : score >= 60 ? 'loyal' : 'engaged',
        ]
      )
      imported++
    } catch {}
  }
  return { imported, total: count, platform, note: 'demo data — connect real account for live fans' }
}

function getMockSpotifyData(artistName) {
  return {
    spotifyId: null,
    monthlyListeners: 8400,
    popularity: 42,
    genres: ['r&b', 'hip hop', 'soul'],
    topTracks: [
      { name: 'Late Night Drive', streams: 68, previewUrl: null },
      { name: 'Real Ones', streams: 54, previewUrl: null },
      { name: 'No Label', streams: 49, previewUrl: null },
    ],
    imageUrl: null,
    note: 'demo data — add SPOTIFY_CLIENT_ID to connect real account',
  }
}

module.exports = {
  importTwitterFans,
  importInstagramFans,
  getSpotifyArtistData,
}
