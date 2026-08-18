import type { H3Event } from 'h3'

export interface AuthUser {
  id: string
  username: string
  email?: string | null
}

/**
 * Requires a valid session and returns the authenticated user.
 * Throws 401 when the session is missing or expired.
 */
export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const session = await requireUserSession(event)
  return session.user as AuthUser
}
