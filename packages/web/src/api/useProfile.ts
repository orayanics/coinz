import { useMutation, useQueryClient } from '@tanstack/vue-query'
import api from '@/api/axios'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: { name?: string; password?: string }) => {
      const { data } = await api.patch('/auth/profile', body, { withCredentials: true })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}
