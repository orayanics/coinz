import { ref } from 'vue'
import * as z from 'zod'
import { useRoute, useRouter } from 'vue-router'

import { RegisterPlain, type RegisterSchema } from './schema'
import { useRegister } from '@/api/useAuth'
import { isAxiosError } from 'axios'

export const useRegisterForm = () => {
  const router = useRouter()
  const route = useRoute()
  const serverError = ref<string | null>(null)

  const formErrors = ref<z.core.$ZodFlattenedError<RegisterSchema> | null>(null)
  const form = ref({
    name: '',
    email: '',
    password: '',
  })

  const { mutate: register, isPending } = useRegister()

  const onFormSubmit = (event: Event) => {
    const isValid = RegisterPlain.safeParse(form.value)

    if (!isValid.success) {
      formErrors.value = z.flattenError(isValid.error)
      return
    }

    formErrors.value = null

    register(form.value, {
      onSuccess: () => {
        const redirect = route.query.redirect as string | undefined
        router.push(redirect ?? '/login')
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          serverError.value = error.response?.data.error || error.response?.data.message
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
