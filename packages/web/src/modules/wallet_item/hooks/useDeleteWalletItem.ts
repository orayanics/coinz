import { ref, type Ref } from 'vue'
import { useModal } from '@/utils/useModal'
import { useMutation } from '@tanstack/vue-query'
import { deleteWalletItemMutationOptions, walletItemKeys } from '@/api/useWalletItem'
import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { walletKeys } from '@/api/useWallets'
import { dashboardKeys } from '@/api/useDashboard'

const walletItemDeleteModal = useModal()
export const useDeleteWalletItem = () => walletItemDeleteModal

export const useDeleteWalletItemForm = ({
  walletId,
  itemId,
}: {
  walletId: Ref<string | undefined>
  itemId: Ref<string | undefined>
}) => {
  const queryClient = useQueryClient()
  const { close } = useDeleteWalletItem()
  const serverError = ref<string | null | undefined>(null)

  const { mutateAsync, isPending } = useMutation({
    ...deleteWalletItemMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: walletItemKeys.all,
      })
      await queryClient.invalidateQueries({
        queryKey: walletKeys.all,
      })
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      close()
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
    onFormSubmit: () => mutateAsync({ walletId: walletId.value!, itemId: itemId.value! }),
  }
}
