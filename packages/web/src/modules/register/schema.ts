import { z } from 'zod'

export const RegisterPlain = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60)
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z.email(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/,
        'Password must contain uppercase, lowercase, number, and special character',
      ),
  })
  .required()

export type RegisterSchema = z.infer<typeof RegisterPlain>
