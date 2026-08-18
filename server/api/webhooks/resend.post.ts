import { resolve, Tokens } from '../../core/container'
import { logger } from '../../core/logger'
import { appError } from '../../core/errors'
import { verifyWebhookSignature } from '../../modules/resend/resend.webhook'
import type { ResendWebhookEvent } from '../../modules/resend/resend.types'
import type { MailboxRepository } from '../../modules/mailboxes/mailbox.repository'
import type { MailboxService } from '../../modules/mailboxes/mailbox.service'
import type { IngestService } from '../../modules/sync/ingest.service'

/**
 * Shared inbound webhook for every mailbox.
 * Signature is verified against each mailbox's stored whsec_ secret to find
 * which mailbox an event belongs to (the payload itself carries no account id).
 */
export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    return send(event, 'ok', 'text/plain')
  }

  const headers = getHeaders(event)
  const mailboxRepo = resolve<MailboxRepository>(Tokens.MailboxRepository)
  const mailboxService = resolve<MailboxService>(Tokens.MailboxService)
  const ingest = resolve<IngestService>(Tokens.IngestService)

  const mailboxes = await mailboxRepo.listAll()
  for (const mailbox of mailboxes) {
    const secret = mailboxService.decryptWebhookSecret(mailbox)
    if (!secret) continue
    if (verifyWebhookSignature(rawBody, headers, secret)) {
      let payload: ResendWebhookEvent
      try {
        payload = JSON.parse(rawBody) as ResendWebhookEvent
      } catch {
        break
      }
      if (payload.type === 'email.received' && payload.data?.email_id) {
        try {
          const added = await ingest.ingestReceivedEmail(mailbox, payload.data.email_id)
          logger.webhook.info(`email.received ${payload.data.email_id} for ${mailbox.id}: ${added ? 'ingested' : 'duplicate'}`)
        } catch (error) {
          logger.webhook.error(`Ingest failed for ${payload.data.email_id}: ${(error as Error).message}`)
        }
      }
      return send(event, 'ok', 'text/plain')
    }
  }

  throw appError(401, 'UNAUTHORIZED', 'Invalid webhook signature')
})
