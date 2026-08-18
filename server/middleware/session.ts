/**
 * Session guard — every /api/** route requires a valid session,
 * except auth endpoints and the public webhook receiver.
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return
  if (path.startsWith('/api/auth/') || path.startsWith('/api/webhooks/') || path.startsWith('/api/_auth/')) return
  await requireUserSession(event)
})
