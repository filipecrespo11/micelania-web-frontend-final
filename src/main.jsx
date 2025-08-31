import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'

// Restore Authorization header from saved token on cold start / page reload
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Ensure every request picks up the latest token (in case it changed)
axios.interceptors.request.use((config) => {
  const t = localStorage.getItem('token')
  if (t) config.headers = { ...config.headers, Authorization: `Bearer ${t}` }
  return config
})

// Global response handler: on 401, clear token and redirect to login
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      try {
        // best-effort redirect to login route
        window.location.replace('/login')
      } catch (e) {
        console.error('Redirect to login failed', e)
      }
    }
    return Promise.reject(err)
  }
)

// Sync login/logout across tabs (keeps app logged in/out when token changes elsewhere)
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    if (e.newValue) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${e.newValue}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
    // reload current page to ensure UI updates to auth state
    window.location.reload()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
