/**
 * authService.ts — session (register / login / logout / me) API client.
 */

import type { MailboxDto } from '~/types/mailbox'

export interface AuthUser {
  id: string
  username: string
  email?: string | null
}

export interface MeResponse {
  user: AuthUser
  mailboxes: MailboxDto[]
}

export const authService = {
  async register(input: { username: string, email?: string, password: string }): Promise<AuthUser> {
    const res = await $fetch<{ user: AuthUser }>('/api/auth/register', { method: 'POST', body: input })
    return res.user
  },

  async login(input: { username: string, password: string }): Promise<AuthUser> {
    const res = await $fetch<{ user: AuthUser }>('/api/auth/login', { method: 'POST', body: input })
    return res.user
  },

  async logout(): Promise<void> {
    await $fetch('/api/auth/logout', { method: 'POST' })
  },

  async me(): Promise<MeResponse | null> {
    try {
      return await $fetch<MeResponse>('/api/auth/me')
    } catch {
      return null
    }
  }
}
