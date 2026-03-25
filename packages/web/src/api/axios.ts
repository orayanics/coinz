import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      const auth = useAuthStore()
      const token = await auth.refresh()
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    } catch {
      const auth = useAuthStore()
      auth.clearAccessToken()
      window.location.href = '/login'
      return Promise.reject(error)
    }
  },
)

export default api
