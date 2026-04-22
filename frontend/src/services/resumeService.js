import api from './api'
 
export const resumeService = {
  async getResumes() {
    const { data } = await api.get('/resume')
    return data
  },
 
  async createResume(artistData) {
    const { data } = await api.post('/resume/generate', artistData)
    return data
  },
 
  async updateResume(id, updates) {
    const { data } = await api.put(`/resume/${id}`, updates)
    return data
  },
 
  async downloadResume(id, format = 'pdf') {
    const response = await api.get(`/resume/${id}/download`, {
      params: { format },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `artist-resume.${format}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
 
  async submitToGig(resumeId, gigId, coverLetter) {
    const { data } = await api.post('/resume/submit', {
      resumeId,
      gigId,
      coverLetter,
    })
    return data
  },
}
 