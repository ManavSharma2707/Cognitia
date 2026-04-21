import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cognitia_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect — AuthContext.logout() will also do this,
      // but we handle it here for calls made outside the React tree.
      localStorage.removeItem('cognitia_token')
      localStorage.removeItem('cognitia_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
