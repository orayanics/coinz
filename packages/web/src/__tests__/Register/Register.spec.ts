import { ref, nextTick } from 'vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import * as z from 'zod'
import RegisterView from '@/modules/register/RegisterView.vue'
import { RegisterPlain } from '@/modules/register/schema'
import type { RegisterSchema } from '@/modules/register/schema'

const mockState = {
  form: ref({ name: '', email: '', password: '' }),
  onFormSubmit: vi.fn(),
  serverError: ref<string | null>(null),
  isPending: ref<boolean>(false),
  formErrors: ref<z.core.$ZodFlattenedError<RegisterSchema> | null>(null),
}

vi.mock('@/modules/register/useRegisterForm', () => ({
  useRegisterForm: () => mockState,
}))

describe('RegisterView', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    setActivePinia(createPinia())
    mockState.onFormSubmit.mockClear()
    wrapper = mount(RegisterView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
        components: {
          PhWarning: {
            template: '<span />',
          },
        },
      },
    })
  })

  it('renders register page content', () => {
    expect(RegisterView).toBeTruthy()
    expect(wrapper.text()).toContain('Get started with your digital wallet')
    expect(wrapper.text()).toContain('Register')
    expect(wrapper.text()).toContain('coinz')
  })

  it('displays form validation errors', async () => {
    const result = RegisterPlain.safeParse({ name: '', email: 'invalid-email', password: '' })
    expect(result.success).toBe(false)

    if (!result.success) {
      mockState.formErrors.value = z.flattenError(result.error)
    }

    await nextTick()

    expect(wrapper.text()).toContain('Name must be at least 2 characters')
    expect(wrapper.text()).toContain('Invalid email address')
    expect(wrapper.text()).toContain('Password must be at least 8 characters')
  })

  it('displays server error messages', async () => {
    const errorMessage = 'Registration failed'
    mockState.serverError.value = errorMessage

    await nextTick()

    expect(wrapper.text()).toContain(errorMessage)
  })

  it('disables submit button while pending', async () => {
    mockState.isPending.value = true

    await nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('submits the register form', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(mockState.onFormSubmit).toHaveBeenCalled()
  })

  it('redirects to home when clicking coinz', async () => {
    const homeLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text() === 'coinz')
    expect(homeLink).toBeTruthy()
    await homeLink!.trigger('click')
    expect(homeLink!.props('to')).toBe('/')
  })

  it('redirects to login when clicking Access your wallets', async () => {
    const loginLInk = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text() === 'Access your wallets')
    expect(loginLInk).toBeTruthy()
    await loginLInk!.trigger('click')
    expect(loginLInk!.props('to')).toBe('/login')
  })
})
