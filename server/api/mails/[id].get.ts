import { z } from 'zod'
import { resolve, Tokens } from '../../core/container'
import { ok, readValidatedQuery } from '../../core/http'
import { requireAuth } from '../../core/session'
import type { MailService } from '../../modules/mails/mail.service'

const getMailQuery = z.object({
  mailboxId: z.string().uuid()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const query = await readValidatedQuery(event, getMailQuery)
  const service = resolve<MailService>(Tokens.MailService)
  return ok(event, await service.getById(user.id, query.mailboxId, id))
})
