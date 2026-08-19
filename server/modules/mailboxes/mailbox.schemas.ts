import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .max(254)
  .refine(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address')

const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(253)
  .optional()
  .refine(v => v === undefined || v === '' || /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(v), 'Invalid domain')

const smtpFields = {
  smtpHost: z.string().trim().min(1, 'SMTP host is required').optional(),
  smtpPort: z.coerce.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().default(true).optional(),
  smtpUser: z.string().trim().min(1, 'SMTP username is required').optional(),
  smtpPass: z.string().min(1, 'SMTP password is required').optional(),
  imapHost: z.string().trim().min(1).optional(),
  imapPort: z.coerce.number().int().min(1).max(65535).optional(),
  imapSecure: z.boolean().default(true).optional(),
  imapUser: z.string().trim().min(1).optional(),
  imapPass: z.string().min(1).optional()
}

export const validateApiKeySchema = z.object({
  apiKey: z.string().trim().min(1, 'API key is required').regex(/^re_/, 'Resend API keys start with "re_"')
})

export const createMailboxSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(60, 'At most 60 characters'),
    provider: z.enum(['resend', 'smtp']).default('resend'),
    apiKey: z
      .string()
      .trim()
      .min(1, 'API key is required')
      .regex(/^re_/, 'Resend API keys start with "re_"')
      .optional(),
    domain: domainSchema,
    fromAddress: emailSchema.optional(),
    senders: z.array(emailSchema).max(20, 'At most 20 senders').optional(),
    autoWebhook: z.boolean().default(true),
    ...smtpFields
  })
  .superRefine((value, ctx) => {
    if (value.provider === 'resend' && !value.apiKey) {
      ctx.addIssue({ code: 'custom', path: ['apiKey'], message: 'API key is required for Resend mailboxes' })
    }
    if (value.provider === 'smtp') {
      if (!value.smtpHost) ctx.addIssue({ code: 'custom', path: ['smtpHost'], message: 'SMTP host is required' })
      if (!value.smtpPort) ctx.addIssue({ code: 'custom', path: ['smtpPort'], message: 'SMTP port is required' })
      if (!value.smtpUser) ctx.addIssue({ code: 'custom', path: ['smtpUser'], message: 'SMTP username is required' })
      if (!value.smtpPass) ctx.addIssue({ code: 'custom', path: ['smtpPass'], message: 'SMTP password is required' })
    }
  })

export const updateMailboxSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60).optional(),
  fromAddress: emailSchema.nullable().optional(),
  apiKey: z.string().trim().regex(/^re_/, 'Resend API keys start with "re_"').optional(),
  webhookSecret: z.string().trim().regex(/^whsec_/, 'Webhook signing secrets start with "whsec_"').optional(),
  domain: domainSchema,
  ...smtpFields
})

export const createSenderSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(120).optional()
})

export const updateSenderSchema = z.object({
  name: z.string().trim().max(120).optional(),
  isDefault: z.boolean().optional()
})

export const testSmtpSchema = z.object({
  host: z.string().trim().min(1, 'SMTP host is required'),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean().default(true),
  user: z.string().trim().min(1, 'SMTP username is required'),
  pass: z.string().min(1, 'SMTP password is required')
})

export type CreateMailboxInput = z.infer<typeof createMailboxSchema>
export type UpdateMailboxInput = z.infer<typeof updateMailboxSchema>
export type CreateSenderInput = z.infer<typeof createSenderSchema>
export type UpdateSenderInput = z.infer<typeof updateSenderSchema>
export type TestSmtpInput = z.infer<typeof testSmtpSchema>
