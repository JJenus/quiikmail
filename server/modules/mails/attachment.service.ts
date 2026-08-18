import { appError } from '../../core/errors'
import { logger } from '../../core/logger'
import type { MailboxService } from '../mailboxes/mailbox.service'
import type { MailRepository } from './mail.repository'
import type { AttachmentRepository } from './attachment.repository'

export interface AttachmentDownloadDto {
  url: string
  expiresAt: string | null
  filename: string
  size: number
  contentType: string | null
}

/**
 * Attachment downloads — serves the signed Resend CDN URL, refreshing it via
 * the API when the previously stored link has expired.
 */
export class AttachmentService {
  constructor(
    private readonly attachmentRepo: AttachmentRepository,
    private readonly mailRepo: MailRepository,
    private readonly mailboxService: MailboxService
  ) {}

  async getDownload(userId: string, attachmentId: string): Promise<AttachmentDownloadDto> {
    const attachment = await this.attachmentRepo.findById(attachmentId)
    if (!attachment) throw appError(404, 'NOT_FOUND', 'Attachment not found')

    const mail = await this.mailRepo.findById(attachment.mailId)
    if (!mail) throw appError(404, 'NOT_FOUND', 'Mail not found')

    const mailbox = await this.mailboxService.requireOwned(userId, mail.mailboxId)

    if (attachment.downloadUrl && (!attachment.expiresAt || attachment.expiresAt.getTime() > Date.now())) {
      return this.toDto(attachment)
    }

    // Signed URL expired (or missing) — refresh from Resend.
    const client = this.mailboxService.getResendClient(mailbox)
    const detail = await client.getAttachment(mail.resendEmailId, attachment.resendAttachmentId)
    const refreshed = await this.attachmentRepo.updateUrl(
      attachment.id,
      detail.download_url,
      detail.expires_at ? new Date(detail.expires_at) : null
    )
    logger.mail.info(`Refreshed attachment URL for ${attachment.id}`)
    return this.toDto(refreshed)
  }

  private toDto(attachment: {
    downloadUrl: string | null
    expiresAt: Date | null
    filename: string
    size: number
    contentType: string | null
  }): AttachmentDownloadDto {
    return {
      url: attachment.downloadUrl ?? '',
      expiresAt: attachment.expiresAt ? attachment.expiresAt.toISOString() : null,
      filename: attachment.filename,
      size: attachment.size,
      contentType: attachment.contentType
    }
  }
}
