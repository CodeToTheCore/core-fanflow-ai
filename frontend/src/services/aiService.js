import api from './api'
 
export const aiService = {
  // Generate AI campaign
  async generateCampaign(type, artistData, fanData) {
    const { data } = await api.post('/ai/campaign', {
      type,
      artistData,
      fanData,
    })
    return data
  },
 
  // Generate DM script for superfans
  async generateDMScript(fanSegment, offer) {
    const { data } = await api.post('/ai/dm-script', { fanSegment, offer })
    return data
  },
 
  // Generate artist resume/bio
  async generateResume(artistProfile, socialData) {
    const { data } = await api.post('/ai/resume', { artistProfile, socialData })
    return data
  },
 
  // Generate cover letter for gig
  async generateCoverLetter(gigDetails, artistProfile) {
    const { data } = await api.post('/ai/cover-letter', {
      gigDetails,
      artistProfile,
    })
    return data
  },
 
  // AI-powered fan scoring
  async scoreFans(fanList) {
    const { data } = await api.post('/ai/score-fans', { fanList })
    return data
  },
 
  // Get AI monetization suggestions
  async getMonetizationSuggestions(artistData) {
    const { data } = await api.post('/ai/monetization', { artistData })
    return data
  },
 
  // AI content caption generator
  async generateCaption(postType, context, platform) {
    const { data } = await api.post('/ai/caption', {
      postType,
      context,
      platform,
    })
    return data
  },
 
  // Chat with AI manager
  async chatWithManager(messages, artistContext) {
    const { data } = await api.post('/ai/chat', { messages, artistContext })
    return data
  },
}
 