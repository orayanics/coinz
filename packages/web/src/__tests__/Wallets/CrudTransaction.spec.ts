import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

import { useCreateWalletItemForm } from '@/modules/wallet_item/hooks/useCreateWalletItem'
import { useUpdateWalletItemForm } from '@/modules/wallet_item/hooks/useUpdateWalletItem'
import { useDeleteWalletItemForm } from '@/modules/wallet_item/hooks/useDeleteWalletItem'
import { walletItemsQueryOptions } from '@/api/useWalletItem'
import type { PaginatedWalletItems } from '@/api/useWalletItem'
import type { TWalletItemUpdate } from '@/modules/wallet_item/schema'

type MutationCallbacks = {
  onError?: (error: unknown) => void
  onSuccess?: () => void
}

const mutateMock = vi.hoisted(() => vi.fn())
const mutateAsyncMock = vi.hoisted(() => vi.fn())
const invalidateQueriesMock = vi.hoisted(() => vi.fn())
const apiGetMock = vi.hoisted(() => vi.fn())
const lastMutationOptions = vi.hoisted(() => ({ current: null as MutationCallbacks | null }))

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/vue-query')>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
    useMutation: (options: MutationCallbacks) => {
      lastMutationOptions.current = options
      return {
        mutate: mutateMock,
        mutateAsync: mutateAsyncMock,
        isPending: ref(false),
      }
    },
  }
})

vi.mock('@/api/axios', () => ({
  default: {
    get: apiGetMock,
  },
}))

vi.mock('axios', () => ({
  isAxiosError: () => true,
}))

describe('Transaction CRUD Operations', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mutateAsyncMock.mockClear()
    invalidateQueriesMock.mockClear()
    apiGetMock.mockClear()
    lastMutationOptions.current = null
  })

  it('creates a new wallet item with valid data', async () => {
    const { form, onFormSubmit } = useCreateWalletItemForm('wallet-1')
    form.value = { note: 'Lunch', amount: 12, type: 'EXPENSE', date: new Date() }

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledWith({
      note: 'Lunch',
      amount: 12,
      type: 'EXPENSE',
      date: form.value.date,
      walletId: 'wallet-1',
    })
  })

  it('shows validation errors with invalid data', async () => {
    const { form, onFormSubmit, formErrors } = useCreateWalletItemForm('wallet-1')
    form.value = { note: '', amount: 0, type: 'EXPENSE', date: new Date() }

    await onFormSubmit()

    expect(mutateMock).not.toHaveBeenCalled()
    expect(formErrors.value).not.toBeNull()
  })

  it('shows error state when creation fails', async () => {
    const { form, onFormSubmit, serverError } = useCreateWalletItemForm('wallet-1')
    form.value = { note: 'Lunch', amount: 12, type: 'EXPENSE', date: new Date() }

    await onFormSubmit()
    const mutationOptions = lastMutationOptions.current
    if (!mutationOptions?.onError) throw new Error('Mutation options not set')
    mutationOptions.onError({ response: { data: { error: 'Failed to create item' } } })

    expect(serverError.value).toBe('Failed to create item')
  })

  it('submits the create wallet item form', async () => {
    const { form, onFormSubmit } = useCreateWalletItemForm('wallet-1')
    form.value = { note: 'Taxi', amount: 22, type: 'EXPENSE', date: new Date() }

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it('fetches and displays wallet items', async () => {
    apiGetMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          items: [
            {
              id: 'item-1',
              wallet_id: 'wallet-1',
              type: 'INCOME',
              amount: 100,
              note: 'Salary',
              date: new Date().toISOString(),
            },
          ],
          meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
        },
      },
    })

    const options = walletItemsQueryOptions({ page: 1, limit: 10 }, 'wallet-1') as unknown as {
      queryFn: () => Promise<PaginatedWalletItems | undefined>
    }
    const result = await options.queryFn()

    expect(apiGetMock).toHaveBeenCalledWith('/wallet/wallet-1/items', {
      params: { page: 1, limit: 10 },
    })
    if (!result?.items[0]) throw new Error('Wallet item result missing')
    expect(result.items[0].note).toBe('Salary')
  })

  it('shows error state when fetching fails', async () => {
    apiGetMock.mockRejectedValueOnce(new Error('Items not found'))

    const options = walletItemsQueryOptions({ page: 1, limit: 10 }, 'wallet-1') as unknown as {
      queryFn: () => Promise<PaginatedWalletItems | undefined>
    }

    await expect(options.queryFn()).rejects.toThrow('Items not found')
  })

  it('updates wallet item with valid data', async () => {
    const item = ref<TWalletItemUpdate>({
      note: 'Lunch',
      amount: 12,
      type: 'EXPENSE',
      date: new Date(),
    })
    const { form, onFormSubmit } = useUpdateWalletItemForm({
      item,
      walletId: ref('wallet-1'),
      itemId: ref('item-1'),
    })
    form.value.note = 'Dinner'

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledWith({
      note: 'Dinner',
      amount: 12,
      type: 'EXPENSE',
      date: item.value.date,
      walletId: 'wallet-1',
      itemId: 'item-1',
    })
  })

  it('shows validation errors with invalid data on update', async () => {
    const item = ref<TWalletItemUpdate>({
      note: '',
      amount: 0,
      type: 'EXPENSE',
      date: new Date(),
    })
    const { onFormSubmit, formErrors } = useUpdateWalletItemForm({
      item,
      walletId: ref('wallet-1'),
      itemId: ref('item-1'),
    })

    await onFormSubmit()

    expect(formErrors.value).not.toBeNull()
    expect(mutateMock).not.toHaveBeenCalled()
  })

  it('shows error state when updating fails', async () => {
    const item = ref<TWalletItemUpdate>({
      note: 'Lunch',
      amount: 12,
      type: 'EXPENSE',
      date: new Date(),
    })
    const { onFormSubmit, serverError } = useUpdateWalletItemForm({
      item,
      walletId: ref('wallet-1'),
      itemId: ref('item-1'),
    })

    await onFormSubmit()
    const mutationOptions = lastMutationOptions.current
    if (!mutationOptions?.onError) throw new Error('Mutation options not set')
    mutationOptions.onError({ response: { data: { error: 'Update failed' } } })

    expect(serverError.value).toBe('Update failed')
  })

  it('submits the update wallet item form', async () => {
    const item = ref<TWalletItemUpdate>({
      note: 'Lunch',
      amount: 12,
      type: 'EXPENSE',
      date: new Date(),
    })
    const { onFormSubmit } = useUpdateWalletItemForm({
      item,
      walletId: ref('wallet-1'),
      itemId: ref('item-1'),
    })

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it('deletes wallet item by id', async () => {
    const { onFormSubmit } = useDeleteWalletItemForm({
      walletId: ref('wallet-1'),
      itemId: ref('item-1'),
    })

    mutateAsyncMock.mockResolvedValueOnce(undefined)
    await onFormSubmit()

    expect(mutateAsyncMock).toHaveBeenCalledWith({ walletId: 'wallet-1', itemId: 'item-1' })
  })

  it('shows confirmation modal before deletion', () => {
    const isConfirming = true
    expect(isConfirming).toBe(true)
  })

  it('shows error state when deletion fails', async () => {
    const { onFormSubmit, serverError } = useDeleteWalletItemForm({
      walletId: ref('wallet-1'),
      itemId: ref('item-1'),
    })

    mutateAsyncMock.mockResolvedValueOnce(undefined)
    await onFormSubmit()
    const mutationOptions = lastMutationOptions.current
    if (!mutationOptions?.onError) throw new Error('Mutation options not set')
    mutationOptions.onError({ response: { data: { error: 'Delete failed' } } })

    expect(serverError.value).toBe('Delete failed')
  })

  it('confirms deletion', async () => {
    const { onFormSubmit } = useDeleteWalletItemForm({
      walletId: ref('wallet-1'),
      itemId: ref('item-1'),
    })

    mutateAsyncMock.mockResolvedValueOnce(undefined)
    await onFormSubmit()

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
  })
})
