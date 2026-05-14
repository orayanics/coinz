import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

import App from '../App.vue'
import LandingView from '@/views/LandingView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import RegisterView from '@/modules/register/RegisterView.vue'
import LoginView from '@/modules/login/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const mockAuthStore = reactive({
  accessToken: null as string | null,
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

const createTestRouter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: {
          template: '<router-view />',
        },
        children: [
          {
            path: '',
            name: 'home',
            component: LandingView,
          },
          {
            path: 'register',
            name: 'register',
            component: RegisterView,
          },
          {
            path: 'login',
            name: 'login',
            component: LoginView,
          },
        ],
      },
      {
        path: '/app',
        component: {
          template: '<router-view />',
        },
        meta: { requiresAuth: true },
        children: [
          {
            path: 'dashboard',
            name: 'dashboard',
            component: {
              template: '<div>Dashboard</div>',
            },
          },
        ],
      },

      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundView,
      },
    ],
  })

  router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.accessToken) {
      return { name: 'login' }
    }
    if (!to.meta.requiresAuth && auth.accessToken) {
      return { name: 'dashboard' }
    }
  })

  return router
}

let router: ReturnType<typeof createRouter>
let wrapper: ReturnType<typeof mount>

describe('Router', () => {
  beforeEach(async () => {
    mockAuthStore.accessToken = null
    router = createTestRouter()
    wrapper = mount(App, {
      global: {
        plugins: [router, createPinia(), [VueQueryPlugin, new QueryClient()]],
      },
    })

    await router.push('/')
    await router.isReady()
    await flushPromises()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders NotFoundView for non-existent routes', async () => {
    await router.push('/non-existent-route')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(wrapper.findComponent(NotFoundView).exists()).toBe(true)
  })

  it('redirects to /login when accessing protected routes without authentication', async () => {
    await router.push('/app/dashboard')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects to /dashboard when accessing public/guest routes with authentication', async () => {
    const auth = useAuthStore()
    auth.accessToken = 'mock-token'

    await router.push('/login')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
