import { ref, watch, type Ref } from 'vue'
import * as z from 'zod'
import { WalletUpdateSchema, type TWalletUpdate } from '../schema'
import { useModal } from '@/utils/useModal'
import { useMutation } from '@tanstack/vue-query'
import { updateWalletMutationOptions, walletKeys } from '@/api/useWallets'
import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { walletItemKeys } from '@/api/useWalletItem'
import { dashboardKeys } from '@/api/useDashboard'

const walletUpdateModal = useModal()
export const useUpdateWallet = () => walletUpdateModal

export const useUpdateWalletForm = ({
  wallet,
  walletId,
}: {
  wallet: Ref<TWalletUpdate>
  walletId: string
}) => {
  const queryClient = useQueryClient()
  const { close } = useUpdateWallet()

  const formErrors = ref<z.core.$ZodFlattenedError<TWalletUpdate> | null>(null)
  const form = ref<TWalletUpdate>({ ...wallet.value })
  const serverError = ref<string | null | undefined>(null)

  watch(wallet, (val) => {
    form.value = { ...val }
  })

  const reset = () => {
    form.value = { ...wallet.value }
    formErrors.value = null
    serverError.value = null
  }

  const { mutate, isPending } = useMutation({
    ...updateWalletMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.detail(walletId) })
      await queryClient.invalidateQueries({ queryKey: walletItemKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      close()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        serverError.value = error.response?.data.error
      }
    },
  })

  const onFormSubmit = async () => {
    const isValid = WalletUpdateSchema.safeParse(form.value)

    if (!isValid.success) {
      formErrors.value = z.flattenError(isValid.error)
      return
    }

    formErrors.value = null
    mutate({ ...isValid.data, id: walletId })
  }

  return {
    formErrors,
    form,
    serverError,
    isPending,
    onFormSubmit,
    reset,
  }
}
