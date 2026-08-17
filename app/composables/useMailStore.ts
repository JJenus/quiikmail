import { mockMails } from '~/data/mockMails'
import type { Mail, MailFolder, MailState, ComposeState } from '~/types/mail'

const defaultCompose = (): ComposeState => ({
  open: false,
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  showCc: false,
  showBcc: false,
  minimized: false
})

// Module-level singleton state (shared across all composable calls)
const state = reactive<MailState>({
  mails: [...mockMails],
  selectedId: null,
  activeFolder: 'inbox',
  searchQuery: '',
  loading: false,
  compose: defaultCompose(),
  selectedIds: new Set(),
  sidebarOpen: false
})

export function useMailStore() {
  // ─── Getters ────────────────────────────────────────────────
  const folderMails = computed(() => {
    const baseMails = state.activeFolder === 'starred'
      ? state.mails.filter(m => m.starred)
      : state.mails.filter(m => m.folder === state.activeFolder)

    if (!state.searchQuery) return baseMails
    const q = state.searchQuery.toLowerCase()
    return baseMails.filter(m =>
      m.subject.toLowerCase().includes(q)
      || m.from.name.toLowerCase().includes(q)
      || m.preview.toLowerCase().includes(q)
    )
  })

  const selectedMail = computed<Mail | null>(() =>
    state.mails.find(m => m.id === state.selectedId) ?? null
  )

  const unreadCount = (folder: MailFolder) => {
    if (folder === 'starred') return state.mails.filter(m => m.starred && !m.read).length
    return state.mails.filter(m => m.folder === folder && !m.read).length
  }

  const totalUnread = computed(() => unreadCount('inbox'))

  const isSelected = (id: string) => state.selectedIds.has(id)

  // ─── Actions ────────────────────────────────────────────────
  function selectMail(id: string | null) {
    state.selectedId = id
    if (id) {
      const mail = state.mails.find(m => m.id === id)
      if (mail && !mail.read) mail.read = true
    }
  }

  function setFolder(folder: MailFolder) {
    state.activeFolder = folder
    state.selectedId = null
    state.selectedIds = new Set()
    state.searchQuery = ''
    state.sidebarOpen = false
  }

  function toggleStar(id: string) {
    const mail = state.mails.find(m => m.id === id)
    if (mail) mail.starred = !mail.starred
  }

  function markRead(ids: string[], read = true) {
    ids.forEach(id => {
      const mail = state.mails.find(m => m.id === id)
      if (mail) mail.read = read
    })
  }

  function moveToFolder(ids: string[], folder: MailFolder) {
    ids.forEach(id => {
      const mail = state.mails.find(m => m.id === id)
      if (mail) mail.folder = folder
    })
    state.selectedIds = new Set()
    if (ids.includes(state.selectedId ?? '')) state.selectedId = null
  }

  function deleteMails(ids: string[]) {
    moveToFolder(ids, 'trash')
  }

  function archiveMails(ids: string[]) {
    moveToFolder(ids, 'archive')
  }

  function toggleSelectMail(id: string) {
    const next = new Set(state.selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    state.selectedIds = next
  }

  function selectAll() {
    state.selectedIds = new Set(folderMails.value.map(m => m.id))
  }

  function clearSelection() {
    state.selectedIds = new Set()
  }

  // ─── Compose ────────────────────────────────────────────────
  function openCompose(prefill?: Partial<ComposeState>) {
    state.compose = { ...defaultCompose(), open: true, ...prefill }
  }

  function closeCompose() {
    state.compose = defaultCompose()
  }

  function minimizeCompose() {
    state.compose.minimized = !state.compose.minimized
  }

  function saveDraft() {
    const { to, subject, body } = state.compose
    if (!to && !subject && !body) return
    const existing = state.compose.draftId
      ? state.mails.find(m => m.id === state.compose.draftId)
      : null

    if (existing) {
      existing.subject = subject || '(no subject)'
      existing.preview = body.slice(0, 100)
      existing.body = body
      existing.date = new Date().toISOString()
    }
    else {
      const id = `draft-${Date.now()}`
      state.mails.unshift({
        id,
        from: { name: 'Me', email: 'me@quiikmail.com' },
        to: [{ name: to, email: to }],
        subject: subject || '(no subject)',
        preview: body.slice(0, 100),
        body,
        date: new Date().toISOString(),
        folder: 'drafts',
        read: true,
        starred: false
      })
      state.compose.draftId = id
    }
  }

  function sendMail() {
    const { to, subject, body, draftId } = state.compose
    if (!to) return false

    if (draftId) {
      state.mails = state.mails.filter(m => m.id !== draftId)
    }

    state.mails.unshift({
      id: `sent-${Date.now()}`,
      from: { name: 'Me', email: 'me@quiikmail.com' },
      to: [{ name: to, email: to }],
      subject: subject || '(no subject)',
      preview: body.slice(0, 100),
      body,
      date: new Date().toISOString(),
      folder: 'sent',
      read: true,
      starred: false
    })

    closeCompose()
    return true
  }

  function replyTo(mail: Mail) {
    openCompose({
      to: mail.from.email,
      subject: mail.subject.startsWith('Re:') ? mail.subject : `Re: ${mail.subject}`,
      body: `\n\n--- On ${new Date(mail.date).toLocaleDateString()}, ${mail.from.name} wrote:\n${mail.body}`
    })
  }

  function forwardMail(mail: Mail) {
    openCompose({
      subject: mail.subject.startsWith('Fwd:') ? mail.subject : `Fwd: ${mail.subject}`,
      body: `\n\n--- Forwarded message ---\nFrom: ${mail.from.name} <${mail.from.email}>\nDate: ${new Date(mail.date).toLocaleDateString()}\nSubject: ${mail.subject}\n\n${mail.body}`
    })
  }

  return {
    state,
    folderMails,
    selectedMail,
    unreadCount,
    totalUnread,
    isSelected,
    selectMail,
    setFolder,
    toggleStar,
    markRead,
    moveToFolder,
    deleteMails,
    archiveMails,
    toggleSelectMail,
    selectAll,
    clearSelection,
    openCompose,
    closeCompose,
    minimizeCompose,
    saveDraft,
    sendMail,
    replyTo,
    forwardMail
  }
}
