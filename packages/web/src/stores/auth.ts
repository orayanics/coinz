import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios, { isAxiosError } from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)

  const setAccessToken = (token: string) => (accessToken.value = token)
  const clearAccessToken = () => (accessToken.value = null)

  const refresh = async () => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )

    if (data.data?.accessToken) {
      setAccessToken(data.data.accessToken)
      return data.data.accessToken
    }

    return null
  }

  return { accessToken, setAccessToken, clearAccessToken, refresh }
})
