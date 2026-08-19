import { resolve, Tokens } from '../../../../core/container'
import { ok, readValidatedBody } from '../../../../core/http'
import { requireAuth } from '../../../../core/session'
import { updateSenderSchema } from '../../../../modules/mailboxes/mailbox.schemas'
import type { MailboxService } from '../../../../modules/mailboxes/mailbox.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const senderId = getRouterParam(event, 'senderId')!
  const body = await readValidatedBody(event, updateSenderSchema)
  const service = resolve<MailboxService>(Tokens.MailboxService)
  return ok(event, await service.updateSender(user.id, id, senderId, body))
})
