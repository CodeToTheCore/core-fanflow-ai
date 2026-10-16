import axios from 'axios'
import toast from 'react-hot-toast'
 
// 5000 is taken by macOS AirPlay Receiver, which answers with an AirTunes 403.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})


// Attach the logged-in artist's token (saved by the artist store) to every request
api.interceptors.request.use((config) => {
  let token = null
  try {
    token = JSON.parse(localStorage.getItem('fanflow-artist'))?.state?.token
  } catch (_) { /* no saved login */ }
  // Local development shortcut only: the backend accepts this in development, never in production or demo
  if (!token && import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== 'true') token = 'demo-token-test'
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Demo mode: the backend blocks actions that would touch real accounts. Explain why.
    if (err.response?.status === 403 && err.response.data?.demo) {
      toast(err.response.data.error, { icon: '🔒' })
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('fanflow-artist')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)
 
export default api
 