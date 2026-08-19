import { config as loadDotenv } from 'dotenv'
import { existsSync } from 'node:fs'

if (process.env.NODE_ENV !== 'production' && existsSync('.env.dev')) {
  loadDotenv({ path: '.env.dev', override: true })
}

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'light'
  },

  runtimeConfig: {
    mail: {
      databaseUrl: process.env.NUXT_MAIL_DATABASE_URL,
      encKey: process.env.NUXT_MAIL_ENC_KEY,
      mailAppUrl: process.env.NUXT_MAIL_APP_URL
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    errorHandler: './server/error-handler.ts',
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      '*/5 * * * *': ['imap-sync']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
