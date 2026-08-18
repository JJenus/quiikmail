import { register, Tokens } from '../core/container'
import { getDatabase } from '../core/database'
import { CryptoService } from '../core/crypto'
import { getEnvConfig } from '../config/env'
import { ResendClient } from '../modules/resend/resend.client'
import type { ResendClientFactory } from '../modules/resend/resend.client'
import { AuthRepository } from '../modules/auth/auth.repository'
import { AuthService } from '../modules/auth/auth.service'
import { MailboxRepository } from '../modules/mailboxes/mailbox.repository'
import { MailboxService } from '../modules/mailboxes/mailbox.service'
import { MailRepository } from '../modules/mails/mail.repository'
import { AttachmentRepository } from '../modules/mails/attachment.repository'
import { MailService } from '../modules/mails/mail.service'
import { AttachmentService } from '../modules/mails/attachment.service'
import { IngestService } from '../modules/sync/ingest.service'
import { SyncService } from '../modules/sync/sync.service'

/**
 * Dependency graph — everything is wired once at startup.
 * Route handlers resolve services by token.
 */
export default defineNitroPlugin(() => {
  const db = getDatabase()

  const crypto = register(Tokens.CryptoService, new CryptoService(getEnvConfig().encKey))
  const createClient: ResendClientFactory = apiKey => new ResendClient(apiKey)
  register(Tokens.ResendClientFactory, createClient)

  const authRepository = new AuthRepository(db)
  const mailboxRepository = new MailboxRepository(db)
  const mailRepository = new MailRepository(db)
  const attachmentRepository = new AttachmentRepository(db)

  register(Tokens.MailboxRepository, mailboxRepository)

  const ingestService = register(Tokens.IngestService, new IngestService(mailRepository, crypto, createClient))
  register(
    Tokens.SyncService,
    new SyncService(mailRepository, mailboxRepository, crypto, createClient, ingestService)
  )
  const mailboxService = register(
    Tokens.MailboxService,
    new MailboxService(mailboxRepository, crypto, createClient)
  )
  register(Tokens.AuthService, new AuthService(authRepository))
  register(Tokens.MailService, new MailService(mailRepository, attachmentRepository, mailboxService))
  register(Tokens.AttachmentService, new AttachmentService(attachmentRepository, mailRepository, mailboxService))
})
