import { z } from 'zod'
import { resolve, Tokens } from '../../core/container'
import { ok, readValidatedQuery } from '../../core/http'
import { requireAuth } from '../../core/session'
import type { MailService } from '../../modules/mails/mail.service'

const listMailsQuery = z.object({
  mailboxId: z.string().uuid().optional(),
  folder: z.string().max(30).optional(),
  search: z.string().trim().max(100).optional(),
  unread: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  withAttachments: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30)
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = await readValidatedQuery(event, listMailsQuery)
  const service = resolve<MailService>(Tokens.MailService)
  return ok(event, await service.list(user.id, query))
})
