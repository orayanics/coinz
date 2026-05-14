import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, ref, nextTick } from 'vue'

import WalletDetail from '@/modules/wallets/WalletDetail.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'
import type { TWallet } from '@/modules/wallets/schema'
import type { PaginatedWalletItems } from '@/api/useWalletItem'

const openCreateItem = vi.fn()
const openUpdateWallet = vi.fn()
const openDeleteWallet = vi.fn()
const openDeleteItem = vi.fn()
const openUpdateItem = vi.fn()

const walletQueryState = {
  data: ref<TWallet | null>(null),
  isLoading: ref(false),
  isError: ref(false),
}

const walletItemsQueryState = {
  data: ref<PaginatedWalletItems | null>(null),
  isLoading: ref(false),
  isError: ref(false),
}

const useQueryMock = vi.fn()

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/vue-query')>()
  return {
    ...actual,
    useQuery: (options: unknown) => useQueryMock(options),
  }
})

vi.mock('@/modules/wallets/hooks/useDeleteWallet', () => ({
  useDeleteWallet: () => ({ open: openDeleteWallet }),
}))

vi.mock('@/modules/wallets/hooks/useUpdateWallet', () => ({
  useUpdateWallet: () => ({ open: openUpdateWallet }),
}))

vi.mock('@/modules/wallet_item/hooks/useCreateWalletItem', () => ({
  useCreateWalletItem: () => ({ open: openCreateItem }),
}))

vi.mock('@/modules/wallet_item/hooks/useDeleteWalletItem', () => ({
  useDeleteWalletItem: () => ({ open: openDeleteItem }),
}))

vi.mock('@/modules/wallet_item/hooks/useUpdateWalletItem', () => ({
  useUpdateWalletItem: () => ({ open: openUpdateItem }),
}))

const WalletCardStub = defineComponent({
  props: ['wallet'],
  template: '<div class="wallet-card">{{ wallet.name }} - {{ wallet.balance }}</div>',
})

const UpdateWalletItemStub = defineComponent({
  props: ['item', 'walletId', 'itemId'],
  template: '<div class="update-wallet-item" />',
})

const DeleteWalletItemStub = defineComponent({
  props: ['walletId', 'itemId'],
  template: '<div class="delete-wallet-item" />',
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/app/wallets/:walletId',
      component: defineComponent({ template: '<div />' }),
    },
  ],
})

describe('Wallet Component', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(async () => {
    openCreateItem.mockClear()
    openUpdateWallet.mockClear()
    openDeleteWallet.mockClear()
    openDeleteItem.mockClear()
    openUpdateItem.mockClear()

    walletQueryState.data.value = {
      id: 'wallet-1',
      user_id: 'user-1',
      balance: 1200,
      name: 'Main Wallet',
      color: '#f94144',
      is_archived: false,
      created_at: new Date(),
      updated_at: new Date(),
    }
    walletQueryState.isLoading.value = false
    walletQueryState.isError.value = false

    walletItemsQueryState.data.value = {
      items: [
        {
          id: 'item-1',
          wallet_id: 'wallet-1',
          type: 'EXPENSE',
          amount: 25,
          note: 'Coffee',
          date: new Date('2024-01-01'),
        },
      ],
      meta: { total_pages: 2, total: 1, page: 1, limit: 10 },
    }
    walletItemsQueryState.isLoading.value = false
    walletItemsQueryState.isError.value = false

    useQueryMock.mockReset()
    useQueryMock
      .mockImplementationOnce(() => walletQueryState)
      .mockImplementationOnce(() => walletItemsQueryState)

    await router.push('/app/wallets/wallet-1')
    await router.isReady()

    wrapper = mount(WalletDetail, {
      global: {
        plugins: [router],
        stubs: {
          WalletCard: WalletCardStub,
          DeleteWallet: defineComponent({ template: '<div class="delete-wallet" />' }),
          UpdateWallet: defineComponent({ template: '<div class="update-wallet" />' }),
          CreateWalletItem: defineComponent({ template: '<div class="create-wallet-item" />' }),
          DeleteWalletItem: DeleteWalletItemStub,
          UpdateWalletItem: UpdateWalletItemStub,
          PhMagnifyingGlass: true,
          PhPlus: true,
          PhMinus: true,
          PhPencil: true,
          PhTrash: true,
        },
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders wallet details', () => {
    expect(wrapper.find('.wallet-card').text()).toContain('Main Wallet')
  })

  it('renders empty state when no wallet details', async () => {
    walletQueryState.data.value = null
    await nextTick()
    expect(wrapper.findComponent(StateNull).exists()).toBe(true)
  })

  it('renders error state when fetching wallet details fails', async () => {
    walletQueryState.isError.value = true
    await nextTick()
    expect(wrapper.findComponent(StateError).exists()).toBe(true)
  })

  it('renders loading state when fetching wallet details is in progress', async () => {
    walletQueryState.isLoading.value = true
    await nextTick()
    expect(wrapper.findComponent(StateLoading).exists()).toBe(true)
  })

  it('renders wallet details with correct data', () => {
    const card = wrapper.find('.wallet-card')
    expect(card.text()).toContain('Main Wallet')
    expect(card.text()).toContain('1200')
  })

  it('handles add transaction button click events', async () => {
    const addButton = wrapper
      .findAll('button.btn')
      .find((button) => button.text().includes('Add Item'))
    expect(addButton).toBeTruthy()
    await addButton!.trigger('click')
    expect(openCreateItem).toHaveBeenCalled()
  })

  it('handles edit button click events', async () => {
    const editButton = wrapper
      .findAll('button.btn')
      .find((button) => button.text().includes('Edit Wallet'))
    expect(editButton).toBeTruthy()
    await editButton!.trigger('click')
    expect(openUpdateWallet).toHaveBeenCalled()
  })

  it('handles delete button click events', async () => {
    const deleteButton = wrapper
      .findAll('button.btn')
      .find((button) => button.text().includes('Delete Wallet'))
    expect(deleteButton).toBeTruthy()
    await deleteButton!.trigger('click')
    expect(openDeleteWallet).toHaveBeenCalled()
  })

  it('handles edit transaction click event with correct data', async () => {
    const editButton = wrapper.find('button.btn-square')
    await editButton.trigger('click')
    await nextTick()

    expect(openUpdateItem).toHaveBeenCalled()

    const modal = wrapper.findComponent(UpdateWalletItemStub)
    expect(modal.props('item').note).toBe('Coffee')
    expect(modal.props('itemId')).toBe('item-1')
    expect(modal.props('walletId')).toBe('wallet-1')
  })

  it('handles delete transaction click event', async () => {
    const buttons = wrapper.findAll('button.btn-square')
    const deleteButton = buttons[1]
    if (!deleteButton) throw new Error('Delete transaction button not found')
    await deleteButton.trigger('click')
    await nextTick()

    expect(openDeleteItem).toHaveBeenCalled()

    const modal = wrapper.findComponent(DeleteWalletItemStub)
    expect(modal.props('itemId')).toBe('item-1')
    expect(modal.props('walletId')).toBe('wallet-1')
  })

  it('search filters transactions based on search input', async () => {
    vi.useFakeTimers()
    await router.replace({ query: { page: '2' } })

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('coffee')

    vi.advanceTimersByTime(450)
    await nextTick()
    await flushPromises()

    expect(router.currentRoute.value.query.search).toBe('coffee')
    expect(String(router.currentRoute.value.query.page)).toBe('1')
  })

  it('filters expense newest and oldest', async () => {
    const expenseButton = wrapper
      .findAll('button.btn')
      .find((button) => button.text().includes('Expense'))
    expect(expenseButton).toBeTruthy()
    await expenseButton!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(router.currentRoute.value.query.filter).toBe('EXPENSE')

    const sortSelect = wrapper.find('select')
    await sortSelect.setValue('asc')
    await flushPromises()
    await nextTick()

    expect(router.currentRoute.value.query.sort).toBe('asc')
  })

  it('filters income newest and oldest', async () => {
    const incomeButton = wrapper
      .findAll('button.btn')
      .find((button) => button.text().includes('Income'))
    expect(incomeButton).toBeTruthy()
    await incomeButton!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(router.currentRoute.value.query.filter).toBe('INCOME')

    const sortSelect = wrapper.find('select')
    await sortSelect.setValue('desc')
    await flushPromises()
    await nextTick()

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
})
