import axios from 'axios'
 
// 5000 is taken by macOS AirPlay Receiver, which answers with an AirTunes 403.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})


// ADD THIS: This attaches the token to every single request automatically
api.interceptors.request.use((config) => {
  // Use your test token for now, or pull from localStorage if you have a login system
  const token = localStorage.getItem('token') || 'demo-token-test'; 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

 
// // Inject auth token
// api.interceptors.request.use((config) => {
//   const stored = localStorage.getItem('fanflow-artist')
//   if (stored) {
//     const { state } = JSON.parse(stored)
//     if (state?.token) {
//       config.headers.Authorization = `Bearer ${state.token}`
//     }
//   }
//   return config
// })
 
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
 