import api from './api'

export const oracleService = {
  // Music-industry headlines driving the Trend Radar
  async getTrends() {
    const { data } = await api.get('/oracle/trends')
    return data
  },

  // Headlines plus the AI studio brief drawn from them
  async getBrief(refresh = false) {
    const { data } = await api.get('/oracle/brief', { params: { refresh } })
    return data
  },
}
