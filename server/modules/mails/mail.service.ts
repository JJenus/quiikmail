import { appError } from '../../core/errors'
import { logger } from '../../core/logger'
import type { MailboxService } from '../mailboxes/mailbox.service'
import type { MailRepository } from './mail.repository'
import type { AttachmentRepository } from './attachment.repository'
import type { Mail } from '../../schemas/mails'
import type { MailAttachmentRow } from '../../schemas/attachments'

export interface MailListQuery {
  mailboxId?: string
  folder?: string
  search?: string
  page?: number
  limit?: number
}

export interface SendInput {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body?: string
}

export interface DraftInput {
  id?: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
  body?: string
}

export interface MailListDto {
  total: number
  page: number
  limit: number
  rows: Record<string, unknown>[]
  counts: Record<string, number>
}

function formatAddressList(list: string[]): Array<{ name: string | null, email: string }> {
  return list.map(parseResendAddress)
}

function parseResendAddress(raw: string): { name: string | null, email: string } {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(.*?)\s*<([^>]+)>$/)
  if (match) {
    const name = match[1]!.replace(/^"+|"+$/g, '').trim()
    return { name: name || null, email: match[2]!.trim() }
  }
  return { name: null, email: trimmed }
}

function toMailDto(row: Mail, atts: MailAttachmentRow[]): Record<string, unknown> {
  return {
    id: row.id,
    from: { name: row.fromName, email: row.fromEmail },
    to: row.to,
    cc: row.cc,
    bcc: row.bcc,
    subject: row.subject,
    body: row.bodyText ?? '',
    bodyHtml: row.bodyHtml,
    preview: row.preview ?? '',
    date: row.receivedAt.toISOString(),
    folder: row.folder,
    read: row.read,
    starred: row.starred,
    threadId: row.messageId,
    attachments: atts.map(a => ({
      id: a.id,
      name: a.filename,
      size: a.size,
      type: a.contentType ?? 'application/octet-stream'
    }))
  }
}

export class MailService {
  constructor(
    private readonly mailRepo: MailRepository,
    private readonly attachmentRepo: AttachmentRepository,
    private readonly mailboxService: MailboxService
  ) {}

  async list(userId: string, query: MailListQuery): Promise<MailListDto> {
    const page = query.page ?? 1
    const limit = query.limit ?? 30

    let mailboxId = query.mailboxId
    if (!mailboxId) {
      const boxes = await this.mailboxService.list(userId)
      if (boxes.length === 0) return { total: 0, page, limit, rows: [], counts: {} }
      mailboxId = boxes[0]!.id
    } else {
      await this.mailboxService.requireOwned(userId, mailboxId)
    }

    const { rows, total } = await this.mailRepo.list({
      mailboxId,
      folder: query.folder,
      search: query.search,
      page,
      limit
    })

    const attachmentRows = rows.length > 0 ? await this.attachmentRepo.listByMailIds(rows.map(r => r.id)) : []
    const byMail = new Map<string, MailAttachmentRow[]>()
    for (const att of attachmentRows) {
      const list = byMail.get(att.mailId) ?? []
      list.push(att)
      byMail.set(att.mailId, list)
    }

    const counts = await this.mailRepo.folderCounts(mailboxId)
    const countMap: Record<string, number> = {}
    for (const c of counts) countMap[c.folder] = c.count
    countMap.starred = await this.mailRepo.starredCount(mailboxId)
    countMap.important = countMap.starred

    return { total, page, limit, rows: rows.map(row => toMailDto(row, byMail.get(row.id) ?? [])), counts: countMap }
  }

  async getById(userId: string, mailboxId: string, id: string): Promise<Record<string, unknown>> {
    await this.mailboxService.requireOwned(userId, mailboxId)
    const row = await this.mailRepo.findByIdForMailbox(mailboxId, id)
    if (!row) throw appError(404, 'NOT_FOUND', 'Mail not found')
    const atts = await this.attachmentRepo.listByMailIds([id])
    return toMailDto(row, atts)
  }

  async send(userId: string, mailboxId: string, input: SendInput): Promise<Record<string, unknown>> {
    const mailbox = await this.mailboxService.requireOwned(userId, mailboxId)
    if (!mailbox.fromAddress) {
      throw appError(422, 'VALIDATION_ERROR', 'No "Send from" address configured for this mailbox')
    }

    const client = this.mailboxService.getResendClient(mailbox)
    const toResend = (list: string[]) => list.map((address) => {
      const parsed = parseResendAddress(address)
      return parsed.name ? `${parsed.name} <${parsed.email}>` : parsed.email
    })

    const resend = await client.sendEmail({
      from: mailbox.fromAddress,
      to: toResend(input.to),
      cc: input.cc?.length ? toResend(input.cc) : undefined,
      bcc: input.bcc?.length ? toResend(input.bcc) : undefined,
      subject: input.subject,
      text: input.body
    })

    const row = await this.mailRepo.createSent(mailbox.id, {
      resendId: resend.id,
      fromName: parseResendAddress(mailbox.fromAddress).name,
      fromEmail: parseResendAddress(mailbox.fromAddress).email,
      to: formatAddressList(input.to),
      cc: formatAddressList(input.cc ?? []),
      bcc: formatAddressList(input.bcc ?? []),
      subject: input.subject,
      bodyText: input.body
    })
    logger.mail.info(`Mail sent via Resend (${resend.id})`)
    return toMailDto(row, [])
  }

  async saveDraft(userId: string, mailboxId: string, input: DraftInput): Promise<Record<string, unknown>> {
    const mailbox = await this.mailboxService.requireOwned(userId, mailboxId)
    const from = mailbox.fromAddress ? parseResendAddress(mailbox.fromAddress) : { name: null, email: '' }
    const row = await this.mailRepo.upsertDraft(mailboxId, {
      id: input.id,
      fromName: from.name,
      fromEmail: from.email,
      to: formatAddressList(input.to ?? []),
      cc: formatAddressList(input.cc ?? []),
      bcc: formatAddressList(input.bcc ?? []),
      subject: input.subject ?? '',
      bodyText: input.body
    })
    return toMailDto(row, [])
  }

  async markRead(userId: string, mailboxId: string, ids: string[], read: boolean): Promise<void> {
    await this.mailboxService.requireOwned(userId, mailboxId)
    await this.mailRepo.updateFlags(mailboxId, ids, { read })
  }

  async star(userId: string, mailboxId: string, ids: string[], starred: boolean): Promise<void> {
    await this.mailboxService.requireOwned(userId, mailboxId)
    await this.mailRepo.updateFlags(mailboxId, ids, { starred })
  }

  async move(userId: string, mailboxId: string, ids: string[], folder: string): Promise<void> {
    await this.mailboxService.requireOwned(userId, mailboxId)
    await this.mailRepo.moveToFolder(mailboxId, ids, folder)
  }

  async delete(userId: string, mailboxId: string, ids: string[]): Promise<void> {
    await this.mailboxService.requireOwned(userId, mailboxId)
    await this.mailRepo.remove(mailboxId, ids)
  }
}
