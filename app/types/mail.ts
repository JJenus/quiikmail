export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'starred' | 'archive' | 'spam' | 'trash'

export interface MailAddress {
  name: string
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
}

export interface MailFolder_Config {
  key: MailFolder
  label: string
  icon: string
  count?: number
}

export interface ComposeState {
  open: boolean
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  showCc: boolean
  showBcc: boolean
  draftId?: string
  minimized: boolean
}

export interface MailState {
  mails: Mail[]
  selectedId: string | null
  activeFolder: MailFolder
  searchQuery: string
  loading: boolean
  compose: ComposeState
  selectedIds: Set<string>
  sidebarOpen: boolean
}
