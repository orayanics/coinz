import { z } from 'zod'

export const WalletPlainSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  balance: z.number(),
  name: z.string(),
  color: z.string(),
  is_archived: z.boolean(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})

export const WalletCreateSchema = z.object({
  balance: z.number().optional().default(0),
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional().default('#94ff76'),
  is_archived: z.boolean().default(false).optional(),
})

export const WalletUpdateSchema = z.object({
  balance: z.number().min(0).optional(),
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  is_archived: z.boolean().optional(),
})

export const WalletListQuerySchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  id: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  sortBy: z.enum(['created_at', 'updated_at']).optional(),
})

export type TWallet = z.infer<typeof WalletPlainSchema>
export type TWalletCreate = z.infer<typeof WalletCreateSchema>
export type TWalletUpdate = z.infer<typeof WalletUpdateSchema>
export type TWalletListQuery = z.infer<typeof WalletListQuerySchema>
