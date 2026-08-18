import { resolve, Tokens } from '../../core/container'
import { noContent } from '../../core/http'
import { requireAuth } from '../../core/session'
import type { MailboxService } from '../../modules/mailboxes/mailbox.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const service = resolve<MailboxService>(Tokens.MailboxService)
  await service.remove(user.id, id)
  return noContent(event)
})
