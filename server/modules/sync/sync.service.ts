import { appError } from '../../core/errors'
import type { CryptoService } from '../../core/crypto'
import { logger } from '../../core/logger'
import type { ResendClientFactory } from '../resend/resend.client'
import type { MailRepository } from '../mails/mail.repository'
import type { MailboxRepository } from '../mailboxes/mailbox.repository'
import type { MailboxService } from '../mailboxes/mailbox.service'
import type { Mailbox } from '../../schemas/mailboxes'
import type { IngestService } from './ingest.service'
import { ImapClient } from '../smtp/imap.client'
import type { SyncResult } from './sync.types'

/**
 * Polling sync - walks Resend's receiving list (newest first, paginated)
 * or polls IMAP INBOX (unseen messages) depending on the mailbox provider.
 * Idempotent by design.
 */
export class SyncService {
  constructor(
    private readonly mailRepo: MailRepository,
    private readonly mailboxRepo: MailboxRepository,
    private readonly crypto: CryptoService,
    private readonly createClient: ResendClientFactory,
    private readonly ingest: IngestService,
    private readonly mailboxService: MailboxService
  ) {}

  async syncMailbox(mailbox: Mailbox, maxPages = 5, pageSize = 100): Promise<SyncResult> {
    if (mailbox.provider === 'smtp') return this.syncImap(mailbox)
    return this.syncResend(mailbox, maxPages, pageSize)
  }

  private async syncResend(mailbox: Mailbox, maxPages: number, pageSize: number): Promise<SyncResult> {
    const result: SyncResult = { added: 0, skipped: 0 }
    const client = this.createClient(this.crypto.decrypt(mailbox.apiKeyEnc!))

    let before: string | undefined
    for (let page = 0; page < maxPages; page++) {
      let res: Awaited<ReturnType<typeof client.listReceivedEmails>>
      try {
        res = await client.listReceivedEmails({ limit: pageSize, before })
      } catch (error) {
        logger.sync.warn(`Resend list failed for ${mailbox.id}: ${(error as Error).message}`)
        throw appError(502, 'RESEND_ERROR', 'Could not reach Resend during sync', { detail: (error as Error).message })
      }
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

  private async syncImap(mailbox: Mailbox): Promise<SyncResult> {
    const result: SyncResult = { added: 0, skipped: 0 }
    const config = this.mailboxService.getImapConfig(mailbox)
    if (!config) {
      logger.sync.warn(`IMAP not configured for ${mailbox.id}, skipping sync`)
      return result
    }

    const client = new ImapClient()
    let messages: Awaited<ReturnType<typeof client.fetchUnseen>>
    try {
      messages = await client.fetchUnseen(config)
    } catch (error) {
      logger.sync.warn(`IMAP fetch failed for ${mailbox.id}: ${(error as Error).message}`)
      throw appError(502, 'IMAP_ERROR', 'Could not reach the IMAP server during sync', { detail: (error as Error).message })
    }

    const seen: number[] = []
    for (const message of messages) {
      try {
        const added = await this.ingest.ingestImapMessage(mailbox, message)
        if (added) result.added++
        else result.skipped++
        seen.push(message.uid)
      } catch (error) {
        logger.sync.warn(`Failed to ingest IMAP message for ${mailbox.id}: ${(error as Error).message}`)
      }
    }

    try {
      await client.markSeen(config, seen)
    } catch (error) {
      logger.sync.warn(`Failed to mark IMAP messages seen for ${mailbox.id}: ${(error as Error).message}`)
    }

    await this.mailboxRepo.updateLastSynced(mailbox.id)
    logger.sync.info(`IMAP sync finished for ${mailbox.id}: ${JSON.stringify(result)}`)
    return result
  }
}
