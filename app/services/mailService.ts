/**
 * mailService.ts — real API implementation of the MailService contract.
 * All calls are scoped to a mailbox via `mailboxId`.
 */

import type { Mail, MailFolder } from '~/types/mail'
import type { MailsListResponse } from '~/types/mailbox'

export interface FetchMailsOptions {
  folder: MailFolder
  mailboxId: string
  page?: number
  limit?: number
  search?: string
}

export interface SendMailPayload {
  mailboxId: string
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
}

export interface SaveDraftPayload {
  mailboxId: string
  id?: string
  to?: string
  cc?: string
  bcc?: string
  subject?: string
  body?: string
}

export interface MailService {
  fetchMails(opts: FetchMailsOptions): Promise<MailsListResponse>
  fetchMail(id: string, mailboxId: string): Promise<Mail>
  sendMail(payload: SendMailPayload): Promise<Mail>
  saveDraft(payload: SaveDraftPayload): Promise<Mail>
  markRead(ids: string[], read: boolean, mailboxId: string): Promise<void>
  starMail(id: string, starred: boolean, mailboxId: string): Promise<void>
  moveToFolder(ids: string[], folder: MailFolder, mailboxId: string): Promise<void>
  deleteMails(ids: string[], mailboxId: string): Promise<void>
}

const splitRecipients = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)

export function createMailService(): MailService {
  return {
    async fetchMails(opts) {
      return $fetch<MailsListResponse>('/api/mails', {
        query: {
          mailboxId: opts.mailboxId,
          folder: opts.folder,
          page: opts.page ?? 1,
          limit: opts.limit ?? 50,
          search: opts.search || undefined
        }
      })
    },

    async fetchMail(id, mailboxId) {
      return $fetch<Mail>(`/api/mails/${id}`, { query: { mailboxId } })
    },

    async sendMail(payload) {
      return $fetch<Mail>('/api/mails/send', {
        method: 'POST',
        body: {
          mailboxId: payload.mailboxId,
          to: splitRecipients(payload.to),
          cc: payload.cc ? splitRecipients(payload.cc) : undefined,
          bcc: payload.bcc ? splitRecipients(payload.bcc) : undefined,
          subject: payload.subject,
          body: payload.body
        }
      })
    },

    async saveDraft(payload) {
      const body = {
        mailboxId: payload.mailboxId,
        to: payload.to ? splitRecipients(payload.to) : undefined,
        cc: payload.cc ? splitRecipients(payload.cc) : undefined,
        bcc: payload.bcc ? splitRecipients(payload.bcc) : undefined,
        subject: payload.subject,
        body: payload.body
      }
      if (payload.id) {
        return $fetch<Mail>(`/api/mails/drafts/${payload.id}`, { method: 'PATCH', body })
      }
      return $fetch<Mail>('/api/mails/drafts', { method: 'POST', body })
    },

    async markRead(ids, read, mailboxId) {
      await $fetch('/api/mails/batch', { method: 'PATCH', body: { mailboxId, ids, read } })
    },

    async starMail(id, starred, mailboxId) {
      await $fetch('/api/mails/batch', { method: 'PATCH', body: { mailboxId, ids: [id], starred } })
    },

    async moveToFolder(ids, folder, mailboxId) {
      await $fetch('/api/mails/batch', { method: 'PATCH', body: { mailboxId, ids, folder } })
    },

    async deleteMails(ids, mailboxId) {
      await $fetch('/api/mails/batch', { method: 'DELETE', body: { mailboxId, ids } })
    }
  }
}
