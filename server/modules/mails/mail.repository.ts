import { and, count, desc, eq, exists, ilike, inArray, or } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../../core/database'
import { mails, type Mail } from '../../schemas/mails'
import { attachments } from '../../schemas/attachments'
import type { ResendAttachmentDetail, ResendReceivedEmailDetail } from '../resend/resend.types'
import type { ImapMessage } from '../smtp/imap.client'

export interface MailQuery {
  mailboxId: string
  folder?: string
  search?: string
  unread?: boolean
  withAttachments?: boolean
  page?: number
  limit?: number
}

export interface Address {
  name: string | null
  email: string
}

/** Parses "Name <email@example.com>" / "email@example.com" into parts. */
export function splitAddress(raw: string): Address {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(.*?)\s*<([^>]+)>$/)
  if (match) {
    const name = match[1]!.replace(/^"+|"+$/g, '').trim()
    return { name: name || null, email: match[2]!.trim() }
  }
  return { name: null, email: trimmed }
}

function buildPreview(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 160)
}

export class MailRepository {
  constructor(private readonly db = getDatabase()) {}

  async list(query: MailQuery): Promise<{ rows: Mail[], total: number }> {
    const page = query.page ?? 1
    const limit = query.limit ?? 30
    const conditions = [eq(mails.mailboxId, query.mailboxId)]

    if (query.folder === 'starred' || query.folder === 'important') {
      conditions.push(eq(mails.starred, true))
    } else if (query.folder && query.folder !== 'all') {
      conditions.push(eq(mails.folder, query.folder))
    }
    if (query.search) {
      const like = `%${query.search}%`
      conditions.push(
        or(
          ilike(mails.subject, like),
          ilike(mails.fromEmail, like),
          ilike(mails.fromName, like),
          ilike(mails.bodyText, like)
        )!
      )
    }
    if (query.unread) {
      conditions.push(eq(mails.read, false))
    }
    if (query.withAttachments) {
      conditions.push(
        exists(
          this.db
            .select({ id: attachments.id })
            .from(attachments)
            .where(eq(attachments.mailId, mails.id))
        )
      )
    }

    const where = and(...conditions)
    const [rows, [totalRow]] = await Promise.all([
      this.db.select().from(mails).where(where).orderBy(desc(mails.receivedAt)).limit(limit).offset((page - 1) * limit),
      this.db.select({ count: count() }).from(mails).where(where)
    ])
    return { rows, total: Number(totalRow?.count ?? 0) }
  }

  /** Per-folder totals and unread counts. */
  async folderCounts(mailboxId: string): Promise<{ folder: string, count: number, unread: number }[]> {
    const rows = await this.db
      .select({ folder: mails.folder, read: mails.read, count: count() })
      .from(mails)
      .where(eq(mails.mailboxId, mailboxId))
      .groupBy(mails.folder, mails.read)
    const byFolder = new Map<string, { count: number, unread: number }>()
    for (const row of rows) {
      const entry = byFolder.get(row.folder) ?? { count: 0, unread: 0 }
      entry.count += Number(row.count)
      if (!row.read) entry.unread += Number(row.count)
      byFolder.set(row.folder, entry)
    }
    return [...byFolder.entries()].map(([folder, v]) => ({ folder, count: v.count, unread: v.unread }))
  }

  async starredCount(mailboxId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(mails)
      .where(and(eq(mails.mailboxId, mailboxId), eq(mails.starred, true)))
    return Number(row?.count ?? 0)
  }

  async starredUnreadCount(mailboxId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(mails)
      .where(and(eq(mails.mailboxId, mailboxId), eq(mails.starred, true), eq(mails.read, false)))
    return Number(row?.count ?? 0)
  }

  async findByIdForMailbox(mailboxId: string, id: string): Promise<Mail | undefined> {
    return this.db.query.mails.findFirst({
      where: and(eq(mails.id, id), eq(mails.mailboxId, mailboxId))
    })
  }

  async findById(id: string): Promise<Mail | undefined> {
    return this.db.query.mails.findFirst({
      where: eq(mails.id, id)
    })
  }

  async findByResendEmailId(mailboxId: string, resendEmailId: string): Promise<Mail | undefined> {
    return this.db.query.mails.findFirst({
      where: and(eq(mails.mailboxId, mailboxId), eq(mails.resendEmailId, resendEmailId))
    })
  }

  /**
   * Inserts an IMAP-sourced inbound email + its attachment bytes
   * (transactionally) unless the external key is already known. Returns the
   * created row or null when skipped as a duplicate.
   */
  async upsertFromImap(mailboxId: string, message: ImapMessage): Promise<Mail | null> {
    const existing = await this.findByResendEmailId(mailboxId, message.externalKey)
    if (existing) return null

    const mailId = randomUUID()
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(mails)
        .values({
          id: mailId,
          mailboxId,
          resendEmailId: message.externalKey,
          source: 'imap',
          fromName: message.fromName,
          fromEmail: message.fromEmail,
          to: message.to,
          cc: message.cc,
          bcc: message.bcc,
          subject: message.subject,
          bodyText: message.bodyText,
          bodyHtml: message.bodyHtml,
          preview: buildPreview(message.bodyText ?? message.bodyHtml ?? ''),
          receivedAt: message.receivedAt,
          messageId: message.messageId,
          folder: 'inbox',
          read: false,
          starred: false
        })
        .returning()
      if (message.attachments.length > 0) {
        await tx.insert(attachments).values(
          message.attachments.map(a => ({
            id: randomUUID(),
            mailId,
            filename: a.filename,
            size: a.size,
            contentType: a.contentType,
            disposition: a.disposition,
            data: a.data
          }))
        )
      }
      return row ?? null
    })
  }

  /**
   * Inserts an inbound email + its attachments (transactionally) unless the
   * resendEmailId is already known for this mailbox. Returns the created row
   * or null when it was skipped as a duplicate.
   */
  async upsertFromResend(
    mailboxId: string,
    detail: ResendReceivedEmailDetail,
    attachmentsDetail: ResendAttachmentDetail[]
  ): Promise<Mail | null> {
    const existing = await this.findByResendEmailId(mailboxId, detail.id)
    if (existing) return null

    const mailId = randomUUID()
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(mails)
        .values({
          id: mailId,
          mailboxId,
          resendEmailId: detail.id,
          fromName: splitAddress(detail.from).name,
          fromEmail: splitAddress(detail.from).email,
          to: detail.to.map(splitAddress),
          cc: detail.cc.map(splitAddress),
          bcc: detail.bcc.map(splitAddress),
          subject: detail.subject ?? '',
          bodyText: detail.text,
          bodyHtml: detail.html,
          preview: buildPreview(detail.text ?? detail.html ?? ''),
          receivedAt: new Date(detail.created_at),
          messageId: detail.message_id ?? null,
          folder: 'inbox',
          read: false,
          starred: false
        })
        .returning()
      if (attachmentsDetail.length > 0) {
        await tx.insert(attachments).values(
          attachmentsDetail.map(a => ({
            id: randomUUID(),
            mailId,
            resendAttachmentId: a.id,
            filename: a.filename,
            size: a.size,
            contentType: a.content_type || null,
            downloadUrl: a.download_url,
            expiresAt: a.expires_at ? new Date(a.expires_at) : null
          }))
        )
      }
      return row ?? null
    })
  }

  async updateFlags(mailboxId: string, ids: string[], flags: { read?: boolean, starred?: boolean }): Promise<void> {
    await this.db.update(mails).set(flags).where(and(eq(mails.mailboxId, mailboxId), inArray(mails.id, ids)))
  }

  async moveToFolder(mailboxId: string, ids: string[], folder: string): Promise<void> {
    await this.db.update(mails).set({ folder }).where(and(eq(mails.mailboxId, mailboxId), inArray(mails.id, ids)))
  }

  async remove(mailboxId: string, ids: string[]): Promise<void> {
    await this.db.delete(mails).where(and(eq(mails.mailboxId, mailboxId), inArray(mails.id, ids)))
  }

  async createSent(
    mailboxId: string,
    input: {
      resendId: string
      fromName: string | null
      fromEmail: string
      to: Address[]
      cc: Address[]
      bcc: Address[]
      subject: string
      bodyText?: string
      bodyHtml?: string
    }
  ): Promise<Mail> {
    const [row] = await this.db
      .insert(mails)
      .values({
        id: randomUUID(),
        mailboxId,
        resendEmailId: `sent-${input.resendId}`,
        fromName: input.fromName,
        fromEmail: input.fromEmail,
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml,
        preview: buildPreview(input.bodyText ?? input.bodyHtml ?? ''),
        receivedAt: new Date(),
        folder: 'sent',
        read: true,
        starred: false
      })
      .returning()
    return row!
  }

  async upsertDraft(
    mailboxId: string,
    draft: {
      id?: string
      fromName: string | null
      fromEmail: string
      to: Address[]
      cc: Address[]
      bcc: Address[]
      subject: string
      bodyText?: string
      bodyHtml?: string
    }
  ): Promise<Mail> {
    const values = {
      fromName: draft.fromName,
      fromEmail: draft.fromEmail,
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject ?? '',
      bodyText: draft.bodyText,
      bodyHtml: draft.bodyHtml,
      preview: buildPreview(draft.bodyText ?? ''),
      receivedAt: new Date(),
      folder: 'drafts',
      read: true
    }

    if (draft.id) {
      const [row] = await this.db
        .update(mails)
        .set(values)
        .where(and(eq(mails.id, draft.id), eq(mails.mailboxId, mailboxId)))
        .returning()
      if (row) return row
    }

    const [row] = await this.db
      .insert(mails)
      .values({ id: randomUUID(), mailboxId, resendEmailId: 'local-draft', ...values })
      .returning()
    return row!
  }
}
