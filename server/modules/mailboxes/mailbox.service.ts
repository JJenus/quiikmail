import { randomUUID } from 'node:crypto'
import { appError } from '../../core/errors'
import { Tokens, resolve } from '../../core/container'
import type { CryptoService } from '../../core/crypto'
import { getEnvConfig } from '../../config/env'
import { logger } from '../../core/logger'
import type { ResendClient, ResendClientFactory } from '../resend/resend.client'
import type { ResendDomain } from '../resend/resend.types'
import { SmtpClient, type SmtpConfig } from '../smtp/smtp.client'
import type { ImapConfig } from '../smtp/imap.client'
import type {
  CreateMailboxInput,
  CreateSenderInput,
  TestSmtpInput,
  UpdateMailboxInput,
  UpdateSenderInput
} from './mailbox.schemas'
import type { MailboxRepository } from './mailbox.repository'
import type { Mailbox } from '../../schemas/mailboxes'
import type { MailboxSender } from '../../schemas/mailbox-senders'
import type { SyncService } from '../sync/sync.service'
import type { SyncResult } from '../sync/sync.types'

export interface SenderDto {
  id: string
  email: string
  name: string | null
  isDefault: boolean
}

export interface MailboxDto {
  id: string
  name: string
  provider: string
  domain: string | null
  fromAddress: string | null
  senders: SenderDto[]
  inboundAddress: string | null
  webhookConfigured: boolean
  lastSyncedAt: string | null
  createdAt: string
}

export interface CreateMailboxResult {
  mailbox: MailboxDto
  webhookAutoConfigured: boolean
  webhookUrl: string
}

export function toSenderDto(sender: MailboxSender): SenderDto {
  return {
    id: sender.id,
    email: sender.email,
    name: sender.name,
    isDefault: sender.isDefault
  }
}

export function toMailboxDto(mailbox: Mailbox, senders: MailboxSender[] = []): MailboxDto {
  return {
    id: mailbox.id,
    name: mailbox.name,
    provider: mailbox.provider,
    domain: mailbox.domain,
    fromAddress: mailbox.fromAddress,
    senders: senders.map(toSenderDto),
    inboundAddress: mailbox.inboundAddress,
    webhookConfigured: Boolean(mailbox.resendWebhookId),
    lastSyncedAt: mailbox.lastSyncedAt ? mailbox.lastSyncedAt.toISOString() : null,
    createdAt: mailbox.createdAt.toISOString()
  }
}

export class MailboxService {
  constructor(
    private readonly repo: MailboxRepository,
    private readonly crypto: CryptoService,
    private readonly createClient: ResendClientFactory
  ) {}

  async list(userId: string): Promise<MailboxDto[]> {
    const boxes = await this.repo.listByUser(userId)
    const senders = await this.repo.listSendersForMailboxes(boxes.map(b => b.id))
    const byMailbox = new Map<string, MailboxSender[]>()
    for (const sender of senders) {
      const list = byMailbox.get(sender.mailboxId) ?? []
      list.push(sender)
      byMailbox.set(sender.mailboxId, list)
    }
    return boxes.map(box => toMailboxDto(box, byMailbox.get(box.id) ?? []))
  }

  /** Validates a user-supplied API key against Resend, returning its domains. */
  async validateApiKey(apiKey: string): Promise<{
    valid: boolean
    live: boolean
    name: string | null
    domains: { name: string, status: string }[]
  }> {
    try {
      const client = this.createClient(apiKey)
      const [keys, domains] = await Promise.all([
        client.validateKey(),
        client.listDomains().catch(() => [] as ResendDomain[])
      ])
      const primary = keys.find(k => k.live) ?? keys[0]
      return {
        valid: true,
        live: primary?.live ?? false,
        name: primary?.name ?? null,
        domains: domains.map(d => ({ name: d.name, status: d.status }))
      }
    } catch (error) {
      logger.mailbox.warn(`API key validation failed: ${(error as Error).message}`)
      throw appError(400, 'INVALID_API_KEY', 'This Resend API key could not be validated')
    }
  }

  async create(userId: string, input: CreateMailboxInput): Promise<CreateMailboxResult> {
    if (input.provider === 'smtp') return this.createSmtp(userId, input)
    return this.createResend(userId, input)
  }

  private async createResend(userId: string, input: CreateMailboxInput): Promise<CreateMailboxResult> {
    await this.validateApiKey(input.apiKey!)
    const client = this.createClient(input.apiKey!)

    const domain = input.domain?.trim() || null
    if (domain) {
      const domains = await client.listDomains().catch(() => [])
      if (!domains.some(d => d.name === domain && d.status === 'verified')) {
        throw appError(422, 'VALIDATION_ERROR', `Domain "${domain}" is not verified on this Resend account`)
      }
    }

    let webhookId: string | null = null
    let webhookSecretEnc: string | null = null
    let autoConfigured = false

    if (input.autoWebhook) {
      const webhookUrl = `${getEnvConfig().mailAppUrl}/api/webhooks/resend`
      try {
        const webhook = await client.createWebhook(webhookUrl, ['email.received'])
        webhookId = webhook.id
        webhookSecretEnc = this.crypto.encrypt(webhook.secret)
        autoConfigured = true
        logger.mailbox.info(`Webhook auto-created for mailbox (${webhook.id})`)
      } catch (error) {
        logger.mailbox.warn(`Webhook auto-creation failed: ${(error as Error).message}`)
      }
    }

    const mailbox = await this.repo.create({
      id: randomUUID(),
      userId,
      name: input.name,
      provider: 'resend',
      apiKeyEnc: this.crypto.encrypt(input.apiKey!),
      domain,
      resendWebhookId: webhookId,
      webhookSecretEnc
    })

    await this.seedSenders(mailbox, input.senders ?? [], input.fromAddress)
    const senders = await this.repo.listSenders(mailbox.id)
    await this.syncDefaultSender(mailbox, senders)

    await this.initialSync(mailbox)

    return {
      mailbox: toMailboxDto(mailbox, senders),
      webhookAutoConfigured: autoConfigured,
      webhookUrl: `${getEnvConfig().mailAppUrl}/api/webhooks/resend`
    }
  }

  private async createSmtp(userId: string, input: CreateMailboxInput): Promise<CreateMailboxResult> {
    const mailbox = await this.repo.create({
      id: randomUUID(),
      userId,
      name: input.name,
      provider: 'smtp',
      domain: input.domain?.trim() || null,
      smtpHost: input.smtpHost || null,
      smtpPort: input.smtpPort ?? null,
      smtpSecure: input.smtpSecure ?? true,
      smtpUserEnc: input.smtpUser ? this.crypto.encrypt(input.smtpUser) : null,
      smtpPassEnc: input.smtpPass ? this.crypto.encrypt(input.smtpPass) : null,
      imapHost: input.imapHost || null,
      imapPort: input.imapPort ?? null,
      imapSecure: input.imapSecure ?? true,
      imapUserEnc: input.imapUser ? this.crypto.encrypt(input.imapUser) : null,
      imapPassEnc: input.imapPass ? this.crypto.encrypt(input.imapPass) : null
    })

    await this.seedSenders(mailbox, input.senders ?? [], input.fromAddress)
    const senders = await this.repo.listSenders(mailbox.id)
    await this.syncDefaultSender(mailbox, senders)

    await this.initialSync(mailbox)

    return {
      mailbox: toMailboxDto(mailbox, senders),
      webhookAutoConfigured: false,
      webhookUrl: ''
    }
  }

  private async seedSenders(mailbox: Mailbox, emails: string[], fromAddress?: string): Promise<void> {
    const all = [...new Set([...(emails ?? []), ...(fromAddress ? [fromAddress] : [])])]
    for (let i = 0; i < all.length; i++) {
      this.assertSenderDomain(mailbox.domain, all[i]!)
      await this.repo.createSender({
        id: randomUUID(),
        mailboxId: mailbox.id,
        email: all[i]!,
        isDefault: i === 0
      })
    }
  }

  /** Keeps mailbox.fromAddress in sync with the default sender. */
  private async syncDefaultSender(mailbox: Mailbox, senders: MailboxSender[]): Promise<void> {
    const def = senders.find(s => s.isDefault) ?? senders[0]
    if (def?.email !== mailbox.fromAddress) {
      await this.repo.update(mailbox.id, { fromAddress: def?.email ?? null })
    }
  }

  private async initialSync(mailbox: Mailbox): Promise<void> {
    try {
      const sync = resolve<SyncService>(Tokens.SyncService)
      const result = await sync.syncMailbox(mailbox)
      logger.mailbox.info(`Initial sync for ${mailbox.id}: ${JSON.stringify(result)}`)
    } catch (error) {
      logger.mailbox.error(`Initial sync failed: ${(error as Error).message}`)
    }
  }

  async update(userId: string, id: string, input: UpdateMailboxInput): Promise<MailboxDto> {
    await this.requireOwned(userId, id)

    const values: Partial<Mailbox> = {}
    if (input.name !== undefined) values.name = input.name
    if (input.domain !== undefined) values.domain = input.domain?.trim() || null
    if (input.apiKey !== undefined) {
      await this.validateApiKey(input.apiKey)
      values.apiKeyEnc = this.crypto.encrypt(input.apiKey)
    }
    if (input.webhookSecret !== undefined) {
      values.webhookSecretEnc = this.crypto.encrypt(input.webhookSecret)
    }
    if (input.smtpHost !== undefined) values.smtpHost = input.smtpHost || null
    if (input.smtpPort !== undefined) values.smtpPort = input.smtpPort ?? null
    if (input.smtpSecure !== undefined) values.smtpSecure = input.smtpSecure
    if (input.smtpUser !== undefined) values.smtpUserEnc = input.smtpUser ? this.crypto.encrypt(input.smtpUser) : null
    if (input.smtpPass !== undefined) values.smtpPassEnc = input.smtpPass ? this.crypto.encrypt(input.smtpPass) : null
    if (input.imapHost !== undefined) values.imapHost = input.imapHost || null
    if (input.imapPort !== undefined) values.imapPort = input.imapPort ?? null
    if (input.imapSecure !== undefined) values.imapSecure = input.imapSecure
    if (input.imapUser !== undefined) values.imapUserEnc = input.imapUser ? this.crypto.encrypt(input.imapUser) : null
    if (input.imapPass !== undefined) values.imapPassEnc = input.imapPass ? this.crypto.encrypt(input.imapPass) : null

    const updated = await this.repo.update(id, values)
    if (!updated) throw appError(404, 'NOT_FOUND', 'Mailbox not found')

    let senders = await this.repo.listSenders(id)
    if (input.fromAddress !== undefined) {
      if (input.fromAddress) {
        this.assertSenderDomain(updated.domain, input.fromAddress)
        const existing = senders.find(s => s.email.toLowerCase() === input.fromAddress!.toLowerCase())
        if (existing) {
          await this.repo.setDefaultSender(id, existing.id)
        } else {
          const created = await this.repo.createSender({
            id: randomUUID(),
            mailboxId: id,
            email: input.fromAddress,
            isDefault: senders.length === 0
          })
          await this.repo.setDefaultSender(id, created.id)
        }
      }
      senders = await this.repo.listSenders(id)
      await this.syncDefaultSender(updated, senders)
    }

    return toMailboxDto(updated, senders)
  }

  async remove(userId: string, id: string): Promise<void> {
    const mailbox = await this.requireOwned(userId, id)

    if (mailbox.resendWebhookId) {
      try {
        await this.getResendClient(mailbox).deleteWebhook(mailbox.resendWebhookId)
      } catch (error) {
        logger.mailbox.warn(`Webhook cleanup failed for ${id}: ${(error as Error).message}`)
      }
    }
    await this.repo.remove(id)
  }

  async sync(userId: string, id: string): Promise<SyncResult> {
    const mailbox = await this.requireOwned(userId, id)
    const sync = resolve<SyncService>(Tokens.SyncService)
    return sync.syncMailbox(mailbox)
  }

  // ── Senders ─────────────────────────────────────────────────────────

  async addSender(userId: string, mailboxId: string, input: CreateSenderInput): Promise<SenderDto> {
    const mailbox = await this.requireOwned(userId, mailboxId)
    this.assertSenderDomain(mailbox.domain, input.email)
    const existing = await this.repo.listSenders(mailboxId)
    if (existing.some(s => s.email.toLowerCase() === input.email.toLowerCase())) {
      throw appError(409, 'MAILBOX_CONFLICT', 'This sender already exists on the mailbox')
    }
    const row = await this.repo.createSender({
      id: randomUUID(),
      mailboxId,
      email: input.email,
      name: input.name?.trim() || null,
      isDefault: existing.length === 0
    })
    if (existing.length === 0) {
      await this.repo.update(mailboxId, { fromAddress: row.email })
    }
    return toSenderDto(row)
  }

  async updateSender(userId: string, mailboxId: string, senderId: string, input: UpdateSenderInput): Promise<SenderDto> {
    await this.requireOwned(userId, mailboxId)
    const sender = await this.repo.findSenderById(senderId, mailboxId)
    if (!sender) throw appError(404, 'NOT_FOUND', 'Sender not found')

    if (input.isDefault) {
      await this.repo.setDefaultSender(mailboxId, senderId)
      const updated = await this.repo.findSenderById(senderId, mailboxId)
      await this.repo.update(mailboxId, { fromAddress: sender.email })
      return toSenderDto(updated!)
    }
    if (input.name !== undefined) {
      const updated = await this.repo.updateSender(senderId, { name: input.name.trim() || null })
      return toSenderDto(updated!)
    }
    return toSenderDto(sender)
  }

  async removeSender(userId: string, mailboxId: string, senderId: string): Promise<void> {
    await this.requireOwned(userId, mailboxId)
    const sender = await this.repo.findSenderById(senderId, mailboxId)
    if (!sender) throw appError(404, 'NOT_FOUND', 'Sender not found')
    await this.repo.removeSender(senderId, mailboxId)

    const remaining = await this.repo.listSenders(mailboxId)
    if (remaining.length > 0 && !remaining.some(s => s.isDefault)) {
      const fallback = remaining[0]!
      await this.repo.setDefaultSender(mailboxId, fallback.id)
      await this.repo.update(mailboxId, { fromAddress: fallback.email })
    } else {
      await this.repo.update(mailboxId, { fromAddress: remaining.find(s => s.isDefault)?.email ?? null })
    }
  }

  async getDefaultSender(mailboxId: string): Promise<SenderDto | null> {
    const senders = await this.repo.listSenders(mailboxId)
    return senders.find(s => s.isDefault) ?? senders[0] ?? null
  }

  /**
   * Resolves the "send from" address for a mailbox: the given address must
   * be a configured sender, otherwise the default sender is used.
   */
  async resolveSender(mailboxId: string, from?: string): Promise<SenderDto> {
    const senders = await this.repo.listSenders(mailboxId)
    if (from) {
      const match = senders.find(s => s.email.toLowerCase() === from.toLowerCase())
      if (!match) throw appError(422, 'VALIDATION_ERROR', `"${from}" is not a verified sender for this mailbox`)
      return match
    }
    const fallback = senders.find(s => s.isDefault) ?? senders[0]
    if (!fallback) throw appError(422, 'VALIDATION_ERROR', 'No "Send from" address configured for this mailbox')
    return fallback
  }

  private assertSenderDomain(domain: string | null, email: string): void {
    if (!domain) return
    const emailDomain = email.split('@')[1]
    if (emailDomain !== domain) {
      throw appError(422, 'VALIDATION_ERROR', `Sender "${email}" does not belong to domain "${domain}"`)
    }
  }

  // ── Providers ───────────────────────────────────────────────────────

  /** Verifies SMTP credentials against the server (used by setup + settings). */
  async testSmtp(input: TestSmtpInput): Promise<{ ok: boolean }> {
    await new SmtpClient().verify({
      host: input.host,
      port: input.port,
      secure: input.secure,
      user: input.user,
      pass: input.pass
    })
    return { ok: true }
  }

  getSmtpConfig(mailbox: Mailbox): SmtpConfig | null {
    if (!mailbox.smtpHost || !mailbox.smtpPort || !mailbox.smtpUserEnc || !mailbox.smtpPassEnc) return null
    return {
      host: mailbox.smtpHost,
      port: mailbox.smtpPort,
      secure: mailbox.smtpSecure,
      user: this.crypto.decrypt(mailbox.smtpUserEnc),
      pass: this.crypto.decrypt(mailbox.smtpPassEnc)
    }
  }

  getImapConfig(mailbox: Mailbox): ImapConfig | null {
    if (!mailbox.imapHost || !mailbox.imapPort || !mailbox.imapUserEnc || !mailbox.imapPassEnc) return null
    return {
      host: mailbox.imapHost,
      port: mailbox.imapPort,
      secure: mailbox.imapSecure,
      user: this.crypto.decrypt(mailbox.imapUserEnc),
      pass: this.crypto.decrypt(mailbox.imapPassEnc)
    }
  }

  /** Throws 404 when the mailbox does not belong to the user. */
  async requireOwned(userId: string, id: string): Promise<Mailbox> {
    const mailbox = await this.repo.findByIdForUser(id, userId)
    if (!mailbox) throw appError(404, 'NOT_FOUND', 'Mailbox not found')
    return mailbox
  }

  getResendClient(mailbox: Mailbox): ResendClient {
    if (!mailbox.apiKeyEnc) throw appError(400, 'VALIDATION_ERROR', 'This mailbox has no Resend API key')
    return this.createClient(this.crypto.decrypt(mailbox.apiKeyEnc))
  }

  decryptWebhookSecret(mailbox: Mailbox): string | null {
    return mailbox.webhookSecretEnc ? this.crypto.decrypt(mailbox.webhookSecretEnc) : null
  }
}
