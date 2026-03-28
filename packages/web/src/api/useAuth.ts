import { queryOptions, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

export const useLogin = () => {
  const auth = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials)
      return data.data
    },
    onSuccess: (data) => {
      auth.setAccessToken(data.accessToken)
      queryClient.invalidateQueries()
      router.push('/dashboard')
    },
  })
}

export const useLogout = () => {
  const auth = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout', {}, { withCredentials: true })
    },
    onSettled: () => {
      auth.clearAccessToken()
      queryClient.clear()
      router.push('/login')
    },
  })
}

export const useRegister = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async (body: { name: string; email: string; password: string }) => {
      const { data } = await api.post('/auth/register', body)
      return data.data
    },
    onSuccess: () => {
      router.push('/login')
    },
  })
}

export const useUserQuery = () =>
  queryOptions({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data.data
    },
  })
