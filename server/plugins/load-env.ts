import { defineNitroPlugin } from 'nitropack/runtime'
import { existsSync, readFileSync } from 'node:fs'
import { parse as parseDotenv } from 'dotenv'

export default defineNitroPlugin(() => {
  const realEnv = { ...process.env }
  const merged: Record<string, string> = {}

  for (const path of ['.env', '.env.prod']) {
    if (!existsSync(path)) continue
    Object.assign(merged, parseDotenv(readFileSync(path)))
  }

  for (const [key, value] of Object.entries(merged)) {
    if (!(key in realEnv)) process.env[key] = value
  }

  const runtime = useRuntimeConfig()
  for (const key of ['databaseUrl', 'encKey', 'mailAppUrl'] as const) {
    const value = process.env[`NUXT_MAIL_${key.toUpperCase()}`]
    if (value && runtime.mail) runtime.mail[key] = value
  }
})