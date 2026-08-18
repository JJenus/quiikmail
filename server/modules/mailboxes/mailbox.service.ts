import { randomUUID } from 'node:crypto'
import { appError } from '../../core/errors'
import { Tokens, resolve } from '../../core/container'
import type { CryptoService } from '../../core/crypto'
import { getEnvConfig } from '../../config/env'
import { logger } from '../../core/logger'
import type { ResendClient, ResendClientFactory } from '../resend/resend.client'
import type { CreateMailboxInput, UpdateMailboxInput } from './mailbox.schemas'
import type { MailboxRepository } from './mailbox.repository'
import type { Mailbox } from '../../schemas/mailboxes'
import type { SyncService } from '../sync/sync.service'
import type { SyncResult } from '../sync/sync.types'

export interface MailboxDto {
  id: string
  name: string
  provider: string
  domain: string | null
  fromAddress: string | null
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

export function toMailboxDto(mailbox: Mailbox): MailboxDto {
  return {
    id: mailbox.id,
    name: mailbox.name,
    provider: mailbox.provider,
    domain: mailbox.domain,
    fromAddress: mailbox.fromAddress,
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

  list(userId: string): Promise<MailboxDto[]> {
    return this.repo.listByUser(userId).then(boxes => boxes.map(toMailboxDto))
  }

  /** Validates a user-supplied API key against Resend. */
  async validateApiKey(apiKey: string): Promise<{ valid: boolean, live: boolean, name: string | null }> {
    try {
      const keys = await this.createClient(apiKey).validateKey()
      const primary = keys.find(k => k.live) ?? keys[0]
      return { valid: true, live: primary?.live ?? false, name: primary?.name ?? null }
    } catch (error) {
      logger.mailbox.warn(`API key validation failed: ${(error as Error).message}`)
      throw appError(400, 'INVALID_API_KEY', 'This Resend API key could not be validated')
    }
  }

  async create(userId: string, input: CreateMailboxInput): Promise<CreateMailboxResult> {
    await this.validateApiKey(input.apiKey)

    const client = this.createClient(input.apiKey)
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
      apiKeyEnc: this.crypto.encrypt(input.apiKey),
      fromAddress: input.fromAddress?.trim() || null,
      resendWebhookId: webhookId,
      webhookSecretEnc
    })

    // Initial sync — best effort, never fails the request.
    try {
      const sync = resolve<SyncService>(Tokens.SyncService)
      const result = await sync.syncMailbox(mailbox)
      logger.mailbox.info(`Initial sync for ${mailbox.id}: ${JSON.stringify(result)}`)
    } catch (error) {
      logger.mailbox.error(`Initial sync failed: ${(error as Error).message}`)
    }

    return {
      mailbox: toMailboxDto(mailbox),
      webhookAutoConfigured: autoConfigured,
      webhookUrl: `${getEnvConfig().mailAppUrl}/api/webhooks/resend`
    }
  }

  async update(userId: string, id: string, input: UpdateMailboxInput): Promise<MailboxDto> {
    await this.requireOwned(userId, id)

    const values: Partial<Mailbox> = {}
    if (input.name !== undefined) values.name = input.name
    if (input.fromAddress !== undefined) values.fromAddress = input.fromAddress || null
    if (input.apiKey !== undefined) {
      await this.validateApiKey(input.apiKey)
      values.apiKeyEnc = this.crypto.encrypt(input.apiKey)
    }
    if (input.webhookSecret !== undefined) {
      values.webhookSecretEnc = this.crypto.encrypt(input.webhookSecret)
    }

    const updated = await this.repo.update(id, values)
    if (!updated) throw appError(404, 'NOT_FOUND', 'Mailbox not found')
    return toMailboxDto(updated)
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

  /** Throws 404 when the mailbox does not belong to the user. */
  async requireOwned(userId: string, id: string): Promise<Mailbox> {
    const mailbox = await this.repo.findByIdForUser(id, userId)
    if (!mailbox) throw appError(404, 'NOT_FOUND', 'Mailbox not found')
    return mailbox
  }

  getResendClient(mailbox: Mailbox): ResendClient {
    return this.createClient(this.crypto.decrypt(mailbox.apiKeyEnc))
  }

  decryptWebhookSecret(mailbox: Mailbox): string | null {
    return mailbox.webhookSecretEnc ? this.crypto.decrypt(mailbox.webhookSecretEnc) : null
  }
}
