export interface SenderDto {
  id: string
  email: string
  name: string | null
  isDefault: boolean
}

export interface MailboxDto {
  id: string
  name: string
  provider: string
  domain: string | null
  fromAddress: string | null
  senders: SenderDto[]
  inboundAddress: string | null
  webhookConfigured: boolean
  imapHost: string | null
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
  domains: { name: string, status: string }[]
}

export interface SmtpFields {
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUser?: string
  smtpPass?: string
  imapHost?: string
  imapPort?: number
  imapSecure?: boolean
  imapUser?: string
  imapPass?: string
}

export type CreateMailboxInput = {
  name: string
  provider?: 'resend' | 'smtp'
  apiKey?: string
  domain?: string
  fromAddress?: string
  senders?: string[]
  autoWebhook?: boolean
} & SmtpFields

export type UpdateMailboxInput = {
  name?: string
  fromAddress?: string | null
  apiKey?: string
  webhookSecret?: string
  domain?: string
} & SmtpFields

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
