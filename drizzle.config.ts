import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/schemas/index.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NUXT_MAIL_DATABASE_URL || ''
  }
})
