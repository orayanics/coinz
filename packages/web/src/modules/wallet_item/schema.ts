import { z } from 'zod'

export enum ITEM_TYPE {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export const WalletItemPlainSchema = z.object({
  id: z.string().optional(),
  wallet_id: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number(),
  note: z.string(),
  date: z.coerce.date().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})

export const WalletItemCreateSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().min(1),
  note: z.string().optional(),
  date: z.date().optional().nullable(),
})

export const WalletItemUpdateSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  amount: z.number().min(1).optional(),
  note: z.string().optional(),
  date: z.coerce.date().optional(),
})

export const WalletItemListQuerySchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  id: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  sortBy: z.enum(['created_at', 'updated_at']).optional(),
})

export type TWalletItem = z.infer<typeof WalletItemPlainSchema>
export type TWalletItemCreate = z.infer<typeof WalletItemCreateSchema>
export type TWalletItemUpdate = z.infer<typeof WalletItemUpdateSchema>
export type TWalletItemListQuery = z.infer<typeof WalletItemListQuerySchema>
