import { createMailService } from '~/services/mailService'
import { authService } from '~/services/authService'
import { mailboxService } from '~/services/mailboxService'
import type { Mail, MailFolder, MailState, MailLabel, ComposeState } from '~/types/mail'
import type { MailboxDto } from '~/types/mailbox'

const service = createMailService()

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

const defaultLabels: MailLabel[] = [
  { id: 'personal', name: 'Personal', color: '#F59E0B' },
  { id: 'clients', name: 'Clients', color: '#10B981' },
  { id: 'socials', name: 'Socials', color: '#3B82F6' }
]

interface MailStateExtended extends MailState {
  mailboxes: MailboxDto[]
  activeMailboxId: string | null
  initialized: boolean
  syncing: boolean
  counts: Record<string, number>
  setupOpen: boolean
}

// Module-level singleton — shared across all composable calls
const state = reactive<MailStateExtended>({
  mails: [],
  selectedId: null,
  activeFolder: 'inbox',
  searchQuery: '',
  loading: false,
  compose: defaultCompose(),
  selectedIds: new Set(),
  sidebarOpen: false,
  labels: [...defaultLabels],
  mailboxes: [],
  activeMailboxId: null,
  initialized: false,
  syncing: false,
  counts: {},
  setupOpen: false
})

const activeMailbox = computed<MailboxDto | null>(() =>
  state.mailboxes.find(m => m.id === state.activeMailboxId) ?? null
)

async function loadFolder(folder: MailFolder, search?: string) {
  const mailboxId = state.activeMailboxId
  if (!mailboxId) {
    state.mails = []
    state.counts = {}
    return
  }
  state.loading = true
  try {
    const res = await service.fetchMails({
      folder,
      mailboxId,
      page: 1,
      limit: 50,
      search: search ?? state.searchQuery
    })
    state.mails = res.rows
    state.counts = res.counts
  } finally {
    state.loading = false
  }
}

export function useMailStore() {
  const folderMails = computed(() => {
    if (!state.searchQuery) return state.mails
    const q = state.searchQuery.toLowerCase()
    return state.mails.filter(m =>
      m.subject.toLowerCase().includes(q)
      || (m.from.name ?? m.from.email).toLowerCase().includes(q)
      || m.preview.toLowerCase().includes(q)
    )
  })

  const selectedMail = computed<Mail | null>(() =>
    state.mails.find(m => m.id === state.selectedId) ?? null
  )

  const unreadCount = (folder: MailFolder) => {
    const total = state.counts[folder] ?? 0
    if (folder === 'starred' || folder === 'important') return total
    const unread = state.counts[`${folder}_unread`]
    return unread ?? total
  }

  const folderTotal = (folder: MailFolder) => state.counts[folder] ?? 0

  const isSelected = (id: string) => state.selectedIds.has(id)

  async function init() {
    if (state.initialized) return
    const me = await authService.me()
    if (!me) return
    state.mailboxes = me.mailboxes
    state.initialized = true
    if (me.mailboxes.length === 0) {
      state.setupOpen = true
      return
    }
    const saved = localStorage.getItem('quiikmail-mailbox')
    state.activeMailboxId = me.mailboxes.some(m => m.id === saved)
      ? saved
      : me.mailboxes[0]!.id
    await loadFolder(state.activeFolder)
  }

  /** Re-fetches mailboxes after setup/removal; loads the first mailbox when none is active. */
  async function reloadMailboxes() {
    const me = await authService.me()
    if (!me) return
    state.mailboxes = me.mailboxes
    if (!state.activeMailboxId && me.mailboxes.length > 0) {
      const saved = localStorage.getItem('quiikmail-mailbox')
      state.activeMailboxId = me.mailboxes.some(m => m.id === saved)
        ? saved
        : me.mailboxes[0]!.id
      await loadFolder(state.activeFolder)
    }
  }

  async function setActiveMailbox(id: string) {
    if (id === state.activeMailboxId) return
    state.activeMailboxId = id
    localStorage.setItem('quiikmail-mailbox', id)
    state.selectedId = null
    state.selectedIds = new Set()
    await loadFolder(state.activeFolder)
  }

  async function syncNow() {
    if (!state.activeMailboxId || state.syncing) return
    state.syncing = true
    try {
      await mailboxService.sync(state.activeMailboxId)
      await loadFolder(state.activeFolder)
    } finally {
      state.syncing = false
    }
  }

  function selectMail(id: string | null) {
    state.selectedId = id
    if (id) {
      const mail = state.mails.find(m => m.id === id)
      if (mail && !mail.read) {
        mail.read = true
        if (state.activeMailboxId) service.markRead([id], true, state.activeMailboxId)
      }
    }
  }

  async function setFolder(folder: MailFolder) {
    state.activeFolder = folder
    state.selectedId = null
    state.selectedIds = new Set()
    state.searchQuery = ''
    state.sidebarOpen = false
    await loadFolder(folder)
  }

  async function refreshMails() {
    await loadFolder(state.activeFolder, state.searchQuery)
  }

  function toggleStar(id: string) {
    const mail = state.mails.find(m => m.id === id)
    if (!mail || !state.activeMailboxId) return
    mail.starred = !mail.starred
    service.starMail(id, mail.starred, state.activeMailboxId)
  }

  async function markRead(ids: string[], read = true) {
    ids.forEach((id) => {
      const mail = state.mails.find(m => m.id === id)
      if (mail) mail.read = read
    })
    if (state.activeMailboxId) await service.markRead(ids, read, state.activeMailboxId)
  }

  async function moveToFolder(ids: string[], folder: MailFolder) {
    const mailboxId = state.activeMailboxId
    if (!mailboxId) return
    state.mails = state.mails.filter(m => !ids.includes(m.id))
    state.selectedIds = new Set()
    if (ids.includes(state.selectedId ?? '')) state.selectedId = null
    await service.moveToFolder(ids, folder, mailboxId)
    await loadFolder(state.activeFolder)
  }

  function deleteMails(ids: string[]) {
    return moveToFolder(ids, 'trash')
  }

  function archiveMails(ids: string[]) {
    return moveToFolder(ids, 'archive')
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

  function openCompose(prefill?: Partial<ComposeState>) {
    state.compose = { ...defaultCompose(), open: true, ...prefill }
  }

  function closeCompose() {
    state.compose = defaultCompose()
  }

  function minimizeCompose() {
    state.compose.minimized = !state.compose.minimized
  }

  async function saveDraft() {
    const mailboxId = state.activeMailboxId
    if (!mailboxId) return null
    const { to, cc, bcc, subject, body, draftId } = state.compose
    if (!to && !subject && !body) return null
    const draft = await service.saveDraft({
      mailboxId,
      id: draftId,
      to,
      cc,
      bcc,
      subject,
      body
    })
    state.compose.draftId = draft.id
    return draft
  }

  async function sendMail() {
    const mailboxId = state.activeMailboxId
    if (!mailboxId) return false
    const { to, cc, bcc, subject, body } = state.compose
    if (!to) return false
    try {
      const sent = await service.sendMail({ mailboxId, to, cc, bcc, subject, body })
      state.mails = state.mails.filter(m => m.id !== state.compose.draftId)
      state.mails.unshift(sent)
      closeCompose()
      await loadFolder(state.activeFolder)
      return true
    } catch {
      return false
    }
  }

  function replyTo(mail: Mail) {
    openCompose({
      to: mail.from.email,
      subject: mail.subject.startsWith('Re:') ? mail.subject : `Re: ${mail.subject}`,
      body: `\n\n— On ${new Date(mail.date).toLocaleDateString()}, ${mail.from.name} wrote:\n${mail.body}`,
      replyTo: mail.id
    })
  }

  function forwardMail(mail: Mail) {
    openCompose({
      subject: mail.subject.startsWith('Fwd:') ? mail.subject : `Fwd: ${mail.subject}`,
      body: `\n\n— Forwarded message —\nFrom: ${mail.from.name} <${mail.from.email}>\nDate: ${new Date(mail.date).toLocaleDateString()}\nSubject: ${mail.subject}\n\n${mail.body}`
    })
  }

  function openSetup() {
    state.setupOpen = true
  }

  function closeSetup() {
    state.setupOpen = false
  }

  return {
    state,
    activeMailbox,
    folderMails,
    selectedMail,
    unreadCount,
    folderTotal,
    isSelected,
    init,
    reloadMailboxes,
    setActiveMailbox,
    syncNow,
    selectMail,
    setFolder,
    refreshMails,
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
    forwardMail,
    openSetup,
    closeSetup
  }
}
