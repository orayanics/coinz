import { ref, nextTick } from 'vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import * as z from 'zod'
import LoginView from '@/modules/login/LoginView.vue'
import { LoginPlain } from '@/modules/login/schema'
import type { LoginSchema } from '@/modules/login/schema'

const mockState = {
  form: ref({ email: '', password: '' }),
  onFormSubmit: vi.fn(),
  serverError: ref<string | null>(null),
  isPending: ref<boolean>(false),
  formErrors: ref<z.core.$ZodFlattenedError<LoginSchema> | null>(null),
}

vi.mock('@/modules/login/useLoginForm', () => ({
  useLoginForm: () => mockState,
}))

describe('LoginView', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    setActivePinia(createPinia())
    mockState.onFormSubmit.mockClear()
    wrapper = mount(LoginView, {
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

  it('renders login page content', () => {
    expect(LoginView).toBeTruthy()
    expect(wrapper.text()).toContain('Access your digital wallet')
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('coinz')
  })

  it('displays form validation errors', async () => {
    const result = LoginPlain.safeParse({ email: 'invalid-email', password: '' })
    expect(result.success).toBe(false)

    if (!result.success) {
      mockState.formErrors.value = z.flattenError(result.error)
    }

    await nextTick()

    expect(wrapper.text()).toContain('Invalid email address')
    expect(wrapper.text()).toContain('Password is required')
  })

  it('displays server error messages', async () => {
    const errorMessage = 'Invalid credentials'
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

  it('submits the login form', async () => {
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

  it('redirects to register when clicking Setup a wallet', async () => {
    const registerLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text() === 'Setup a wallet')
    expect(registerLink).toBeTruthy()
    await registerLink!.trigger('click')
    expect(registerLink!.props('to')).toBe('/register')
  })
})
