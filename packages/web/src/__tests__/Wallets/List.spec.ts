import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, ref, nextTick } from 'vue'

import WalletsList from '@/modules/wallets/WalletsList.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'
import type { PaginatedWallets } from '@/api/useWallets'

const openCreateWallet = vi.fn()

const queryState = {
  data: ref<PaginatedWallets | null>(null),
  isLoading: ref(false),
  isError: ref(false),
}

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/vue-query')>()
  return {
    ...actual,
    useQuery: () => queryState,
  }
})

vi.mock('@/modules/wallets/hooks/useCreateWallet', () => ({
  useCreateWallet: () => ({ open: openCreateWallet }),
}))

const WalletCardStub = defineComponent({
  props: ['wallet'],
  template: '<div class="wallet-card">{{ wallet.name }} - {{ wallet.balance }}</div>',
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/app/wallets',
      component: defineComponent({ template: '<div />' }),
    },
    {
      path: '/app/wallets/:walletId',
      component: defineComponent({ template: '<div />' }),
    },
  ],
})

describe('Wallets List', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(async () => {
    openCreateWallet.mockClear()
    queryState.data.value = {
      items: [
        {
          id: 'wallet-1',
          user_id: 'user-1',
          balance: 240,
          name: 'Daily Wallet',
          color: '#f94144',
          is_archived: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      meta: { total_pages: 3, total: 1, page: 1, limit: 6 },
    }
    queryState.isLoading.value = false
    queryState.isError.value = false

    await router.push('/app/wallets')
    await router.isReady()
    await router.replace({ query: {} })

    wrapper = mount(WalletsList, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: RouterLinkStub,
          WalletCard: WalletCardStub,
          CreateWallet: defineComponent({ template: '<div data-test="create-wallet" />' }),
          PhMagnifyingGlass: true,
        },
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders list of wallets', () => {
    expect(wrapper.find('.wallet-card').text()).toContain('Daily Wallet')
  })

  it('renders empty state when no wallets', async () => {
    queryState.data.value = { items: [], meta: { total_pages: 1, total: 0, page: 1, limit: 6 } }
    await nextTick()
    expect(wrapper.findComponent(StateNull).exists()).toBe(true)
  })

  it('renders error state when fetching wallets fails', async () => {
    queryState.isError.value = true
    await nextTick()
    expect(wrapper.findComponent(StateError).exists()).toBe(true)
  })

  it('renders loading state when fetching wallets is in progress', async () => {
    queryState.isLoading.value = true
    await nextTick()
    expect(wrapper.findComponent(StateLoading).exists()).toBe(true)
  })

  it('renders wallet items with correct data', () => {
    const card = wrapper.find('.wallet-card')
    expect(card.text()).toContain('Daily Wallet')
    expect(card.text()).toContain('240')
  })

  it('handles wallet item click events by linking to wallet details', () => {
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.exists()).toBe(true)
    expect(link.props('to')).toBe('/app/wallets/wallet-1')
  })

  it('search filters wallets based on search input', async () => {
    vi.useFakeTimers()
    await router.replace({ query: { page: '2' } })

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('daily')

    vi.advanceTimersByTime(450)
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.search).toBe('daily')
    expect(String(router.currentRoute.value.query.page)).toBe('1')
  })

  it('filters by created newest and oldest', async () => {
    const [sortBySelect, sortSelect] = wrapper.findAll('select')
    if (!sortBySelect || !sortSelect) throw new Error('Select controls not found')

    await sortBySelect.setValue('created_at')
    await sortSelect.setValue('asc')
    await nextTick()
    await flushPromises()

    expect((sortBySelect.element as HTMLSelectElement).value).toBe('created_at')
    expect(router.currentRoute.value.query.sortBy ?? 'created_at').toBe('created_at')
    expect(router.currentRoute.value.query.sort).toBe('asc')
  })

  it('filters by updated newest and oldest', async () => {
    const [sortBySelect, sortSelect] = wrapper.findAll('select')
    if (!sortBySelect || !sortSelect) throw new Error('Select controls not found')

    await sortBySelect.setValue('updated_at')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.sortBy).toBe('updated_at')

    await sortSelect.setValue('desc')
    await nextTick()
    await flushPromises()
    expect(router.currentRoute.value.query.sort).toBe('desc')
  })

  it('paginates to next and previous page', async () => {
    const paginationButtons = wrapper.findAll('button.join-item')
    if (paginationButtons.length < 3) throw new Error('Pagination controls not found')

    const nextButton = paginationButtons[2]
    if (!nextButton) throw new Error('Next page button not found')
    await nextButton.trigger('click')
    await flushPromises()
    expect(String(router.currentRoute.value.query.page)).toBe('2')

    const prevButton = paginationButtons[0]
    if (!prevButton) throw new Error('Previous page button not found')
    await prevButton.trigger('click')
    await flushPromises()
    expect(String(router.currentRoute.value.query.page)).toBe('1')
  })

  it('opens modal on Add Wallet button click', async () => {
    const addButton = wrapper.find('button.btn-success')
    await addButton.trigger('click')
    expect(openCreateWallet).toHaveBeenCalled()
  })
})
