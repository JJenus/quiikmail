import { z } from 'zod'
import { resolve, Tokens } from '../../../core/container'
import { ok, readValidatedBody } from '../../../core/http'
import { requireAuth } from '../../../core/session'
import type { MailService } from '../../../modules/mails/mail.service'

const updateDraftSchema = z.object({
  mailboxId: z.string().uuid(),
  to: z.array(z.string().trim().min(1)).max(50).optional(),
  cc: z.array(z.string().trim().min(1)).max(50).optional(),
  bcc: z.array(z.string().trim().min(1)).max(50).optional(),
  subject: z.string().trim().max(500).optional(),
  body: z.string().max(200000).optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, updateDraftSchema)
  const service = resolve<MailService>(Tokens.MailService)
  return ok(event, await service.saveDraft(user.id, body.mailboxId, { ...body, id }))
})
