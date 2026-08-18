import { resolve, Tokens } from '../../core/container'
import { ok } from '../../core/http'
import { requireAuth } from '../../core/session'
import type { MailboxService } from '../../modules/mailboxes/mailbox.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const mailboxService = resolve<MailboxService>(Tokens.MailboxService)
  return ok(event, {
    user,
    mailboxes: await mailboxService.list(user.id)
  })
})
