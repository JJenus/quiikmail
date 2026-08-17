<script setup lang="ts">
import type { MailFolder } from '~/types/mail'
import { useMailStore } from '~/composables/useMailStore'

const { state, setFolder, folderTotal, openCompose } = useMailStore()

const mainFolders = [
  { key: 'inbox' as MailFolder,     label: 'Inbox',     icon: 'i-lucide-inbox' },
  { key: 'important' as MailFolder, label: 'Important', icon: 'i-lucide-star' },
  { key: 'snoozed' as MailFolder,   label: 'Snoozed',   icon: 'i-lucide-clock' },
  { key: 'sent' as MailFolder,      label: 'Sent',      icon: 'i-lucide-send' },
  { key: 'drafts' as MailFolder,    label: 'Draft',     icon: 'i-lucide-file-edit' },
]

const otherFolders = [
  { key: 'archive' as MailFolder, label: 'Archived', icon: 'i-lucide-archive' },
  { key: 'spam' as MailFolder,    label: 'Spam',     icon: 'i-lucide-alert-circle' },
  { key: 'trash' as MailFolder,   label: 'Trash',    icon: 'i-lucide-trash-2' },
]

const labelsOpen = ref(true)
const otherOpen = ref(true)

// Storage mock: 10.06 MB / 200 MB
const storageUsed = 10.06
const storageTotal = 200
const storagePercent = (storageUsed / storageTotal) * 100
</script>

<template>
  <aside class="flex flex-col h-full bg-white w-full">
    <!-- Logo row -->
    <div class="flex items-center justify-between px-4 pt-5 pb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
          <UIcon name="i-lucide-mail" class="w-4 h-4 text-white" />
        </div>
        <span class="text-[15px] font-bold text-slate-800 tracking-tight">MailZen</span>
      </div>
      <button
        class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors md:hidden"
        @click="state.sidebarOpen = false"
      >
        <UIcon name="i-lucide-x" class="w-4 h-4" />
      </button>
    </div>

    <!-- Compose -->
    <div class="px-3 pb-4">
      <button
        class="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        @click="openCompose()"
      >
        <span>Compose</span>
        <UIcon name="i-lucide-pencil-line" class="w-4 h-4" />
      </button>
    </div>

    <!-- Scrollable nav -->
    <nav class="flex-1 overflow-y-auto px-2 space-y-0.5">
      <!-- Main folders -->
      <MailSidebarItem
        v-for="f in mainFolders"
        :key="f.key"
        :icon="f.icon"
        :label="f.label"
        :count="folderTotal(f.key)"
        :active="state.activeFolder === f.key"
        @click="setFolder(f.key)"
      />

      <!-- Other section -->
      <div class="pt-3">
        <button
          class="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          @click="otherOpen = !otherOpen"
        >
          <span>Other</span>
          <UIcon
            :name="otherOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="w-3 h-3"
          />
        </button>
        <div v-if="otherOpen" class="mt-0.5 space-y-0.5">
          <MailSidebarItem
            v-for="f in otherFolders"
            :key="f.key"
            :icon="f.icon"
            :label="f.label"
            :count="folderTotal(f.key)"
            :active="state.activeFolder === f.key"
            @click="setFolder(f.key)"
          />
        </div>
      </div>

      <!-- Labels section -->
      <div class="pt-3">
        <button
          class="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          @click="labelsOpen = !labelsOpen"
        >
          <span>Labels</span>
          <UIcon
            :name="labelsOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="w-3 h-3"
          />
        </button>
        <div v-if="labelsOpen" class="mt-0.5 space-y-0.5">
          <button
            v-for="lbl in state.labels"
            :key="lbl.id"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors group"
          >
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: lbl.color }"
            />
            <span class="flex-1 text-left truncate">{{ lbl.name }}</span>
            <span class="text-[11px] text-slate-400 tabular-nums">{{ lbl.count }}</span>
          </button>
          <!-- Add label -->
          <button
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-slate-100 hover:text-violet-600 transition-colors"
          >
            <UIcon name="i-lucide-plus" class="w-4 h-4" />
            <span>Add Labels</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Storage bar -->
    <div class="px-4 py-4 border-t border-slate-100">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[11px] text-slate-400">
          {{ storageUsed }} MB ({{ storagePercent.toFixed(0) }}%) / {{ storageTotal }} MB
        </span>
      </div>
      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-violet-500 rounded-full transition-all"
          :style="{ width: `${storagePercent}%` }"
        />
      </div>
    </div>
  </aside>
</template>
