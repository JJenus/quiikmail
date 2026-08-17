<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const {
  state, folderMails, unreadCount,
  selectAll, clearSelection, deleteMails,
  archiveMails, markRead, isSelected
} = useMailStore()

const folderLabels: Record<string, string> = {
  inbox: 'Inbox', sent: 'Sent', drafts: 'Draft',
  starred: 'Starred', important: 'Important', snoozed: 'Snoozed',
  archive: 'Archived', spam: 'Spam', trash: 'Trash'
}

const anySelected = computed(() => state.selectedIds.size > 0)
const allSelected = computed(() =>
  folderMails.value.length > 0 && folderMails.value.every(m => isSelected(m.id))
)

function handleSelectAll() {
  if (allSelected.value) clearSelection()
  else selectAll()
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">

    <!-- Mobile-only search (desktop search is in MailTopBar) -->
    <div class="md:hidden px-3 pt-3 pb-1 shrink-0">
      <div class="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-slate-400 shrink-0" />
        <input
          v-model="state.searchQuery"
          type="text"
          placeholder="Search mail here..."
          class="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 outline-none"
        />
        <button
          v-if="state.searchQuery"
          class="text-slate-400 hover:text-slate-600 transition-colors"
          @click="state.searchQuery = ''"
        >
          <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Folder heading + meta -->
    <div class="px-4 pt-3 pb-2 shrink-0">
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="text-[17px] font-bold text-slate-800">
            {{ folderLabels[state.activeFolder] ?? state.activeFolder }}
          </h2>
          <div class="flex items-center gap-2 mt-0.5 text-[12px] text-slate-400">
            <UIcon name="i-lucide-mails" class="w-3.5 h-3.5" />
            <span>{{ folderMails.length.toLocaleString() }} Messages</span>
            <span
              v-if="unreadCount(state.activeFolder) > 0"
              class="flex items-center gap-1 text-violet-500 font-medium"
            >
              <UIcon name="i-lucide-circle" class="w-2 h-2 fill-current" />
              {{ unreadCount(state.activeFolder) }} Unread
            </span>
          </div>
        </div>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0"
        >
          <UIcon name="i-lucide-list-filter" class="w-3.5 h-3.5" />
          Filter
        </button>
      </div>
    </div>

    <!-- Bulk toolbar -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="anySelected"
        class="mx-3 mb-1 flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 rounded-xl shrink-0"
      >
        <input
          type="checkbox"
          :checked="allSelected"
          class="w-4 h-4 rounded border-slate-300 accent-violet-600 cursor-pointer"
          @change="handleSelectAll"
        />
        <span class="text-[12px] font-medium text-violet-700 flex-1">
          {{ state.selectedIds.size }} selected
        </span>
        <IconBtn icon="i-lucide-archive" label="Archive" size="sm" @click="archiveMails([...state.selectedIds])" />
        <IconBtn icon="i-lucide-trash-2" label="Delete" size="sm" :danger="true" @click="deleteMails([...state.selectedIds])" />
        <IconBtn icon="i-lucide-mail-open" label="Mark read" size="sm" @click="markRead([...state.selectedIds], true)" />
        <IconBtn icon="i-lucide-x" label="Clear" size="sm" @click="clearSelection" />
      </div>
    </Transition>

    <!-- Mail list -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <template v-if="folderMails.length">
        <MailListItem
          v-for="mail in folderMails"
          :key="mail.id"
          :mail="mail"
          :active="state.selectedId === mail.id"
        />
      </template>
      <BaseEmptyState
        v-else
        icon="i-lucide-inbox"
        title="Nothing here"
        :description="state.searchQuery ? 'No messages match your search.' : 'This folder is empty.'"
      />
    </div>
  </div>
</template>
