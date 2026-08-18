/**
 * mailboxService.ts — mailbox management API client.
 */

import type {
  CreateMailboxResult,
  MailboxDto,
  SyncResult,
  ValidateApiKeyResult
} from '~/types/mailbox'

export const mailboxService = {
  async list(): Promise<MailboxDto[]> {
    return $fetch<MailboxDto[]>('/api/mailboxes')
  },

  async create(input: { name: string, apiKey: string, fromAddress?: string, autoWebhook?: boolean }): Promise<CreateMailboxResult> {
    return $fetch<CreateMailboxResult>('/api/mailboxes', { method: 'POST', body: input })
  },

  async update(id: string, input: { name?: string, fromAddress?: string | null, apiKey?: string, webhookSecret?: string }): Promise<MailboxDto> {
    return $fetch<MailboxDto>(`/api/mailboxes/${id}`, { method: 'PATCH', body: input })
  },

  async remove(id: string): Promise<void> {
    await $fetch(`/api/mailboxes/${id}`, { method: 'DELETE' })
  },

  async validateApiKey(apiKey: string): Promise<ValidateApiKeyResult> {
    return $fetch<ValidateApiKeyResult>('/api/mailboxes/validate', { method: 'POST', body: { apiKey } })
  },

  async sync(id: string): Promise<SyncResult> {
    return $fetch<SyncResult>(`/api/mailboxes/${id}/sync`, { method: 'POST' })
  }
}
