import api from './api'

export const leaderboardService = {
  // Global indie-score rankings, optionally scoped to one genre
  async getLeaderboard({ genre, limit } = {}) {
    const { data } = await api.get('/leaderboard', { params: { genre, limit } })
    return data
  },
}
