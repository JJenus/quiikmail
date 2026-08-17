/**
 * mailService plugin
 *
 * Provides the mail service instance app-wide via `useNuxtApp().$mail`.
 * Swap createMailService() for your real implementation.
 */
import { createMailService } from '~/services/mailService'

export default defineNuxtPlugin(() => {
  const mailService = createMailService()

  return {
    provide: {
      mail: mailService
    }
  }
})
