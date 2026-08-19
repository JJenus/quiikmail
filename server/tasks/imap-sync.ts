import { Tokens, resolve } from '../core/container'
import { logger } from '../core/logger'
import type { MailboxRepository } from '../modules/mailboxes/mailbox.repository'
import type { SyncService } from '../modules/sync/sync.service'

/**
 * Scheduled poll for SMTP mailboxes - IMAP delivers inbound mail only when
 * fetched, so this runs on a cron. The per-mailbox manual "Sync now" button
 * triggers the same path.
 */
export default defineTask({
  meta: {
    name: 'imap-sync',
    description: 'Polls IMAP INBOX for all SMTP mailboxes'
  },
  async run() {
    const mailboxRepo = resolve<MailboxRepository>(Tokens.MailboxRepository)
    const sync = resolve<SyncService>(Tokens.SyncService)
    const boxes = await mailboxRepo.listAll()

    let synced = 0
    for (const mailbox of boxes.filter(b => b.provider === 'smtp')) {
      try {
        const result = await sync.syncMailbox(mailbox)
        synced++
        logger.sync.info(`Scheduled IMAP sync for ${mailbox.id}: ${JSON.stringify(result)}`)
      } catch (error) {
        logger.sync.warn(`Scheduled IMAP sync failed for ${mailbox.id}: ${(error as Error).message}`)
      }
    }
    return { result: 'ok', synced }
  }
})
