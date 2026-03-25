import { z } from 'zod'

export const ApiSuccess = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.literal(true),
    data: schema.optional(),
  })

export const ApiError = z.object({
  success: z.literal(false),
  error: z.string(),
  fields: z.record(z.string(), z.string()).optional(),
})

export const Paginated = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    items: z.array(schema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      total_pages: z.number(),
    }),
  })

export type ApiErrorResponse = z.infer<typeof ApiError>
