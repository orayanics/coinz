import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import PublicLayout from '@/components/Layout/PublicLayout.vue'

const RouterViewStub = defineComponent({
  name: 'RouterView',
  setup(_, { slots }) {
    const Component = defineComponent({
      name: 'StubView',
      setup() {
        return () => h('div', { class: 'router-view-content' }, 'View Content')
      },
    })

    return () => slots.default?.({ Component }) ?? null
  },
})

describe('PublicLayout', () => {
  it('renders routed view content from RouterView', () => {
    const wrapper = mount(PublicLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: RouterViewStub,
        },
      },
    })

    const content = wrapper.find('.router-view-content')
    expect(content.exists()).toBe(true)
    expect(content.text()).toBe('View Content')
  })

  it('does not render default slot content', () => {
    const wrapper = mount(PublicLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: RouterViewStub,
        },
      },
      slots: {
        default: '<div class="test-content">Test Content</div>',
      },
    })

    expect(wrapper.find('.test-content').exists()).toBe(false)
  })

  it('renders the nav', () => {
    const wrapper = mount(PublicLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: RouterViewStub,
        },
      },
    })

    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    const links = nav.findAllComponents(RouterLinkStub)
    expect(links.length).toBe(3)
    expect(links[0].text()).toBe('coinz')
    expect(links[0].props('to')).toBe('/')
    expect(links[1].text()).toBe('Login')
    expect(links[1].props('to')).toBe('/login')
    expect(links[2].text()).toBe('Create an account')
    expect(links[2].props('to')).toBe('/register')
  })

  it('redirects to /login when Login link is clicked', async () => {
    const wrapper = mount(PublicLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: RouterViewStub,
        },
      },
    })

    const loginLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text() === 'Login')
    expect(loginLink).toBeTruthy()
    await loginLink!.trigger('click')
    expect(loginLink!.props('to')).toBe('/login')
  })

  it('redirects to /register when Create an account link is clicked', async () => {
    const wrapper = mount(PublicLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: RouterViewStub,
        },
      },
    })

    const registerLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text() === 'Create an account')
    expect(registerLink).toBeTruthy()
    await registerLink!.trigger('click')
    expect(registerLink!.props('to')).toBe('/register')
  })

  it('redirects to / when coinz link is clicked', async () => {
    const wrapper = mount(PublicLayout, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: RouterViewStub,
        },
      },
    })

    const homeLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text() === 'coinz')
    expect(homeLink).toBeTruthy()
    await homeLink!.trigger('click')
    expect(homeLink!.props('to')).toBe('/')
  })
})
