/**
 * mailboxService.ts - mailbox management API client.
 */

import type {
  CreateMailboxInput,
  CreateMailboxResult,
  MailboxDto,
  SenderDto,
  SmtpFields,
  SyncResult,
  UpdateMailboxInput,
  ValidateApiKeyResult
} from '~/types/mailbox'

export const mailboxService = {
  async list(): Promise<MailboxDto[]> {
    return $fetch<MailboxDto[]>('/api/mailboxes')
  },

  async create(input: CreateMailboxInput): Promise<CreateMailboxResult> {
    return $fetch<CreateMailboxResult>('/api/mailboxes', { method: 'POST', body: input })
  },

  async update(id: string, input: UpdateMailboxInput): Promise<MailboxDto> {
    return $fetch<MailboxDto>(`/api/mailboxes/${id}`, { method: 'PATCH', body: input })
  },

  async remove(id: string): Promise<void> {
    await $fetch(`/api/mailboxes/${id}`, { method: 'DELETE' })
  },

  async validateApiKey(apiKey: string): Promise<ValidateApiKeyResult> {
    return $fetch<ValidateApiKeyResult>('/api/mailboxes/validate', { method: 'POST', body: { apiKey } })
  },

  async testSmtp(input: { host: string, port: number, secure: boolean, user: string, pass: string }): Promise<{ ok: boolean }> {
    return $fetch<{ ok: boolean }>('/api/mailboxes/test-smtp', { method: 'POST', body: input })
  },

  async addSender(mailboxId: string, input: { email: string, name?: string }): Promise<SenderDto> {
    return $fetch<SenderDto>(`/api/mailboxes/${mailboxId}/senders`, { method: 'POST', body: input })
  },

  async updateSender(mailboxId: string, senderId: string, input: { name?: string, isDefault?: boolean }): Promise<SenderDto> {
    return $fetch<SenderDto>(`/api/mailboxes/${mailboxId}/senders/${senderId}`, { method: 'PATCH', body: input })
  },

  async removeSender(mailboxId: string, senderId: string): Promise<void> {
    await $fetch(`/api/mailboxes/${mailboxId}/senders/${senderId}`, { method: 'DELETE' })
  },

  async sync(id: string): Promise<SyncResult> {
    return $fetch<SyncResult>(`/api/mailboxes/${id}/sync`, { method: 'POST' })
  }
}

export type { SmtpFields }
