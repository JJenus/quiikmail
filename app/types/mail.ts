export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'starred' | 'important' | 'snoozed' | 'archive' | 'spam' | 'trash'

export type MailFilter = 'all' | 'unread' | 'attachments'

export interface MailAddress {
  name: string | null
  email: string
  avatar?: string
}

export interface MailAttachment {
  id: string
  name: string
  size: number
  type: string
  url?: string
}

export interface Mail {
  id: string
  from: MailAddress
  to: MailAddress[]
  cc?: MailAddress[]
  bcc?: MailAddress[]
  subject: string
  body: string
  bodyHtml?: string
  preview: string
  date: string
  folder: MailFolder
  read: boolean
  starred: boolean
  attachments?: MailAttachment[]
  labels?: string[]
  threadId?: string
  threadCount?: number
  extraAvatars?: number
}

export interface MailLabel {
  id: string
  name: string
  color: string
  count?: number
}

export interface ComposeState {
  open: boolean
  from: string
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  showCc: boolean
  showBcc: boolean
  draftId?: string
  minimized: boolean
  replyTo?: string
}

export interface MailState {
  mails: Mail[]
  selectedId: string | null
  activeFolder: MailFolder
  searchQuery: string
  filter: MailFilter
  loading: boolean
  compose: ComposeState
  selectedIds: Set<string>
  sidebarOpen: boolean
  labels: MailLabel[]
}
