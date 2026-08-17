<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'
import { useMailFormat } from '~/composables/useMailFormat'

const { state, selectedMail, toggleStar, deleteMails, archiveMails, replyTo, forwardMail, selectMail } = useMailStore()
const { formatFullDate } = useMailFormat()

const showAllRecipients = ref(false)
const showDetails = ref(false)

const mail = selectedMail

function handleDelete() {
  if (mail.value) {
    deleteMails([mail.value.id])
    selectMail(null)
  }
}

function handleArchive() {
  if (mail.value) {
    archiveMails([mail.value.id])
    selectMail(null)
  }
}
</script>

<template>
  <!-- Empty state when no mail selected -->
  <div v-if="!mail" class="flex-1 flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900/50">
    <BaseEmptyState
      icon="i-lucide-mail"
      title="Select a message"
      description="Choose a message from the list to read it here."
    />
  </div>

  <!-- Mail detail -->
  <div v-else class="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
      <div class="flex items-center gap-1">
        <!-- Mobile back button -->
        <IconBtn
          icon="i-lucide-arrow-left"
          label="Back"
          class="md:hidden"
          @click="selectMail(null)"
        />
        <IconBtn icon="i-lucide-archive" label="Archive" @click="handleArchive" />
        <IconBtn icon="i-lucide-trash-2" label="Delete" color="danger" @click="handleDelete" />
        <IconBtn
          icon="i-lucide-mail"
          :label="mail.read ? 'Mark as unread' : 'Mark as read'"
        />
      </div>

      <div class="flex items-center gap-1">
        <IconBtn
          :icon="mail.starred ? 'i-lucide-star' : 'i-lucide-star'"
          :label="mail.starred ? 'Unstar' : 'Star'"
          :active="mail.starred"
          @click="toggleStar(mail.id)"
        />
        <UDropdownMenu
          :items="[
            [
              { label: 'Reply', icon: 'i-lucide-reply', onSelect: () => replyTo(mail!) },
              { label: 'Forward', icon: 'i-lucide-forward', onSelect: () => forwardMail(mail!) },
              { type: 'separator' },
              { label: 'Print', icon: 'i-lucide-printer' },
              { label: 'Report spam', icon: 'i-lucide-alert-circle' }
            ]
          ]"
        >
          <IconBtn icon="i-lucide-more-vertical" label="More actions" />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Scrollable mail body -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <div class="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <!-- Subject -->
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
            {{ mail.subject }}
          </h1>
          <div class="flex flex-wrap gap-1 shrink-0 mt-0.5">
            <BaseMailLabel v-for="label in mail.labels" :key="label" :label="label" />
          </div>
        </div>

        <!-- Sender info -->
        <div
          class="flex items-start gap-3 cursor-pointer"
          @click="showDetails = !showDetails"
        >
          <BaseMailAvatar :name="mail.from.name" size="md" />

          <div class="flex-1 min-w-0">
            <div class="flex items-baseline justify-between gap-2">
              <div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ mail.from.name }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">&lt;{{ mail.from.email }}&gt;</span>
              </div>
              <span class="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {{ formatFullDate(mail.date) }}
              </span>
            </div>

            <button
              class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mt-0.5 transition-colors"
            >
              <span>to {{ mail.to.map(t => t.name || t.email).join(', ') }}</span>
              <UIcon
                :name="showDetails ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="size-3"
              />
            </button>

            <!-- Expanded details -->
            <div v-if="showDetails" class="mt-2 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
              <p><span class="text-gray-400">From:</span> {{ mail.from.name }} &lt;{{ mail.from.email }}&gt;</p>
              <p><span class="text-gray-400">To:</span> {{ mail.to.map(t => `${t.name} <${t.email}>`).join(', ') }}</p>
              <p v-if="mail.cc?.length"><span class="text-gray-400">CC:</span> {{ mail.cc.map(t => t.email).join(', ') }}</p>
              <p><span class="text-gray-400">Date:</span> {{ formatFullDate(mail.date) }}</p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <USeparator />

        <!-- Mail body -->
        <div class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-[system-ui]">
          {{ mail.body }}
        </div>

        <!-- Attachments -->
        <div v-if="mail.attachments?.length" class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Attachments ({{ mail.attachments.length }})
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <MailAttachmentItem
              v-for="att in mail.attachments"
              :key="att.id"
              :attachment="att"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Reply bar -->
    <div class="border-t border-gray-100 dark:border-gray-800 px-4 py-3 shrink-0">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-reply"
          variant="soft"
          size="sm"
          @click="replyTo(mail)"
        >
          Reply
        </UButton>
        <UButton
          icon="i-lucide-forward"
          variant="ghost"
          size="sm"
          color="neutral"
          @click="forwardMail(mail)"
        >
          Forward
        </UButton>
      </div>
    </div>
  </div>
</template>
