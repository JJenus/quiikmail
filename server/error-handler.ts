/**
 * Global Nitro error handler - normalizes every response to JSON.
 * App errors carry { statusCode, code, message, details? }; unexpected errors
 * return a generic "Internal server error" message. The original message and
 * stack trace are only included in development builds.
 */

export default defineNitroErrorHandler((error, event) => {
  const statusCode = error.statusCode || 500
  const data = error.data
  const isDev = import.meta.dev

  if (data && typeof data === 'object' && 'code' in data) {
    const appData = data as { code: string, details?: unknown }
    const body: Record<string, unknown> = {
      statusCode,
      code: appData.code,
      message: error.message || 'Something went wrong',
      ...(appData.details !== undefined ? { details: appData.details } : {})
    }
    if (isDev && statusCode >= 500 && error.stack) body.stack = error.stack
    setResponseStatus(event, statusCode)
    return send(event, JSON.stringify(body), 'application/json')
  }

  // Unexpected error: never leak internals to the client.
  const body: Record<string, unknown> = {
    statusCode,
    code: 'INTERNAL_ERROR',
    message: statusCode >= 500 ? 'Internal server error' : (error.message || 'Something went wrong')
  }
  if (isDev) {
    if (error.message) body.details = error.message
    if (error.stack) body.stack = error.stack
  }

  setResponseStatus(event, statusCode)
  return send(event, JSON.stringify(body), 'application/json')
})
