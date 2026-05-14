import { z } from 'zod'

export const LoginPlain = z
  .object({
    email: z.email('Invalid email address').min(1, 'Email is required').max(100),
    password: z.string().min(1, 'Password is required').max(100),
  })
  .required()
export type LoginSchema = z.infer<typeof LoginPlain>
