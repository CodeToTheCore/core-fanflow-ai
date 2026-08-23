/**
 * Independence Score = (revenue / followers) * 100 * (1 + engagement)
 *
 * Deliberately a ratio rather than a raw total, so an artist earning $500 from
 * 2k engaged fans outranks one earning $600 from 200k passive ones. Ported from
 * the v2 build.
 */
function calculateIndieScore(revenue, followers, engagement = 0) {
  const rev = Number(revenue) || 0
  const fans = Number(followers) || 0
  const eng = Number(engagement) || 0

  // No followers yet means the ratio is undefined, not infinite.
  if (fans <= 0) return 0

  const baseRatio = (rev / fans) * 100
  return Math.round(baseRatio * (1 + eng))
}

module.exports = { calculateIndieScore }
