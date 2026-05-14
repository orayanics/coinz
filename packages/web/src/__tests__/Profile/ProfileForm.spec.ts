import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, ref, nextTick } from 'vue'

import * as z from 'zod'
import { ProfileUpdateSchema } from '@/modules/profile/schema'
import type { ProfileSchema } from '@/modules/profile/schema'
import ProfileForm from '@/modules/profile/components/ProfileForm.vue'

const mockState = {
  form: ref<ProfileSchema>({
    name: '',
    old_password: '',
    new_password: '',
    confirm_password: '',
  }),
  onFormSubmit: vi.fn(),
  serverError: ref<string | null>(null),
  isPending: ref<boolean>(false),
  formErrors: ref<z.core.$ZodFlattenedError<ProfileSchema> | null>(null),
}

vi.mock('@/modules/profile/hooks/useProfileForm', () => ({
  default: () => mockState,
  useProfileForm: () => mockState,
}))

describe('ProfileForm', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    mockState.onFormSubmit.mockClear()
    wrapper = mount(ProfileForm, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
        plugins: [[VueQueryPlugin, new QueryClient()]],
      },
    })
  })

  it('renders profile form content', () => {
    expect(ProfileForm).toBeTruthy()
    expect(wrapper.find('.form-name').exists()).toBe(true)
    expect(wrapper.find('.form-oldpass').exists()).toBe(true)
    expect(wrapper.find('.form-newpass').exists()).toBe(true)
    expect(wrapper.find('.form-confpass').exists()).toBe(true)
    expect(wrapper.find('.btn-submit').exists()).toBe(true)
  })

  it('displays form validation errors', async () => {
    const result = ProfileUpdateSchema.safeParse({
      name: '',
      old_password: '',
      new_password: 'weak',
      confirm_password: 'mismatch',
    })
    expect(result.success).toBe(false)

    if (!result.success) {
      mockState.formErrors.value = z.flattenError(result.error)
    }

    await nextTick()

    const nameError = wrapper.find('.error-name')
    const oldPasswordError = wrapper.find('.error-oldpass')
    const newPasswordError = wrapper.find('.error-newpass')
    const confirmPasswordError = wrapper.find('.error-confpass')

    expect(nameError.exists()).toBe(true)
    expect(nameError.text()).toBe('Name is required')
    expect(oldPasswordError.exists()).toBe(true)
    expect(oldPasswordError.text()).toBe('Old password is required when changing password')
    expect(newPasswordError.exists()).toBe(true)
    expect(newPasswordError.text()).toBe('Password must be at least 8 characters')
    expect(confirmPasswordError.exists()).toBe(true)
    expect(confirmPasswordError.text()).toBe('Passwords do not match')
  })

  it('displays server error messages', async () => {
    const errorMessage = 'Failed to update profile'
    mockState.serverError.value = errorMessage

    await nextTick()

    const serverError = wrapper.find('.error-server')
    expect(serverError.exists()).toBe(true)
    expect(serverError.text()).toBe(errorMessage)
  })

  it('disables submit button while pending', async () => {
    mockState.isPending.value = true

    await nextTick()

    const submitButton = wrapper.find('.btn-submit')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('submits the profile form', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(mockState.onFormSubmit).toHaveBeenCalled()
  })
})
