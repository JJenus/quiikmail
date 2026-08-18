import { resolve, Tokens } from '../../core/container'
import { requireAuth } from '../../core/session'
import { logger } from '../../core/logger'
import type { AttachmentService } from '../../modules/mails/attachment.service'

/**
 * Redirects to the (possibly refreshed) signed Resend CDN download URL.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const service = resolve<AttachmentService>(Tokens.AttachmentService)
  const download = await service.getDownload(user.id, id)
  if (!download.url) throw createError({ statusCode: 404, statusMessage: 'NOT_FOUND', message: 'Attachment has no download URL' })
  logger.mail.info(`Attachment download served for ${id}`)
  return sendRedirect(event, download.url, 302)
})
