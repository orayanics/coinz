import { ref } from 'vue'
import * as z from 'zod'
import { WalletCreateSchema, type TWalletCreate } from '../schema'
import { useModal } from '@/utils/useModal'
import { useMutation } from '@tanstack/vue-query'
import { createWalletMutationOptions, walletKeys } from '@/api/useWallets'
import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { dashboardKeys } from '@/api/useDashboard'

const walletCreateModal = useModal()
export const useCreateWallet = () => walletCreateModal

export const useCreateWalletForm = () => {
  const queryClient = useQueryClient()
  const { close } = useCreateWallet()

  const formErrors = ref<z.core.$ZodFlattenedError<TWalletCreate> | null>(null)
  const form = ref<TWalletCreate>({
    name: '',
    balance: 0,
    color: '#94ff76',
  })
  const serverError = ref<string | null | undefined>(null)

  const reset = () => {
    form.value = { name: '', balance: 0, color: '#94ff76' }
    formErrors.value = null
  }

  const { mutate, isPending } = useMutation({
    ...createWalletMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.lists() })
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
    const isValid = WalletCreateSchema.safeParse(form.value)

    if (!isValid.success) {
      formErrors.value = z.flattenError(isValid.error)
      return
    }

    formErrors.value = null
    mutate(isValid.data)
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
