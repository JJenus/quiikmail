import { createHash } from 'node:crypto'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import type { Address } from '../mails/mail.repository'

export interface ImapConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

export interface ImapAttachment {
  filename: string
  contentType: string | null
  disposition: string | null
  size: number
  data: Buffer
}

export interface ImapMessage {
  uid: number
  externalKey: string
  fromName: string | null
  fromEmail: string
  to: Address[]
  cc: Address[]
  bcc: Address[]
  subject: string
  bodyText: string | null
  bodyHtml: string | null
  receivedAt: Date
  messageId: string | null
  attachments: ImapAttachment[]
}

/**
 * Inbound IMAP polling - fetches unseen messages from INBOX, parses them
 * with mailparser and returns normalized messages. Messages are NOT marked
 * seen here; the caller does that after a successful ingest so a failed
 * ingest can be retried.
 */
export class ImapClient {
  private async open(config: ImapConfig): Promise<ImapFlow> {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      },
      logger: false
    })
    await client.connect()
    return client
  }

  private toAddress(value: { address?: string, name?: string }[] | undefined): Address[] {
    return (value ?? [])
      .filter(entry => entry.address)
      .map(entry => ({ name: entry.name || null, email: entry.address! }))
  }

  private toAddressList(value: unknown): Address[] {
    if (Array.isArray(value)) return this.toAddress(value as { address?: string, name?: string }[])
    if (value && typeof value === 'object' && 'value' in value) {
      return this.toAddress((value as { value: { address?: string, name?: string }[] }).value)
    }
    return []
  }

  async fetchUnseen(config: ImapConfig): Promise<ImapMessage[]> {
    const client = await this.open(config)
    try {
      await client.mailboxOpen('INBOX')
      const messages: ImapMessage[] = []
      for await (const msg of client.fetch('UNSEEN', { uid: true, envelope: true, source: true })) {
        if (!msg.source) continue
        const parsed = await simpleParser(msg.source)
        const from = this.toAddressList(parsed.from)[0]
        const messageId = parsed.messageId || msg.envelope?.messageId || null
        const externalKey = messageId
          ? `imap:${messageId}`
          : `imap:${createHash('sha1').update(msg.source).digest('hex')}`
        messages.push({
          uid: msg.uid,
          externalKey,
          fromName: from?.name || null,
          fromEmail: from?.email ?? '',
          to: this.toAddressList(parsed.to),
          cc: this.toAddressList(parsed.cc),
          bcc: this.toAddressList(parsed.bcc),
          subject: parsed.subject ?? '',
          bodyText: parsed.text || null,
          bodyHtml: parsed.html || null,
          receivedAt: parsed.date instanceof Date ? parsed.date : new Date(),
          messageId,
          attachments: (parsed.attachments ?? []).map(att => ({
            filename: att.filename || 'attachment',
            contentType: att.contentType || null,
            disposition: (att as { disposition?: string | null }).disposition ?? null,
            size: att.size ?? (att.content?.byteLength ?? 0),
            data: att.content ?? Buffer.alloc(0)
          }))
        })
      }
      return messages
    } finally {
      await client.logout().catch(() => {})
    }
  }

  /** Marks the given UIDs as \\Seen so they are not fetched again. */
  async markSeen(config: ImapConfig, uids: number[]): Promise<void> {
    if (uids.length === 0) return
    const client = await this.open(config)
    try {
      await client.mailboxOpen('INBOX')
      await client.messageFlagsAdd(uids, ['\\Seen'])
    } finally {
      await client.logout().catch(() => {})
    }
  }
}
