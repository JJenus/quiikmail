import { z } from 'zod'
import { resolve, Tokens } from '../../core/container'
import { created, readValidatedBody } from '../../core/http'
import { requireAuth } from '../../core/session'
import type { MailService } from '../../modules/mails/mail.service'

const sendMailSchema = z.object({
  mailboxId: z.string().uuid(),
  from: z.string().trim().max(254).optional(),
  to: z.array(z.string().trim().min(1)).min(1, 'At least one recipient is required').max(50),
  cc: z.array(z.string().trim().min(1)).max(50).optional(),
  bcc: z.array(z.string().trim().min(1)).max(50).optional(),
  subject: z.string().trim().max(500).default(''),
  body: z.string().max(200000).optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, sendMailSchema)
  const service = resolve<MailService>(Tokens.MailService)
  return created(event, await service.send(user.id, body.mailboxId, body))
})
