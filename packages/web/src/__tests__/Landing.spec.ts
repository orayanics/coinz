import { describe, it, expect } from 'vitest'

import { mount, RouterLinkStub } from '@vue/test-utils'
import LandingView from '../views/LandingView.vue'

const wrapper = mount(LandingView, {
  global: {
    stubs: {
      RouterLink: RouterLinkStub,
    },
  },
})

describe('LandingView', () => {
  it('renders the landing page', () => {
    expect(LandingView).toBeTruthy()
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toContain('Manage your money,  your wallets, your way.')
  })

  it('renders the Get Started Button', () => {
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Get Started')
    expect(link.props('to')).toBe('/register')
  })

  it('redirects to /register when Get Started is clicked', async () => {
    const link = wrapper.findComponent(RouterLinkStub)
    await link.trigger('click')
    expect(link.props('to')).toBe('/register')
  })
})
