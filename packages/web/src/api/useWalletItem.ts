import { queryOptions, type MutationOptions } from '@tanstack/vue-query'
import { z } from 'zod'
import api from './axios'

import {
  WalletItemPlainSchema,
  type TWalletItem,
  type TWalletItemCreate,
  type TWalletItemListQuery,
  type TWalletItemUpdate,
} from '@/modules/wallet_item/schema'

import { ApiSuccess, Paginated, type ApiErrorResponse } from '@/models/response'

export type PaginatedWalletItems = z.infer<
  ReturnType<typeof Paginated<typeof WalletItemPlainSchema>>
>

export const walletItemKeys = {
  all: ['wallet-items'] as const,
  lists: () => [...walletItemKeys.all, 'list'] as const,
  list: (walletId: string, params: TWalletItemListQuery) =>
    [...walletItemKeys.lists(), walletId, params] as const,
  detail: (id: string) => [...walletItemKeys.all, 'detail', id] as const,
}

type WalletItemPayload = {
  walletId: string
  itemId: string
}

// Query Options

export const walletItemsQueryOptions = (
  params: TWalletItemListQuery = {
    page: 1,
    limit: 10,
  },
  walletId: string,
) =>
  queryOptions({
    queryKey: walletItemKeys.list(walletId, params),
    queryFn: async () => {
      const { data } = await api.get(`/wallet/${walletId}/items`, { params })
      return ApiSuccess(Paginated(WalletItemPlainSchema)).parse(data).data
    },
    placeholderData: (prev) => prev,
    retry: false,
    enabled: !!walletId,
  })

// Mutation Options

export const createWalletItemMutationOptions = (
  onSuccess?: (wallet: TWalletItem) => void,
): MutationOptions<TWalletItem, ApiErrorResponse, { walletId: string } & TWalletItemCreate> => ({
  mutationFn: async ({ walletId, ...body }) => {
    const { data } = await api.post(`/wallet/${walletId}/items`, body)
    const parsed = ApiSuccess(WalletItemPlainSchema).parse(data)

    if (!parsed.data) {
      throw { success: false, error: 'Wallet payload missing from response' } as ApiErrorResponse
    }

    return parsed.data
  },
  onSuccess,
})

export const updateWalletItemMutationOptions = (
  onSuccess?: (wallet: TWalletItem) => void,
): MutationOptions<TWalletItem, ApiErrorResponse, WalletItemPayload & TWalletItemUpdate> => ({
  mutationFn: async ({ walletId, itemId, ...body }) => {
    const { data } = await api.patch(`/wallet/${walletId}/items/${itemId}`, body)
    const parsed = ApiSuccess(WalletItemPlainSchema).parse(data)

    if (!parsed.data) {
      throw { success: false, error: 'Wallet payload missing from response' } as ApiErrorResponse
    }

    return parsed.data
  },
  onSuccess,
})

export const deleteWalletItemMutationOptions = (
  onSuccess?: () => void,
): MutationOptions<void, ApiErrorResponse, WalletItemPayload> => ({
  mutationFn: async ({ walletId, itemId }) => {
    await api.delete(`/wallet/${walletId}/items/${itemId}`)
  },
  onSuccess,
})
