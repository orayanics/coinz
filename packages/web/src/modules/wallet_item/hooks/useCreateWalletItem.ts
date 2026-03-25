import { ref } from 'vue'
import * as z from 'zod'
import { WalletItemCreateSchema, type TWalletItemCreate } from '../schema'
import { useModal } from '@/utils/useModal'
import { useMutation } from '@tanstack/vue-query'
import { walletKeys } from '@/api/useWallets'
import { walletItemKeys } from '@/api/useWalletItem'
import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { createWalletItemMutationOptions } from '@/api/useWalletItem'

const walletItemCreateModal = useModal()
export const useCreateWalletItem = () => walletItemCreateModal

export const useCreateWalletItemForm = (walletId: string) => {
  const queryClient = useQueryClient()
  const { close } = useCreateWalletItem()

  const formErrors = ref<z.core.$ZodFlattenedError<TWalletItemCreate> | null>(null)
  const form = ref<TWalletItemCreate>({
    note: '',
    amount: 0,
    type: 'EXPENSE',
    date: new Date(),
  })
  const serverError = ref<string | null | undefined>(null)

  const reset = () => {
    form.value = { note: '', amount: 0, type: 'EXPENSE', date: new Date() }
    formErrors.value = null
  }

  const { mutate, isPending } = useMutation({
    ...createWalletItemMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: walletItemKeys.list(walletId, { page: 1, limit: 10 }),
      })
      await queryClient.invalidateQueries({
        queryKey: walletKeys.detail(walletId),
      })
      close()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        serverError.value = error.response?.data.error
      }
    },
  })

  const onFormSubmit = async () => {
    const isValid = WalletItemCreateSchema.safeParse(form.value)

    if (!isValid.success) {
      formErrors.value = z.flattenError(isValid.error)
      return
    }

    formErrors.value = null
    mutate({ ...isValid.data, walletId: walletId })
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
