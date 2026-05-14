import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

import { useLoginForm } from '@/modules/login/useLoginForm'

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
  useLogin: () => ({
    mutate: mockMutate,
    isPending: ref(false),
  }),
}))

describe('useLoginForm', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockMutate.mockClear()
  })

  it('redirects to dashboard after successful login', () => {
    const { form, onFormSubmit } = useLoginForm()
    form.value = { email: 'test@example.com', password: 'password123' }

    mockMutate.mockImplementation((_body, options) => {
      options?.onSuccess?.()
    })

    onFormSubmit(new Event('submit'))

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})
