import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

import { useRegisterForm } from '@/modules/register/useRegisterForm'

const mockPush = vi.fn()
const mockMutate = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => ({
    query: {},
  }),
}))

vi.mock('@/api/useAuth', () => ({
  useRegister: () => ({
    mutate: mockMutate,
    isPending: ref(false),
  }),
}))

describe('useRegisterForm', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockMutate.mockClear()
  })

  it('redirects to login after successful registration', () => {
    const { form, onFormSubmit } = useRegisterForm()
    form.value = { name: 'example', email: 'test@example.com', password: 'Password123!' }

    mockMutate.mockImplementation((_body, options) => {
      options?.onSuccess?.()
    })

    onFormSubmit(new Event('submit'))

    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
