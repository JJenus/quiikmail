import { resolve, Tokens } from '../../core/container'
import { created, readValidatedBody } from '../../core/http'
import { requireAuth } from '../../core/session'
import { createMailboxSchema } from '../../modules/mailboxes/mailbox.schemas'
import type { MailboxService } from '../../modules/mailboxes/mailbox.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, createMailboxSchema)
  const service = resolve<MailboxService>(Tokens.MailboxService)
  return created(event, await service.create(user.id, body))
})
