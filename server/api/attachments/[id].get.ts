import { Readable } from 'node:stream'
import { resolve, Tokens } from '../../core/container'
import { requireAuth } from '../../core/session'
import { logger } from '../../core/logger'
import type { AttachmentService } from '../../modules/mails/attachment.service'

/**
 * Serves attachment downloads: streams locally stored bytes for IMAP
 * attachments, otherwise redirects to the (possibly refreshed) signed
 * Resend CDN URL.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const service = resolve<AttachmentService>(Tokens.AttachmentService)
  const download = await service.getDownload(user.id, id)

  if (download.data) {
    setResponseHeader(event, 'Content-Type', download.contentType ?? 'application/octet-stream')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${download.filename.replace(/["\\]/g, '')}"`)
    setResponseHeader(event, 'Content-Length', download.data.length)
    logger.mail.info(`Attachment bytes served for ${id}`)
    return sendStream(event, Readable.from(download.data))
  }

  if (!download.url) throw createError({ statusCode: 404, statusMessage: 'NOT_FOUND', message: 'Attachment has no download URL' })
  logger.mail.info(`Attachment download served for ${id}`)
  return sendRedirect(event, download.url, 302)
})
