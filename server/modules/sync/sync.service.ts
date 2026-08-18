import type { CryptoService } from '../../core/crypto'
import { logger } from '../../core/logger'
import type { ResendClientFactory } from '../resend/resend.client'
import type { MailRepository } from '../mails/mail.repository'
import type { MailboxRepository } from '../mailboxes/mailbox.repository'
import type { Mailbox } from '../../schemas/mailboxes'
import type { IngestService } from './ingest.service'
import type { SyncResult } from './sync.types'

/**
 * Polling sync — walks Resend's receiving list (newest first, paginated)
 * and ingests anything not yet stored locally. Idempotent by design.
 */
export class SyncService {
  constructor(
    private readonly mailRepo: MailRepository,
    private readonly mailboxRepo: MailboxRepository,
    private readonly crypto: CryptoService,
    private readonly createClient: ResendClientFactory,
    private readonly ingest: IngestService
  ) {}

  async syncMailbox(mailbox: Mailbox, maxPages = 5, pageSize = 100): Promise<SyncResult> {
    const result: SyncResult = { added: 0, skipped: 0 }
    const client = this.createClient(this.crypto.decrypt(mailbox.apiKeyEnc))

    let before: string | undefined
    for (let page = 0; page < maxPages; page++) {
      const res = await client.listReceivedEmails({ limit: pageSize, before })
      for (const summary of res.data) {
        try {
          const added = await this.ingest.ingestReceivedEmail(mailbox, summary.id)
          if (added) result.added++
          else result.skipped++
        } catch (error) {
          logger.sync.warn(`Failed to ingest ${summary.id} for ${mailbox.id}: ${(error as Error).message}`)
        }
      }
      if (!res.has_more || res.data.length === 0) break
      before = res.data[res.data.length - 1]?.id
    }

    await this.mailboxRepo.updateLastSynced(mailbox.id)
    logger.sync.info(`Sync finished for ${mailbox.id}: ${JSON.stringify(result)}`)
    return result
  }
}
