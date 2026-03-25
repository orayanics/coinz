import { queryOptions, type MutationOptions } from '@tanstack/vue-query'
import { z } from 'zod'
import api from './axios'
import {
  WalletPlainSchema,
  type TWalletListQuery,
  type TWallet,
  type TWalletCreate,
  type TWalletUpdate,
} from '@/modules/wallets/schema'

import { ApiSuccess, Paginated, type ApiErrorResponse } from '@/models/response'

export type PaginatedWallets = z.infer<ReturnType<typeof Paginated<typeof WalletPlainSchema>>>

export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  list: (params: TWalletListQuery) => [...walletKeys.lists(), params] as const,
  detail: (id: string) => [...walletKeys.all, 'detail', id] as const,
}

// Query Options

export const walletsQueryOptions = (
  params: TWalletListQuery = {
    page: 1,
    limit: 10,
  },
) =>
  queryOptions({
    queryKey: walletKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get('/wallets', { params })
      return ApiSuccess(Paginated(WalletPlainSchema)).parse(data).data
    },
    placeholderData: (prev) => prev,
    retry: false,
  })

export const walletQueryOptions = (id: string) =>
  queryOptions({
    queryKey: walletKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/wallets/${id}`)
      return ApiSuccess(WalletPlainSchema).parse(data).data
    },
    retry: false,
    enabled: !!id,
  })

// Mutation Options

export const createWalletMutationOptions = (
  onSuccess?: (wallet: TWallet) => void,
): MutationOptions<TWallet, ApiErrorResponse, TWalletCreate> => ({
  mutationFn: async (body: TWalletCreate) => {
    const { data } = await api.post('/wallets', body)
    const parsed = ApiSuccess(WalletPlainSchema).parse(data)

    if (!parsed.data) {
      console.log('Wallet payload missing from response')
      throw { success: false, error: 'Wallet payload missing from response' } as ApiErrorResponse
    }

    return parsed.data
  },
  onSuccess,
})

export const updateWalletMutationOptions = (
  onSuccess?: (wallet: TWallet) => void,
): MutationOptions<TWallet, ApiErrorResponse, { id: string } & TWalletUpdate> => ({
  mutationFn: async ({ id, ...body }) => {
    const { data } = await api.patch(`/wallets/${id}`, body)
    const parsed = ApiSuccess(WalletPlainSchema).parse(data)

    if (!parsed.data) {
      console.log('Wallet payload missing from response')
      throw { success: false, error: 'Wallet payload missing from response' } as ApiErrorResponse
    }

    return parsed.data
  },
  onSuccess,
})

export const deleteWalletMutationOptions = (
  onSuccess?: () => void,
): MutationOptions<void, ApiErrorResponse, string> => ({
  mutationFn: async (id: string) => {
    await api.delete(`/wallets/${id}`)
  },
  onSuccess,
})
