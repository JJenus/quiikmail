/**
 * mailService.ts — Service layer stub
 *
 * Replace each method body with your real API calls.
 * The useMailStore composable calls these methods;
 * swap the mock implementations here and the UI updates automatically.
 *
 * Example (axios):
 *   import axios from 'axios'
 *   const api = axios.create({ baseURL: '/api/mail' })
 */

import type { Mail, MailFolder } from '~/types/mail'

export interface FetchMailsOptions {
  folder: MailFolder
  page?: number
  limit?: number
  search?: string
}

export interface SendMailPayload {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
}

export interface MailService {
  fetchMails(opts: FetchMailsOptions): Promise<Mail[]>
  fetchMail(id: string): Promise<Mail>
  sendMail(payload: SendMailPayload): Promise<Mail>
  saveDraft(payload: Partial<SendMailPayload> & { id?: string }): Promise<Mail>
  markRead(ids: string[], read: boolean): Promise<void>
  starMail(id: string, starred: boolean): Promise<void>
  moveToFolder(ids: string[], folder: MailFolder): Promise<void>
  deleteMails(ids: string[]): Promise<void>
}

/**
 * Stub implementation — returns mock data.
 * Replace with real HTTP calls in production.
 */
export function createMailService(): MailService {
  return {
    async fetchMails(_opts) {
      // TODO: GET /api/mails?folder=inbox&page=1&limit=50&search=query
      return []
    },

    async fetchMail(_id) {
      // TODO: GET /api/mails/:id
      throw new Error('Not implemented')
    },

    async sendMail(_payload) {
      // TODO: POST /api/mails/send
      throw new Error('Not implemented')
    },

    async saveDraft(_payload) {
      // TODO: POST /api/mails/drafts  |  PATCH /api/mails/drafts/:id
      throw new Error('Not implemented')
    },

    async markRead(_ids, _read) {
      // TODO: PATCH /api/mails/batch  { ids, read }
    },

    async starMail(_id, _starred) {
      // TODO: PATCH /api/mails/:id  { starred }
    },

    async moveToFolder(_ids, _folder) {
      // TODO: PATCH /api/mails/batch  { ids, folder }
    },

    async deleteMails(_ids) {
      // TODO: DELETE /api/mails/batch  { ids }
    }
  }
}
