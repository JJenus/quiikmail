export interface MailboxDto {
  id: string
  name: string
  provider: string
  domain: string | null
  fromAddress: string | null
  inboundAddress: string | null
  webhookConfigured: boolean
  lastSyncedAt: string | null
  createdAt: string
}

export interface CreateMailboxResult {
  mailbox: MailboxDto
  webhookAutoConfigured: boolean
  webhookUrl: string
}

export interface ValidateApiKeyResult {
  valid: boolean
  live: boolean
  name: string | null
}

export interface SyncResult {
  added: number
  skipped: number
}

export interface MailsListResponse {
  total: number
  page: number
  limit: number
  rows: import('~/types/mail').Mail[]
  counts: Record<string, number>
}
