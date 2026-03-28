import { queryOptions } from '@tanstack/vue-query'
import { z } from 'zod'
import api from './axios'
import { ApiSuccess, Paginated } from '@/models/response'

export type TCrossWalletDashboardQuery = {
  from?: string
  to?: string
  month?: number
  year?: number
  include_archived?: boolean
}

export type TWalletListQuery = {
  include_archived?: boolean
  sortBy?: 'balance' | 'name' | 'activity'
  sort?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export type TWalletDashboardQuery = {
  from?: string
  to?: string
  month?: number
  year?: number
  type?: 'INCOME' | 'EXPENSE'
  granularity?: 'week' | 'month'
}

const WalletSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  is_archived: z.boolean(),
  balance: z.number().nullable().optional(),
})

const WalletSummaryWithActivitySchema = WalletSummarySchema.extend({
  activity: z.number(),
  created_at: z.string().nullable().optional(),
})

const NetChangeSchema = z.object({
  income: z.number(),
  expense: z.number(),
  net: z.number(),
})

const AverageTransactionSchema = z.object({
  average: z.number(),
  count: z.number(),
  max: z.number(),
  min: z.number(),
})

const BalancePointSchema = z.object({
  date: z.string().nullable(),
  balance: z.number(),
})

const SpendingPeriodSchema = z.object({
  period: z.string(),
  income: z.number(),
  expense: z.number(),
  net: z.number(),
})

const NetWorthPointSchema = z.object({
  date: z.string().nullable(),
  net_worth: z.number(),
})

const IncomeVsExpenseRowSchema = z.object({
  total_income: z.number(),
  total_expense: z.number(),
  total_net: z.number(),
})

const AggregateBalanceSchema = z.object({
  total: z.number(),
  count_wallets: z.number(),
})

export const CrossWalletDashboardSchema = z.object({
  aggregate_balance: AggregateBalanceSchema,
  income_vs_expense: IncomeVsExpenseRowSchema,
})

export const WalletDashboardSchema = z.object({
  wallet: WalletSummarySchema,
  net_change: NetChangeSchema,
  average_transaction: AverageTransactionSchema,
  balance_over_time: z.array(BalancePointSchema),
  spending_by_period: z.array(SpendingPeriodSchema),
})

export type TCrossWalletDashboard = z.infer<typeof CrossWalletDashboardSchema>
export type TWalletDashboard = z.infer<typeof WalletDashboardSchema>
export type TWalletSummaryWithActivity = z.infer<typeof WalletSummaryWithActivitySchema>
export type TNetChange = z.infer<typeof NetChangeSchema>
export type TSpendingPeriod = z.infer<typeof SpendingPeriodSchema>
export type TNetWorthPoint = z.infer<typeof NetWorthPointSchema>
export type TIncomeVsExpenseRow = z.infer<typeof IncomeVsExpenseRowSchema>

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (params: TCrossWalletDashboardQuery) =>
    [...dashboardKeys.all, 'overview', params] as const,
  walletList: (params: TWalletListQuery) => [...dashboardKeys.all, 'wallet-list', params] as const,
  wallet: (id: string, params: TWalletDashboardQuery) =>
    [...dashboardKeys.all, 'wallet', id, params] as const,
}

export const crossWalletDashboardQueryOptions = (params: TCrossWalletDashboardQuery = {}) =>
  queryOptions({
    queryKey: dashboardKeys.overview(params),
    queryFn: async () => {
      const { data } = await api.get('/dashboard', { params })
      return ApiSuccess(CrossWalletDashboardSchema).parse(data).data
    },
    placeholderData: (prev) => prev,
    retry: false,
  })

export const dashboardWalletListQueryOptions = (
  params: TWalletListQuery & TWalletDashboardQuery = {},
) =>
  queryOptions({
    queryKey: dashboardKeys.walletList(params),
    queryFn: async () => {
      const { data } = await api.get('/dashboard/wallets', { params })
      return ApiSuccess(Paginated(WalletSummaryWithActivitySchema)).parse(data).data
    },
    placeholderData: (prev) => prev,
    retry: false,
  })

export const walletDashboardQueryOptions = (id: string, params: TWalletDashboardQuery = {}) =>
  queryOptions({
    queryKey: dashboardKeys.wallet(id, params),
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/wallets/${id}`, { params })
      return ApiSuccess(WalletDashboardSchema).parse(data).data
    },
    placeholderData: (prev) => prev,
    retry: false,
    enabled: !!id,
  })
