<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'
import type { MailFilter } from '~/types/mail'

const {
  state, folderMails, unreadCount,
  selectAll, clearSelection, deleteMails,
  archiveMails, markRead, isSelected, setFilter
} = useMailStore()

const folderLabels: Record<string, string> = {
  inbox: 'Inbox', sent: 'Sent', drafts: 'Draft',
  starred: 'Starred', important: 'Important', snoozed: 'Snoozed',
  archive: 'Archived', spam: 'Spam', trash: 'Trash'
}

const filterItems: { label: string, icon: string, value: MailFilter }[] = [
  { label: 'All mail', icon: 'i-lucide-inbox', value: 'all' },
  { label: 'Unread', icon: 'i-lucide-mail-open', value: 'unread' },
  { label: 'Has attachments', icon: 'i-lucide-paperclip', value: 'attachments' }
]

const anySelected = computed(() => state.selectedIds.size > 0)
const allSelected = computed(() =>
  folderMails.value.length > 0 && folderMails.value.every(m => isSelected(m.id))
)

const emptyDescription = computed(() => {
  if (state.searchQuery) return 'No messages match your search.'
  if (state.filter !== 'all') return 'No messages match this filter.'
  return 'This folder is empty.'
})

function handleSelectAll() {
  if (allSelected.value) clearSelection()
  else selectAll()
}
</script>

<template>
  <div class="flex flex-col h-full bg-default">
    <!-- Mobile-only search (desktop search is in MailTopBar) -->
    <div class="md:hidden px-3 pt-3 pb-1 shrink-0">
      <UInput
        v-model="state.searchQuery"
        icon="i-lucide-search"
        placeholder="Search mail here..."
        variant="subtle"
      >
        <template
          v-if="state.searchQuery"
          #trailing
        >
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="link"
            size="sm"
            aria-label="Clear search"
            @click="state.searchQuery = ''"
          />
        </template>
      </UInput>
    </div>

    <!-- Folder heading + meta -->
    <div class="px-4 pt-3 pb-2 shrink-0">
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="text-[17px] font-bold text-highlighted">
            {{ folderLabels[state.activeFolder] ?? state.activeFolder }}
          </h2>
          <div class="flex items-center gap-2 mt-0.5 text-xs text-dimmed">
            <UIcon
              name="i-lucide-mails"
              class="size-3.5"
            />
            <span>{{ folderMails.length.toLocaleString() }} Messages</span>
            <UBadge
              v-if="unreadCount(state.activeFolder) > 0"
              color="primary"
              variant="subtle"
              size="xs"
            >
              {{ unreadCount(state.activeFolder) }} Unread
            </UBadge>
          </div>
        </div>
        <USelectMenu
          v-model="state.filter"
          :items="filterItems"
          value-key="value"
          size="sm"
          variant="outline"
          color="neutral"
          :trailing-icon="'i-lucide-chevrons-up-down'"
          class="shrink-0"
          @update:model-value="setFilter"
        />
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
        class="mx-3 mb-1 flex items-center gap-1 px-3 py-2 bg-primary/10 ring-1 ring-primary/20 rounded-xl shrink-0"
      >
        <UCheckbox
          :model-value="allSelected ? true : 'indeterminate'"
          @change="handleSelectAll"
        />
        <span class="text-xs font-medium text-primary flex-1 ms-1">
          {{ state.selectedIds.size }} selected
        </span>
        <UTooltip text="Archive">
          <UButton
            icon="i-lucide-archive"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            @click="archiveMails([...state.selectedIds])"
          />
        </UTooltip>
        <UTooltip text="Delete">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            square
            @click="deleteMails([...state.selectedIds])"
          />
        </UTooltip>
        <UTooltip text="Mark read">
          <UButton
            icon="i-lucide-mail-open"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            @click="markRead([...state.selectedIds], true)"
          />
        </UTooltip>
        <UTooltip text="Clear selection">
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            @click="clearSelection"
          />
        </UTooltip>
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
      <UEmpty
        v-else
        variant="naked"
        icon="i-lucide-inbox"
        title="Nothing here"
        :description="emptyDescription"
        class="h-full"
      />
    </div>
  </div>
</template>
