// Loads the sample artist and data for the public demo.
// Everything here is invented: no real fans, emails, or accounts.
// Run with: npm run seed:demo  (it wipes and reloads only the demo artist's data)
const { query, pool } = require('./index')

const DEMO_EMAIL = 'demo@fanflow.demo'

const FANS = [
  ['lyric_lover', 'Maya R.', 'instagram', 4200, 310, 88, 41, 97, 'superfan'],
  ['beatheadnyc', 'Andre K.', 'twitter', 1850, 260, 74, 52, 94, 'superfan'],
  ['soulsunday', 'Priya S.', 'instagram', 980, 190, 61, 22, 89, 'superfan'],
  ['808_dreamer', 'Luis M.', 'twitter', 12400, 140, 33, 19, 82, 'loyal'],
  ['vinylvibes', 'Tasha W.', 'instagram', 650, 120, 40, 12, 78, 'loyal'],
  ['bkbasement', 'Devon P.', 'twitter', 3100, 95, 28, 30, 74, 'loyal'],
  ['nightdrive_rnb', 'Kim L.', 'instagram', 2200, 80, 19, 8, 66, 'engaged'],
  ['harlemkeys', 'Marcus T.', 'twitter', 540, 60, 22, 5, 61, 'engaged'],
  ['coffeeandcadence', 'Ana G.', 'instagram', 1300, 44, 9, 3, 52, 'engaged'],
  ['quietstorm88', 'Jordan B.', 'twitter', 300, 31, 6, 2, 45, 'casual'],
  ['studiofloor', 'Sam O.', 'instagram', 7100, 25, 4, 1, 38, 'casual'],
  ['midnightmixtape', 'Rae D.', 'twitter', 890, 18, 3, 0, 31, 'casual'],
]

const GIGS = [
  ['venue', 'R&B Night: Opening Act', 'Brooklyn Bowl', 'Looking for an R&B artist to open for our monthly showcase. 30-minute set.', '$400', 400, 'Brooklyn, NY', 'R&B', 92, 'demo-venues'],
  ['sync', 'Neo-soul track for streaming drama', 'Placement Agency (sample)', 'Seeking moody neo-soul instrumentals for a late-night scene. One-time license.', '$1,500', 1500, 'Remote', 'Neo-Soul', 88, 'demo-sync'],
  ['brand', 'Coffee brand social campaign', 'Local Roaster (sample)', 'Short-form video with original music for a fall launch.', '$800', 800, 'New York, NY', 'R&B', 81, 'demo-brands'],
  ['venue', 'Sunday Soul Brunch Residency', 'Harlem Lounge (sample)', 'Four Sundays of live acoustic R&B covers and originals.', '$250/show', 250, 'Harlem, NY', 'Soul', 77, 'demo-venues'],
  ['sync', 'Beat for indie game trailer', 'Indie Studio (sample)', 'Need a 60-second hip-hop beat for a game trailer.', '$600', 600, 'Remote', 'Hip-Hop', 73, 'demo-sync'],
]

async function seedDemo() {
  // Remove the old demo artist (cascades to their fans, campaigns, and notifications)
  await query('DELETE FROM applications WHERE artist_id IN (SELECT id FROM artists WHERE email = $1)', [DEMO_EMAIL])
  await query('DELETE FROM artists WHERE email = $1', [DEMO_EMAIL])
  await query("DELETE FROM gigs WHERE source LIKE 'demo-%'")

  const { rows: [artist] } = await query(
    `INSERT INTO artists (name, email, password, genre, location, bio, twitter_handle, instagram_handle, plan, auto_apply, ai_manager)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pro', false, false) RETURNING id`,
    ['Demo Artist', DEMO_EMAIL, 'demo-login-only', 'R&B', 'New York, NY',
     'Independent R&B artist and producer. This is a sample profile for the FanFlow AI demo.',
     'demo_artist', 'demo.artist']
  )

  for (const [username, display, platform, followers, likes, comments, shares, score, tier] of FANS) {
    await query(
      `INSERT INTO fans (artist_id, username, display_name, platform, followers, likes_given, comments_given, shares_given, score, tier, last_active, is_starred)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW() - (random() * interval '20 days'), $11)`,
      [artist.id, username, display, platform, followers, likes, comments, shares, score, tier, score >= 89]
    )
  }

  for (const [type, title, venue, description, pay, amount, location, genre, match, source] of GIGS) {
    await query(
      `INSERT INTO gigs (type, title, venue, description, pay, pay_amount, location, genre, match_score, source, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW() + interval '14 days')`,
      [type, title, venue, description, pay, amount, location, genre, match, source]
    )
  }

  await query(
    `INSERT INTO campaigns (artist_id, type, title, caption, dm_script, hashtags, platform, estimated_reach, actual_reach, revenue_generated, status, launched_at)
     VALUES ($1, 'exclusive_drop', 'Sample pack for day-ones',
       'Something special for my day-ones only. Link in bio.',
       'Hey [name]! You have been with me since day one, so you get first access.',
       ARRAY['#IndieArtist','#RnB','#NewMusic'], ARRAY['instagram','twitter'], 120, 96, 840, 'completed', NOW() - interval '9 days')`,
    [artist.id]
  )

  await query(
    `INSERT INTO notifications (artist_id, type, title, message) VALUES
     ($1, 'superfan', 'New superfan detected', 'Maya R. moved into your top 1%.'),
     ($1, 'gig', 'New gig match', 'R&B Night: Opening Act at Brooklyn Bowl is a 92% match.')`,
    [artist.id]
  )

  console.log(`✅ Demo data loaded for ${DEMO_EMAIL}`)
}

module.exports = { seedDemo, DEMO_EMAIL }

if (require.main === module) {
  if (process.env.DEMO_MODE !== 'true') require('dotenv').config()
  seedDemo().then(() => pool.end()).catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
