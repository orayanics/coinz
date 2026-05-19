import { z } from 'zod'

export const ProfileUpdateSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .optional(),
    old_password: z.string().optional(),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/,
        'Password must include 1 uppercase, 1 number and 1 special character',
      )
      .optional(),
    confirm_password: z.string().optional(),
  })
  .refine((data) => !data.new_password || data.old_password, {
    message: 'Old password is required when changing password',
    path: ['old_password'],
  })
  .refine((data) => !data.new_password || data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type ProfileSchema = z.infer<typeof ProfileUpdateSchema>
