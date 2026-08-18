import { z } from 'zod'

export const validateApiKeySchema = z.object({
  apiKey: z.string().trim().min(1, 'API key is required').regex(/^re_/, 'Resend API keys start with "re_"')
})

export const createMailboxSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'At most 60 characters'),
  apiKey: z.string().trim().min(1, 'API key is required').regex(/^re_/, 'Resend API keys start with "re_"'),
  fromAddress: z
    .string()
    .trim()
    .max(254)
    .optional()
    .refine(v => v === undefined || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address'),
  autoWebhook: z.boolean().default(true)
})

export const updateMailboxSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60).optional(),
  fromAddress: z
    .string()
    .trim()
    .max(254)
    .nullable()
    .optional()
    .refine(v => v === null || v === undefined || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address'),
  apiKey: z.string().trim().regex(/^re_/, 'Resend API keys start with "re_"').optional(),
  webhookSecret: z.string().trim().regex(/^whsec_/, 'Webhook signing secrets start with "whsec_"').optional()
})

export type CreateMailboxInput = z.infer<typeof createMailboxSchema>
export type UpdateMailboxInput = z.infer<typeof updateMailboxSchema>
