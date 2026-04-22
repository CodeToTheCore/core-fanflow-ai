import axios from 'axios'
 
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
 
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})
 
// Inject auth token
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('fanflow-artist')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})
 
// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fanflow-artist')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)
 
export default api
 