import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import App from '../App.vue'
import LandingView from '@/views/LandingView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

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
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

const wrapper = mount(App, {
  global: {
    plugins: [router],
  },
})

describe('App', () => {
  it('mounts and renders RouterView', () => {
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })
})
