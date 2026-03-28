import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from '@/utils/useModal'
import { useMutation } from '@tanstack/vue-query'
import { deleteWalletMutationOptions, walletKeys } from '@/api/useWallets'
import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { dashboardKeys } from '@/api/useDashboard'

const walletDeleteModal = useModal()
export const useDeleteWallet = () => walletDeleteModal

export const useDeleteWalletForm = (walletId: string) => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { close } = useDeleteWallet()

  const serverError = ref<string | null | undefined>(null)

  const { mutateAsync, isPending } = useMutation({
    ...deleteWalletMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      close()
      router.push('/app/wallets')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        serverError.value = error.response?.data.error
      }
    },
  })

  return {
    serverError,
    isLoading: isPending,
    onFormSubmit: () => mutateAsync(walletId),
  }
}
