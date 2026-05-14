import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, nextTick, ref } from 'vue'

import DashboardView from '@/modules/dashboard/DashboardView.vue'
import OverviewFilters from '@/modules/dashboard/components/OverviewFilters.vue'
import WalletFilters from '@/modules/dashboard/components/WalletFilters.vue'
import PerWalletFilters from '@/modules/dashboard/components/PerWalletFilters.vue'
import type {
  TCrossWalletDashboard,
  TWalletDashboard,
  TWalletSummaryWithActivity,
} from '@/api/useDashboard'

type QueryState<T> = {
  data: ReturnType<typeof ref<T | null>>
  isLoading: ReturnType<typeof ref<boolean>>
  isError: ReturnType<typeof ref<boolean>>
}

type WalletListData = {
  items: TWalletSummaryWithActivity[]
  meta: { total: number; page: number; limit: number; total_pages: number }
}

const overviewState: QueryState<TCrossWalletDashboard> = {
  data: ref(null),
  isLoading: ref(false),
  isError: ref(false),
}

const walletListState: QueryState<WalletListData> = {
  data: ref(null),
  isLoading: ref(false),
  isError: ref(false),
}

const drilldownState: QueryState<TWalletDashboard> = {
  data: ref(null),
  isLoading: ref(false),
  isError: ref(false),
}

const useQueryMock = vi.fn()

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/vue-query')>()
  return {
    ...actual,
    useQuery: () => useQueryMock(),
  }
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/app/dashboard',
      component: defineComponent({ template: '<div />' }),
    },
    {
      path: '/app/wallets/:walletId',
      component: defineComponent({ template: '<div />' }),
    },
  ],
})

describe('Dashboard', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(async () => {
    overviewState.data.value = {
      aggregate_balance: { total: 1200, count_wallets: 2 },
      income_vs_expense: { total_income: 900, total_expense: 300, total_net: 600 },
    }
    overviewState.isLoading.value = false
    overviewState.isError.value = false

    walletListState.data.value = {
      items: [
        {
          id: 'wallet-1',
          name: 'Daily Wallet',
          color: '#f94144',
          is_archived: false,
          balance: 300,
          activity: 4,
          created_at: '2025-01-02',
        },
      ],
      meta: { total: 1, page: 1, limit: 5, total_pages: 2 },
    }
    walletListState.isLoading.value = false
    walletListState.isError.value = false

    drilldownState.data.value = {
      wallet: {
        id: 'wallet-1',
        name: 'Daily Wallet',
        color: '#f94144',
        is_archived: false,
        balance: 300,
      },
      net_change: { income: 200, expense: 50, net: 150 },
      average_transaction: { average: 25, count: 6, max: 60, min: 5 },
      balance_over_time: [
        { date: '2025-01-01', balance: 100 },
        { date: '2025-01-02', balance: 150 },
      ],
      spending_by_period: [{ period: '2025-01', income: 200, expense: 50, net: 150 }],
    }
    drilldownState.isLoading.value = false
    drilldownState.isError.value = false

    useQueryMock.mockReset()
    useQueryMock
      .mockImplementationOnce(() => overviewState)
      .mockImplementationOnce(() => walletListState)
      .mockImplementationOnce(() => drilldownState)

    Element.prototype.scrollIntoView = vi.fn()

    await router.push('/app/dashboard')
    await router.isReady()

    wrapper = mount(DashboardView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: RouterLinkStub,
          PhWallet: true,
          PhCoins: true,
        },
      },
    })
  })

  it('renders the dashboard page with the correct title and components', () => {
    expect(wrapper.text()).toContain('Wallets')
    expect(wrapper.text()).toContain('Total Balance')
    expect(wrapper.text()).toContain('Total Income')
    expect(wrapper.text()).toContain('Total Expenses')
  })

  it('filters months, years, and archived wallets', async () => {
    const overviewFilters = wrapper.findComponent(OverviewFilters)
    const selects = overviewFilters.findAll('select')
    const [monthSelect, yearSelect] = selects
    if (!monthSelect || !yearSelect) throw new Error('Overview filters missing')

    await monthSelect.setValue('3')
    await nextTick()
    await flushPromises()
    await yearSelect.setValue(String(new Date().getFullYear()))
    await nextTick()
    await flushPromises()
    await overviewFilters.find('input[type="checkbox"]').setValue(true)
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.month).toBe('3')
    expect(router.currentRoute.value.query.year).toBe(String(new Date().getFullYear()))
    expect(router.currentRoute.value.query.include_archived).toBe('true')
  })

  it('shows overview stats totals', () => {
    expect(wrapper.text()).toContain('1,200')
    expect(wrapper.text()).toContain('900')
    expect(wrapper.text()).toContain('300')
  })

  it('renders wallet overview list with name and balance', () => {
    expect(wrapper.text()).toContain('Daily Wallet')
    expect(wrapper.text()).toContain('Balance')
  })

  it('paginates wallet overview list', async () => {
    const paginationButtons = wrapper.findAll('button.join-item')
    const nextButton = paginationButtons[2]
    if (!nextButton) throw new Error('Next page button missing')

    await nextButton.trigger('click')
    await flushPromises()
    expect(String(router.currentRoute.value.query.page)).toBe('2')

    const prevButton = paginationButtons[0]
    if (!prevButton) throw new Error('Previous page button missing')
    await prevButton.trigger('click')
    await flushPromises()
    expect(String(router.currentRoute.value.query.page)).toBe('1')
  })

  it('filters wallet overview by sort and direction', async () => {
    const walletFilters = wrapper.findComponent(WalletFilters)
    const selects = walletFilters.findAll('select')
    const [sortBySelect, sortSelect] = selects
    if (!sortBySelect || !sortSelect) throw new Error('Wallet filters missing')

    await sortBySelect.setValue('name')
    await nextTick()
    await flushPromises()
    await sortSelect.setValue('asc')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.sortBy).toBe('name')
    expect(router.currentRoute.value.query.sort).toBe('asc')
  })

  it('displays per-wallet stats and transactions after selection', async () => {
    const walletCard = wrapper.find('.card')
    if (!walletCard.exists()) throw new Error('Wallet card missing')

    await walletCard.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Balance')
    expect(wrapper.text()).toContain('Income')
    expect(wrapper.text()).toContain('Expense')
    expect(wrapper.text()).toContain('Net')
    expect(wrapper.text()).toContain('Avg Transaction')
    expect(wrapper.text()).toContain('Largest')
    expect(wrapper.text()).toContain('Smallest')
  })

  it('filters per-wallet by month, year, type, and granularity', async () => {
    const walletCard = wrapper.find('.card')
    if (!walletCard.exists()) throw new Error('Wallet card missing')
    await walletCard.trigger('click')
    await nextTick()

    const perWalletFilters = wrapper.findComponent(PerWalletFilters)
    const selects = perWalletFilters.findAll('select')
    const [monthSelect, yearSelect, typeSelect, granularitySelect] = selects
    if (!monthSelect || !yearSelect || !typeSelect || !granularitySelect) {
      throw new Error('Per-wallet filters missing')
    }

    await monthSelect.setValue('2')
    await nextTick()
    await flushPromises()
    await yearSelect.setValue(String(new Date().getFullYear()))
    await nextTick()
    await flushPromises()
    await typeSelect.setValue('EXPENSE')
    await nextTick()
    await flushPromises()
    await granularitySelect.setValue('week')
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.month).toBe('2')
    expect(router.currentRoute.value.query.year).toBe(String(new Date().getFullYear()))
    expect(router.currentRoute.value.query.type).toBe('EXPENSE')
    expect(router.currentRoute.value.query.granularity).toBe('week')
  })

  it('displays balance over time and monthly breakdown charts', async () => {
    const walletCard = wrapper.find('.card')
    if (!walletCard.exists()) throw new Error('Wallet card missing')
    await walletCard.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Balance Over Time')
    expect(wrapper.text()).toContain('Monthly Breakdown')
  })
})
