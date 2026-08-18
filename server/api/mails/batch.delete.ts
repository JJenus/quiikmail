import { z } from 'zod'
import { resolve, Tokens } from '../../core/container'
import { noContent, readValidatedBody } from '../../core/http'
import { requireAuth } from '../../core/session'
import type { MailService } from '../../modules/mails/mail.service'

const batchDeleteSchema = z.object({
  mailboxId: z.string().uuid(),
  ids: z.array(z.string().uuid()).min(1).max(200)
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, batchDeleteSchema)
  const service = resolve<MailService>(Tokens.MailService)
  await service.delete(user.id, body.mailboxId, body.ids)
  return noContent(event)
})
