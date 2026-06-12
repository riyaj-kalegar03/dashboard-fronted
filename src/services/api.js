import axios from 'axios'
import { toast } from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://localhost:8080'
})

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')?.toString().trim()
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers = config.headers || {}
    const headerValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    config.headers.Authorization = headerValue
    console.log('[API] Authorization header:', headerValue.substring(0, 30) + '...')
  } else {
    console.log('[API] No token found in localStorage')
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const response = error.response
    const requestUrl = error.config?.url || ''
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/resend-otp')
    console.log('[API] Error response:', response?.status, requestUrl)
    if (response && (response.status === 401 || response.status === 403) && !isAuthRequest) {
      console.log('[API] Logging out due to 401/403')
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      localStorage.removeItem('role')
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
