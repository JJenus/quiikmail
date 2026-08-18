import { resolve, Tokens } from '../../core/container'
import { ok, readValidatedBody } from '../../core/http'
import { requireAuth } from '../../core/session'
import { updateMailboxSchema } from '../../modules/mailboxes/mailbox.schemas'
import type { MailboxService } from '../../modules/mailboxes/mailbox.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, updateMailboxSchema)
  const service = resolve<MailboxService>(Tokens.MailboxService)
  return ok(event, await service.update(user.id, id, body))
})
