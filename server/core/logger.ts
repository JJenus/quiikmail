import { consola } from 'consola'

/**
 * Scoped loggers - one tagged logger per module for greppable, structured logs.
 */

export const logger = {
  core: consola.withTag('core'),
  auth: consola.withTag('auth'),
  mailbox: consola.withTag('mailbox'),
  mail: consola.withTag('mail'),
  sync: consola.withTag('sync'),
  webhook: consola.withTag('webhook'),
  resend: consola.withTag('resend')
}
