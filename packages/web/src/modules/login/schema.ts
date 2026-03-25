import { z } from 'zod'

export const LoginPlain = z
  .object({
    email: z.email(),
    password: z.string().min(1, 'Password is required').max(100),
  })
  .required()
export type LoginSchema = z.infer<typeof LoginPlain>
