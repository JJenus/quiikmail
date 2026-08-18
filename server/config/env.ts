import { z } from 'zod'

/**
 * Validated server configuration from runtimeConfig (.env).
 * Validated once on first access so misconfiguration fails fast with a clear message.
 */

const EnvSchema = z.object({
  databaseUrl: z.string().min(1, 'NUXT_MAIL_DATABASE_URL is required'),
  encKey: z.string().min(16, 'NUXT_MAIL_ENC_KEY must be at least 16 characters'),
  mailAppUrl: z
    .string()
    .url()
    .or(z.literal(''))
    .transform(v => v || 'http://localhost:3000')
})

export type EnvConfig = z.infer<typeof EnvSchema>

let cached: EnvConfig | null = null

export function getEnvConfig(): EnvConfig {
  if (cached) return cached
  const runtime = useRuntimeConfig()
  const parsed = EnvSchema.safeParse({
    databaseUrl: runtime.databaseUrl,
    encKey: runtime.encKey,
    mailAppUrl: runtime.mailAppUrl
  })
  if (!parsed.success) {
    throw new Error(`Invalid server configuration: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }
  cached = parsed.data
  return cached
}
