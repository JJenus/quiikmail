<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const {
  state, folderMails, selectedMail,
  selectAll, clearSelection, deleteMails,
  archiveMails, markRead, isSelected
} = useMailStore()

const folderLabels: Record<string, string> = {
  inbox: 'Inbox', sent: 'Sent', drafts: 'Drafts',
  starred: 'Starred', archive: 'Archive', spam: 'Spam', trash: 'Trash'
}

const anySelected = computed(() => state.selectedIds.size > 0)
const allSelected = computed(() =>
  folderMails.value.length > 0 && folderMails.value.every(m => isSelected(m.id))
)

function handleSelectAll() {
  if (allSelected.value) clearSelection()
  else selectAll()
}

function handleDeleteSelected() {
  deleteMails([...state.selectedIds])
}

function handleArchiveSelected() {
  archiveMails([...state.selectedIds])
}

function handleMarkRead(read: boolean) {
  markRead([...state.selectedIds], read)
  clearSelection()
}
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
      <div class="flex items-center gap-2">
        <UCheckbox
          :model-value="allSelected"
          :indeterminate="anySelected && !allSelected"
          @update:model-value="handleSelectAll"
        />
        <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-200 ml-1">
          {{ folderLabels[state.activeFolder] }}
        </h2>
        <span
          v-if="folderMails.length"
          class="text-xs text-gray-400 dark:text-gray-500"
        >
          ({{ folderMails.length }})
        </span>
      </div>

      <!-- Toolbar — bulk actions or refresh -->
      <div class="flex items-center gap-0.5">
        <template v-if="anySelected">
          <IconBtn icon="i-lucide-archive" label="Archive" size="sm" @click="handleArchiveSelected" />
          <IconBtn icon="i-lucide-trash-2" label="Delete" size="sm" color="danger" @click="handleDeleteSelected" />
          <UDropdownMenu
            :items="[
              [
                { label: 'Mark as read', icon: 'i-lucide-mail-open', onSelect: () => handleMarkRead(true) },
                { label: 'Mark as unread', icon: 'i-lucide-mail', onSelect: () => handleMarkRead(false) }
              ]
            ]"
          >
            <IconBtn icon="i-lucide-more-horizontal" label="More" size="sm" />
          </UDropdownMenu>
        </template>
        <IconBtn v-else icon="i-lucide-refresh-cw" label="Refresh" size="sm" />
      </div>
    </div>

    <!-- Search -->
    <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800 shrink-0">
      <UInput
        v-model="state.searchQuery"
        placeholder="Search mail..."
        icon="i-lucide-search"
        size="sm"
        variant="soft"
        class="w-full"
      />
    </div>

    <!-- Mail List -->
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
