import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(32, 'At most 32 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Only letters, numbers, dots, dashes and underscores'),
  email: z
    .string()
    .trim()
    .max(254)
    .optional()
    .refine(v => v === undefined || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address'),
  password: z.string().min(8, 'At least 8 characters').max(128)
})

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export const updateProfileSchema = z
  .object({
    email: z
      .string()
      .trim()
      .max(254)
      .nullable()
      .optional()
      .refine(v => v === null || v === undefined || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address'),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'At least 8 characters').max(128).optional()
  })
  .refine(v => v.currentPassword !== undefined || v.newPassword === undefined, {
    message: 'Current password is required to change the password',
    path: ['currentPassword']
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
