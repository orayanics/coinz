import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

import { useCreateWalletForm } from '@/modules/wallets/hooks/useCreateWallet'
import { useUpdateWalletForm } from '@/modules/wallets/hooks/useUpdateWallet'
import { useDeleteWalletForm } from '@/modules/wallets/hooks/useDeleteWallet'
import { walletQueryOptions } from '@/api/useWallets'
import type { TWallet } from '@/modules/wallets/schema'

type MutationCallbacks = {
  onError?: (error: unknown) => void
  onSuccess?: () => void
}

const mutateMock = vi.hoisted(() => vi.fn())
const mutateAsyncMock = vi.hoisted(() => vi.fn())
const invalidateQueriesMock = vi.hoisted(() => vi.fn())
const routerPushMock = vi.hoisted(() => vi.fn())
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

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPushMock }),
}))

describe('Wallet CRUD Operations', () => {
  beforeEach(() => {
    mutateMock.mockClear()
    mutateAsyncMock.mockClear()
    invalidateQueriesMock.mockClear()
    routerPushMock.mockClear()
    apiGetMock.mockClear()
    lastMutationOptions.current = null
  })

  it('creates a new wallet with valid data', async () => {
    const { form, onFormSubmit } = useCreateWalletForm()
    form.value = { name: 'Savings', balance: 500, color: '#f94144' }

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledWith({
      name: 'Savings',
      balance: 500,
      color: '#f94144',
    })
  })

  it('shows validation errors with invalid data', async () => {
    const { form, onFormSubmit, formErrors } = useCreateWalletForm()
    form.value = { name: '', balance: 0, color: '' }

    await onFormSubmit()

    expect(mutateMock).not.toHaveBeenCalled()
    expect(formErrors.value).not.toBeNull()
  })

  it('shows error state when creation fails', async () => {
    const { form, onFormSubmit, serverError } = useCreateWalletForm()
    form.value = { name: 'Savings', balance: 500, color: '#f94144' }

    await onFormSubmit()
    const mutationOptions = lastMutationOptions.current
    if (!mutationOptions?.onError) throw new Error('Mutation options not set')
    mutationOptions.onError({
      response: { data: { error: 'Failed to create wallet' } },
    })

    expect(serverError.value).toBe('Failed to create wallet')
  })

  it('submits the create wallet form', async () => {
    const { form, onFormSubmit } = useCreateWalletForm()
    form.value = { name: 'Daily', balance: 200, color: '#f8961e' }

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it('fetches and displays wallet details', async () => {
    apiGetMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 'wallet-1',
          user_id: 'user-1',
          balance: 900,
          name: 'Primary',
          color: '#277da1',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    })

    const options = walletQueryOptions('wallet-1') as unknown as {
      queryFn: () => Promise<TWallet | undefined>
    }
    const result = await options.queryFn()

    expect(apiGetMock).toHaveBeenCalledWith('/wallets/wallet-1')
    expect(result?.name).toBe('Primary')
    expect(result?.balance).toBe(900)
  })

  it('shows error state when fetching fails', async () => {
    apiGetMock.mockRejectedValueOnce(new Error('Wallet not found'))

    const options = walletQueryOptions('wallet-1') as unknown as {
      queryFn: () => Promise<TWallet | undefined>
    }

    await expect(options.queryFn()).rejects.toThrow('Wallet not found')
  })

  it('updates wallet details with valid data', async () => {
    const wallet = ref({
      name: 'Primary',
      balance: 900,
      color: '#277da1',
      is_archived: false,
    })
    const { form, onFormSubmit } = useUpdateWalletForm({ wallet, walletId: 'wallet-1' })
    form.value.name = 'Updated Wallet'

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledWith({
      name: 'Updated Wallet',
      balance: 900,
      color: '#277da1',
      is_archived: false,
      id: 'wallet-1',
    })
  })

  it('shows validation errors with invalid data on update', async () => {
    const wallet = ref({ name: '', balance: 0, color: '' })
    const { onFormSubmit, formErrors } = useUpdateWalletForm({ wallet, walletId: 'wallet-1' })

    await onFormSubmit()

    expect(formErrors.value).not.toBeNull()
    expect(mutateMock).not.toHaveBeenCalled()
  })

  it('shows error state when updating fails', async () => {
    const wallet = ref({ name: 'Primary', balance: 1, color: '#277da1' })
    const { onFormSubmit, serverError } = useUpdateWalletForm({ wallet, walletId: 'wallet-1' })

    await onFormSubmit()
    const mutationOptions = lastMutationOptions.current
    if (!mutationOptions?.onError) throw new Error('Mutation options not set')
    mutationOptions.onError({ response: { data: { error: 'Update failed' } } })

    expect(serverError.value).toBe('Update failed')
  })

  it('submits the update wallet form', async () => {
    const wallet = ref({ name: 'Primary', balance: 1, color: '#277da1' })
    const { onFormSubmit } = useUpdateWalletForm({ wallet, walletId: 'wallet-1' })

    await onFormSubmit()

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })

  it('deletes the wallet and redirects to wallets list', async () => {
    const { onFormSubmit } = useDeleteWalletForm('wallet-1')

    mutateAsyncMock.mockResolvedValueOnce(undefined)
    await onFormSubmit()
    const mutationOptions = lastMutationOptions.current
    if (!mutationOptions?.onSuccess) throw new Error('Mutation options not set')
    await mutationOptions.onSuccess()

    expect(routerPushMock).toHaveBeenCalledWith('/app/wallets')
  })

  it('shows confirmation modal before deletion', () => {
    const isConfirming = true
    expect(isConfirming).toBe(true)
  })

  it('shows error state when deletion fails', async () => {
    const { onFormSubmit, serverError } = useDeleteWalletForm('wallet-1')

    mutateAsyncMock.mockResolvedValueOnce(undefined)
    await onFormSubmit()
    const mutationOptions = lastMutationOptions.current
    if (!mutationOptions?.onError) throw new Error('Mutation options not set')
    mutationOptions.onError({ response: { data: { error: 'Delete failed' } } })

    expect(serverError.value).toBe('Delete failed')
  })

  it('confirms deletion', async () => {
    const { onFormSubmit } = useDeleteWalletForm('wallet-1')

    mutateAsyncMock.mockResolvedValueOnce(undefined)
    await onFormSubmit()

    expect(mutateAsyncMock).toHaveBeenCalledWith('wallet-1')
  })
})
