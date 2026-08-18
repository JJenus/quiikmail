/** Types for the Resend REST API (receiving, attachments, webhooks, domains, sending). */

export interface ResendAttachmentMeta {
  id: string
  filename: string
  content_type: string
  content_id: string | null
  content_disposition: string
  size: number
}

export interface ResendReceivedEmailSummary {
  id: string
  to: string[]
  from: string
  created_at: string
  subject: string
  cc: string[]
  bcc: string[]
  reply_to: string[]
  message_id: string
  attachments: ResendAttachmentMeta[]
}

export interface ResendReceivedEmailDetail extends ResendReceivedEmailSummary {
  text: string | null
  html: string | null
  headers: Record<string, unknown> | null
}

export interface ResendAttachmentDetail extends ResendAttachmentMeta {
  download_url: string
  expires_at: string | null
}

export interface ResendDomain {
  id: string
  name: string
  status: string
  region: string
}

export interface ResendWebhookCreated {
  id: string
  url: string
  events: string[]
  status: string
  secret: string
}

export interface ResendSendPayload {
  from: string
  to: string | string[]
  subject: string
  text?: string
  html?: string
  cc?: string | string[]
  bcc?: string | string[]
  reply_to?: string | string[]
}

export interface ResendApiKeyInfo {
  id: string
  name: string
  live: boolean
}

export interface ResendWebhookEvent {
  type: string
  data: {
    email_id: string
    from: string
    to: string[]
    received_for: string[]
    subject: string
    message_id: string
    attachments: Array<{ filename: string, content_type: string }>
    [key: string]: unknown
  }
}
