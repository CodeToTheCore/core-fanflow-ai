import api from './api'

export const mediaService = {
  async getAll(type) {
    const { data } = await api.get('/media', { params: type ? { type } : {} })
    return data
  },

  async upload(file, metadata, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(metadata).forEach(([k, v]) => formData.append(k, v))

    const { data } = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    return data
  },

  async update(id, updates) {
    const { data } = await api.patch(`/media/${id}`, updates)
    return data
  },

  async delete(id) {
    const { data } = await api.delete(`/media/${id}`)
    return data
  },
}

export const portfolioService = {
  async get() {
    const { data } = await api.get('/portfolio')
    return data
  },
  async save(portfolioData) {
    const { data } = await api.post('/portfolio', portfolioData)
    return data
  },
}

export const searchService = {
  async search(query, type) {
    const { data } = await api.get('/search', { params: { q: query, type } })
    return data
  },
}

export const agentService = {
  async chat(message, history = []) {
    const { data } = await api.post('/agent/chat', { message, history })
    return data
  },
  async hunt() {
    const { data } = await api.post('/agent/hunt')
    return data
  },
  async analyzeFans() {
    const { data } = await api.post('/agent/analyze-fans')
    return data
  },
}
