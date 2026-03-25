import { ref } from 'vue'
import * as z from 'zod'
import { useRoute, useRouter } from 'vue-router'

import { LoginPlain, type LoginSchema } from './schema'
import { useLogin } from '@/api/useAuth'

export const useLoginForm = () => {
  const router = useRouter()
  const route = useRoute()

  const formErrors = ref<z.core.$ZodFlattenedError<LoginSchema> | null>(null)
  const form = ref({ email: '', password: '' })

  const { mutate: login, isPending, error: serverError } = useLogin()

  const onFormSubmit = (event: Event) => {
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
