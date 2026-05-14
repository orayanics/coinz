import { ref } from 'vue'
import * as z from 'zod'
import { useRoute, useRouter } from 'vue-router'

import { LoginPlain, type LoginSchema } from './schema'
import { useLogin } from '@/api/useAuth'
import { isAxiosError } from 'axios'

export const useLoginForm = () => {
  const router = useRouter()
  const route = useRoute()
  const serverError = ref<string | null>(null)

  const formErrors = ref<z.core.$ZodFlattenedError<LoginSchema> | null>(null)
  const form = ref({ email: '', password: '' })

  const { mutate: login, isPending } = useLogin()

  const onFormSubmit = (_event: Event) => {
    const isValid = LoginPlain.safeParse(form.value)

    if (!isValid.success) {
      formErrors.value = z.flattenError(isValid.error)
      return
    }

    formErrors.value = null

    login(form.value, {
      onSuccess: () => {
        const redirect = route.query.redirect as string | undefined
        router.push(redirect ?? '/dashboard')
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
