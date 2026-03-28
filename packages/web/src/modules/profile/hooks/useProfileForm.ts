import { ref } from 'vue'
import * as z from 'zod'

import { ProfileUpdateSchema } from '../schema'
import type { ProfileSchema } from '../schema'
import { useUpdateProfile } from '@/api/useProfile'
import { useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'

export const useProfileForm = () => {
  const queryClient = useQueryClient()
  const formErrors = ref<z.core.$ZodFlattenedError<ProfileSchema> | null>(null)
  const serverError = ref<string | null>(null)
  const form = ref({
    name: '',
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  const { mutate: update, isPending } = useUpdateProfile()

  const onFormSubmit = () => {
    const payload = {
      name: form.value.name || undefined,
      old_password: form.value.old_password || undefined,
      new_password: form.value.new_password || undefined,
      confirm_password: form.value.confirm_password || undefined,
    }

    const parsed = ProfileUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      formErrors.value = z.flattenError(parsed.error)
      return
    }

    formErrors.value = null

    update(parsed.data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['user'] })
        form.value = { name: '', old_password: '', new_password: '', confirm_password: '' }
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          serverError.value = error.response?.data.error
        }
      },
    })
  }

  return {
    form,
    onFormSubmit,
    serverError,
    isPending,
    formErrors,
  }
}

export default useProfileForm
