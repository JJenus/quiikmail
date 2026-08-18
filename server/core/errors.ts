/**
 * App errors — thrown by services, serialized by server/error-handler.ts
 * into { statusCode, code, message, details? }.
 */

export interface AppErrorData {
  code: string
  details?: unknown
}

export type ErrorCode
  = | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'INVALID_CREDENTIALS'
    | 'USERNAME_TAKEN'
    | 'NOT_FOUND'
    | 'INVALID_API_KEY'
    | 'RESEND_ERROR'
    | 'MAILBOX_CONFLICT'
    | 'CONFLICT'

/**
 * Creates a serializable H3-compatible error carrying a stable error code.
 */
export function appError(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
  return createError({
    statusCode,
    statusMessage: code,
    message,
    data: { code, details } satisfies AppErrorData
  })
}

export function isAppError(error: unknown): error is {
  statusCode: number
  statusMessage: string
  message: string
  data: AppErrorData
} {
  if (typeof error !== 'object' || error === null) return false
  const candidate = error as Record<string, unknown>
  return typeof candidate.statusCode === 'number' && typeof candidate.data === 'object' && candidate.data !== null
}
