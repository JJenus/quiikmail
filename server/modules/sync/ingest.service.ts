import type { CryptoService } from '../../core/crypto'
import type { ResendClientFactory } from '../resend/resend.client'
import type { ResendAttachmentDetail } from '../resend/resend.types'
import type { MailRepository } from '../mails/mail.repository'
import type { Mailbox } from '../../schemas/mailboxes'

/**
 * Shared ingestion path for a single inbound email — used by both the
 * webhook handler and the polling sync. Idempotent per (mailbox, resendEmailId).
 */
export class IngestService {
  constructor(
    private readonly mailRepo: MailRepository,
    private readonly crypto: CryptoService,
    private readonly createClient: ResendClientFactory
  ) {}

  /** Returns true when the email was newly ingested, false when already known. */
  async ingestReceivedEmail(mailbox: Mailbox, resendEmailId: string): Promise<boolean> {
    const existing = await this.mailRepo.findByResendEmailId(mailbox.id, resendEmailId)
    if (existing) return false

    const client = this.createClient(this.crypto.decrypt(mailbox.apiKeyEnc))
    const detail = await client.getReceivedEmail(resendEmailId)
    const attachmentsDetail = await Promise.all(
      detail.attachments.map(a =>
        client.getAttachment(detail.id, a.id).catch(() => null)
      )
    )
    const created = await this.mailRepo.upsertFromResend(
      mailbox.id,
      detail,
      attachmentsDetail.filter((a): a is ResendAttachmentDetail => a !== null)
    )
    return Boolean(created)
  }
}
