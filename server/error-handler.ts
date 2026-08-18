/**
 * Global Nitro error handler — normalizes every response to JSON.
 * App errors carry { statusCode, code, message, details? }; everything else
 * falls back to a safe generic envelope (stack trace in dev only).
 */

export default defineNitroErrorHandler((error, event) => {
  const statusCode = error.statusCode || 500
  const data = error.data

  if (data && typeof data === 'object' && 'code' in data) {
    const appData = data as { code: string, details?: unknown }
    const body = {
      statusCode,
      code: appData.code,
      message: error.message || 'Something went wrong',
      ...(appData.details !== undefined ? { details: appData.details } : {})
    }
    setResponseStatus(event, statusCode)
    return send(event, JSON.stringify(body), 'application/json')
  }

  const body: Record<string, unknown> = {
    statusCode,
    statusMessage: error.statusMessage,
    message: error.message
  }
  if (import.meta.dev && error.stack) body.stack = error.stack

  setResponseStatus(event, statusCode)
  return send(event, JSON.stringify(body), 'application/json')
})
