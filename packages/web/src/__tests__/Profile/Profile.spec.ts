import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, ref, nextTick } from 'vue'

import Profile from '@/modules/profile/ProfileView.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'

let wrapper: ReturnType<typeof mount>

const queryState = {
  data: ref<{ email: string; name: string } | null>({ email: 'test@sample.com', name: 'test' }),
  isLoading: ref(false),
  isError: ref(false),
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: defineComponent({ template: '<div />' }),
    },
    {
      path: '/dashboard',
      component: defineComponent({ template: '<div />' }),
    },
  ],
})

// Current behavior: not null, not loading, not error, with user data
vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/vue-query')>()
  return {
    ...actual,
    useQuery: () => ({
      data: queryState.data,
      isLoading: queryState.isLoading,
      isError: queryState.isError,
    }),
  }
})

describe('Profile View', () => {
  beforeEach(async () => {
    queryState.data.value = { email: 'test@sample.com', name: 'test' }
    queryState.isLoading.value = false
    queryState.isError.value = false

    wrapper = mount(Profile, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
        plugins: [router, [VueQueryPlugin, new QueryClient()]],
      },
    })
  })

  it('renders the profile view', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('redirects to dashboard on cancel', async () => {
    const cancel = wrapper.findComponent(RouterLinkStub)
    expect(cancel.exists()).toBe(true)
    await cancel.trigger('click')
    expect(cancel.props().to).toBe('/dashboard')
  })

  it('shows the profile form on update profile click', async () => {
    const updateButton = wrapper.find('button[name="updateProfile"]')
    expect(updateButton.exists()).toBe(true)
    await updateButton.trigger('click')
    const profileForm = wrapper.findComponent({ name: 'ProfileForm' })
    expect(profileForm.exists()).toBe(true)
  })

  it('should not display loading state', () => {
    const loadingState = wrapper.findComponent(StateLoading)
    expect(loadingState.exists()).toBe(false)
  })

  it('should not display error state', async () => {
    const errorState = wrapper.findComponent(StateError)
    expect(errorState.exists()).toBe(false)
  })

  it('should not display null state', async () => {
    const nullState = wrapper.findComponent(StateNull)
    expect(nullState.exists()).toBe(false)
  })

  it('displays user data', async () => {
    const email = wrapper.find('p.text-sm')
    expect(email.exists()).toBe(true)
    expect(email.text()).toBe('test@sample.com')
    const name = wrapper.find('p.font-semibold.text-lg')
    expect(name.exists()).toBe(true)
    expect(name.text()).toBe('test')
  })

  it('displays loading state when query is loading', async () => {
    queryState.data.value = null
    queryState.isLoading.value = true
    queryState.isError.value = false

    await nextTick()

    expect(wrapper.findComponent(StateLoading).exists()).toBe(true)
    expect(wrapper.findComponent(StateError).exists()).toBe(false)
    expect(wrapper.findComponent(StateNull).exists()).toBe(false)
  })

  it('displays error state when query fails', async () => {
    queryState.data.value = null
    queryState.isLoading.value = false
    queryState.isError.value = true

    await nextTick()

    expect(wrapper.findComponent(StateLoading).exists()).toBe(false)
    expect(wrapper.findComponent(StateError).exists()).toBe(true)
    expect(wrapper.findComponent(StateNull).exists()).toBe(false)
  })

  it('displays null state when query has no data', async () => {
    queryState.data.value = null
    queryState.isLoading.value = false
    queryState.isError.value = false

    await nextTick()

    expect(wrapper.findComponent(StateLoading).exists()).toBe(false)
    expect(wrapper.findComponent(StateError).exists()).toBe(false)
    expect(wrapper.findComponent(StateNull).exists()).toBe(true)
  })
})
