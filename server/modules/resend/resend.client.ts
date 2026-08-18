import type {
  ResendApiKeyInfo,
  ResendAttachmentDetail,
  ResendDomain,
  ResendReceivedEmailDetail,
  ResendReceivedEmailSummary,
  ResendSendPayload,
  ResendWebhookCreated
} from './resend.types'

const RESEND_BASE_URL = 'https://api.resend.com'

/**
 * Thin typed client over the Resend REST API.
 * An instance is created per mailbox (API key is decrypted at request time).
 */
export class ResendClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = RESEND_BASE_URL
  ) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!res.ok) {
      let message = `Resend API error (${res.status})`
      try {
        const body = await res.json()
        if (body?.message) message = body.message
      } catch {
        // ignore body parse failures
      }
      throw new Error(message)
    }
    return res.json() as Promise<T>
  }

  /** GET /api-keys — used to validate a user-supplied API key. */
  async validateKey(): Promise<ResendApiKeyInfo[]> {
    const res = await this.request<{ data: ResendApiKeyInfo[] }>('/api-keys')
    return res.data
  }

  /** GET /emails/receiving — paginated inbound emails (metadata only). */
  async listReceivedEmails(opts?: { limit?: number, before?: string }): Promise<{
    data: ResendReceivedEmailSummary[]
    has_more: boolean
  }> {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.before) params.set('before', opts.before)
    const qs = params.toString()
    return this.request<{ data: ResendReceivedEmailSummary[], has_more: boolean }>(
      `/emails/receiving${qs ? `?${qs}` : ''}`
    )
  }

  /** GET /emails/receiving/{id} — full email body. */
  async getReceivedEmail(id: string): Promise<ResendReceivedEmailDetail> {
    return this.request<ResendReceivedEmailDetail>(`/emails/receiving/${encodeURIComponent(id)}`)
  }

  /** GET /emails/receiving/{id}/attachments/{attachmentId} — signed CDN download URL. */
  async getAttachment(emailId: string, attachmentId: string): Promise<ResendAttachmentDetail> {
    return this.request<ResendAttachmentDetail>(
      `/emails/receiving/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`
    )
  }

  /** POST /webhooks — returns the webhook id plus its whsec_ signing secret (shown once). */
  async createWebhook(url: string, events: string[]): Promise<ResendWebhookCreated> {
    return this.request<ResendWebhookCreated>('/webhooks', {
      method: 'POST',
      body: JSON.stringify({ url, events })
    })
  }

  async deleteWebhook(id: string): Promise<void> {
    await this.request<unknown>(`/webhooks/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  /** POST /emails — send an email. */
  async sendEmail(payload: ResendSendPayload): Promise<{ id: string }> {
    return this.request<{ id: string }>('/emails', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  /** GET /domains — verified sender domains for the account. */
  async listDomains(): Promise<ResendDomain[]> {
    const res = await this.request<{ data: ResendDomain[] }>('/domains')
    return res.data
  }
}

export type ResendClientFactory = (apiKey: string) => ResendClient
