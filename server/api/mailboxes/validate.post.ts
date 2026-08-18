import { resolve, Tokens } from '../../core/container'
import { ok, readValidatedBody } from '../../core/http'
import { requireAuth } from '../../core/session'
import { validateApiKeySchema } from '../../modules/mailboxes/mailbox.schemas'
import type { MailboxService } from '../../modules/mailboxes/mailbox.service'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readValidatedBody(event, validateApiKeySchema)
  const service = resolve<MailboxService>(Tokens.MailboxService)
  return ok(event, await service.validateApiKey(body.apiKey))
})
