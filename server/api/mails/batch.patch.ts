import { z } from 'zod'
import { resolve, Tokens } from '../../core/container'
import { noContent, readValidatedBody } from '../../core/http'
import { requireAuth } from '../../core/session'
import type { MailService } from '../../modules/mails/mail.service'

const batchUpdateSchema = z
  .object({
    mailboxId: z.string().uuid(),
    ids: z.array(z.string().uuid()).min(1).max(200),
    read: z.boolean().optional(),
    starred: z.boolean().optional(),
    folder: z.string().max(30).optional()
  })
  .refine(data => data.read !== undefined || data.starred !== undefined || data.folder !== undefined, {
    message: 'At least one of read, starred or folder is required'
  })

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, batchUpdateSchema)
  const service = resolve<MailService>(Tokens.MailService)

  if (body.read !== undefined) await service.markRead(user.id, body.mailboxId, body.ids, body.read)
  if (body.starred !== undefined) await service.star(user.id, body.mailboxId, body.ids, body.starred)
  if (body.folder !== undefined) await service.move(user.id, body.mailboxId, body.ids, body.folder)

  return noContent(event)
})
