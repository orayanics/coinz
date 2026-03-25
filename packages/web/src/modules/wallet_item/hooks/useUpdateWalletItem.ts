import { ref, watch, type Ref } from 'vue'
import * as z from 'zod'
import { WalletItemUpdateSchema, type TWalletItemUpdate } from '../schema'
import { useModal } from '@/utils/useModal'
import { useMutation } from '@tanstack/vue-query'
import { updateWalletItemMutationOptions, walletItemKeys } from '@/api/useWalletItem'
import { walletKeys } from '@/api/useWallets'
import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'

const walletItemUpdateModal = useModal()
export const useUpdateWalletItem = () => walletItemUpdateModal

export const useUpdateWalletItemForm = ({
  item,
  walletId,
  itemId,
}: {
  item: Ref<TWalletItemUpdate | undefined>
  walletId: Ref<string | undefined>
  itemId: Ref<string | undefined>
}) => {
  const queryClient = useQueryClient()
  const { close } = useUpdateWalletItem()

  const formErrors = ref<z.core.$ZodFlattenedError<TWalletItemUpdate> | null>(null)
  const form = ref<TWalletItemUpdate>({ ...item.value })
  const serverError = ref<string | null | undefined>(null)

  watch(item, (val) => {
    form.value = { ...val }
  })

  const reset = () => {
    form.value = { ...item.value }
    formErrors.value = null
    serverError.value = null
  }

  const { mutate, isPending } = useMutation({
    ...updateWalletItemMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: walletItemKeys.lists(),
      })
      await queryClient.invalidateQueries({ queryKey: walletKeys.detail(walletId.value!) })
      close()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        serverError.value = error.response?.data.error
      }
    },
  })

  const onFormSubmit = async () => {
    const isValid = WalletItemUpdateSchema.safeParse(form.value)

    if (!isValid.success) {
      formErrors.value = z.flattenError(isValid.error)
      return
    }

    formErrors.value = null
    mutate({ ...isValid.data, walletId: walletId.value!, itemId: itemId.value! })
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
