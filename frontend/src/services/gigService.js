import api from './api'
 
export const gigService = {
  // Search for available gigs
  async searchGigs(filters = {}) {
    const { data } = await api.get('/gigs/search', { params: filters })
    return data
  },
 
  // Get gig details
  async getGig(gigId) {
    const { data } = await api.get(`/gigs/${gigId}`)
    return data
  },
 
  // Auto-apply to a gig
  async autoApply(gigId, resumeId) {
    const { data } = await api.post(`/gigs/${gigId}/apply`, { resumeId })
    return data
  },
 
  // Bulk apply to multiple gigs
  async bulkApply(gigIds, resumeId) {
    const { data } = await api.post('/gigs/bulk-apply', { gigIds, resumeId })
    return data
  },
 
  // Get application status
  async getApplications(status = 'all') {
    const { data } = await api.get('/gigs/applications', { params: { status } })
    return data
  },
 
  // Get gig recommendations based on artist profile
  async getRecommendations() {
    const { data } = await api.get('/gigs/recommendations')
    return data
  },
 
  // Search LinkedIn opportunities
  async searchLinkedIn(keywords) {
    const { data } = await api.post('/gigs/linkedin', { keywords })
    return data
  },
 
  // Search venue opportunities
  async searchVenues(genre, location, minPay) {
    const { data } = await api.get('/gigs/venues', {
      params: { genre, location, minPay },
    })
    return data
  },
 
  // Search soundtrack/sync licensing opportunities
  async searchSync(genre) {
    const { data } = await api.get('/gigs/sync', { params: { genre } })
    return data
  },
}
 