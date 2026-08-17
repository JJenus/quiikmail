<script setup lang="ts">
import type { MailFolder } from '~/types/mail'
import { useMailStore } from '~/composables/useMailStore'

const { state, setFolder, unreadCount, openCompose } = useMailStore()

const folders = [
  { key: 'inbox' as MailFolder, label: 'Inbox', icon: 'i-lucide-inbox' },
  { key: 'starred' as MailFolder, label: 'Starred', icon: 'i-lucide-star' },
  { key: 'sent' as MailFolder, label: 'Sent', icon: 'i-lucide-send' },
  { key: 'drafts' as MailFolder, label: 'Drafts', icon: 'i-lucide-file-edit' },
  { key: 'archive' as MailFolder, label: 'Archive', icon: 'i-lucide-archive' },
  { key: 'spam' as MailFolder, label: 'Spam', icon: 'i-lucide-alert-circle' },
  { key: 'trash' as MailFolder, label: 'Trash', icon: 'i-lucide-trash-2' }
]
</script>

<template>
  <aside class="flex flex-col h-full bg-white dark:bg-gray-900 w-full">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-4 pt-5 pb-4">
      <div class="size-8 rounded-xl bg-primary-500 flex items-center justify-center">
        <UIcon name="i-lucide-zap" class="size-4.5 text-white" />
      </div>
      <span class="text-base font-bold text-gray-900 dark:text-white tracking-tight">QuiikMail</span>
    </div>

    <!-- Compose Button -->
    <div class="px-3 pb-4">
      <UButton
        block
        size="md"
        icon="i-lucide-pencil"
        class="justify-center font-semibold shadow-sm"
        @click="openCompose()"
      >
        Compose
      </UButton>
    </div>

    <!-- Folders -->
    <nav class="flex-1 px-2 space-y-0.5 overflow-y-auto">
      <p class="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">Mailbox</p>
      <MailSidebarItem
        v-for="folder in folders"
        :key="folder.key"
        :icon="folder.icon"
        :label="folder.label"
        :count="unreadCount(folder.key)"
        :active="state.activeFolder === folder.key"
        @click="setFolder(folder.key)"
      />
    </nav>

    <!-- User Account -->
    <div class="p-3 border-t border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
        <BaseMailAvatar name="JJenus" size="sm" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">JJenus</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">biz.jenus@gmail.com</p>
        </div>
        <IconBtn icon="i-lucide-settings" label="Settings" size="sm" />
      </div>
    </div>
  </aside>
</template>
