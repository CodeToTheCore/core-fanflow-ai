import api from './api'
 
export const fanService = {
  // Fetch all fans with scores
  async getFans(params = {}) {
    const { data } = await api.get('/fans', { params })
    return data
  },
 
  // Get superfans (top 1%)
  async getSuperfans(limit = 50) {
    const { data } = await api.get('/fans/superfans', { params: { limit } })
    return data
  },
 
  // Import fans from Twitter
  async importFromTwitter(handle) {
    const { data } = await api.post('/fans/import/twitter', { handle })
    return data
  },
 
  // Import fans from Instagram
  async importFromInstagram(handle) {
    const { data } = await api.post('/fans/import/instagram', { handle })
    return data
  },
 
  // Get fan engagement breakdown
  async getEngagementStats(period = '30d') {
    const { data } = await api.get('/fans/engagement', { params: { period } })
    return data
  },
 
  // Send DM to selected fans
  async sendCampaignDM(fanIds, message, platform) {
    const { data } = await api.post('/fans/dm', { fanIds, message, platform })
    return data
  },
 
  // Get fan growth over time
  async getFanGrowth(period = '90d') {
    const { data } = await api.get('/fans/growth', { params: { period } })
    return data
  },
}
 