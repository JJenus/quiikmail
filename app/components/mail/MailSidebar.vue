<script setup lang="ts">
import type { MailFolder } from '~/types/mail'
import { useMailStore } from '~/composables/useMailStore'

const { state, setFolder, folderTotal, openCompose } = useMailStore()

const mainFolders = [
  { key: 'inbox' as MailFolder, label: 'Inbox', icon: 'i-lucide-inbox' },
  { key: 'important' as MailFolder, label: 'Important', icon: 'i-lucide-star' },
  { key: 'snoozed' as MailFolder, label: 'Snoozed', icon: 'i-lucide-clock' },
  { key: 'sent' as MailFolder, label: 'Sent', icon: 'i-lucide-send' },
  { key: 'drafts' as MailFolder, label: 'Draft', icon: 'i-lucide-file-edit' }
]

const otherFolders = [
  { key: 'archive' as MailFolder, label: 'Archived', icon: 'i-lucide-archive' },
  { key: 'spam' as MailFolder, label: 'Spam', icon: 'i-lucide-alert-circle' },
  { key: 'trash' as MailFolder, label: 'Trash', icon: 'i-lucide-trash-2' }
]

const labelsOpen = ref(true)
const otherOpen = ref(true)

// Storage mock: 10.06 MB / 200 MB
const storageUsed = 10.06
const storageTotal = 200
const storagePercent = (storageUsed / storageTotal) * 100
</script>

<template>
  <UDashboardSidebar
    v-model:open="state.sidebarOpen"
    resizable
    collapsible
    :default-size="220"
    :min-size="180"
    :max-size="300"
    :collapsed-size="0"
    :ui="{
      header: 'h-auto px-3 pt-5 pb-3',
      body: 'flex-1 overflow-y-auto px-2 pb-3 space-y-0.5',
      footer: 'shrink-0 flex items-center px-4 py-4 border-t border-default'
    }"
  >
    <!-- Logo row -->
    <template #header="{ collapsed }">
      <div class="flex items-center justify-between w-full gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <div class="size-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <UIcon
              name="i-lucide-mail"
              class="size-4 text-inverted"
            />
          </div>
          <span
            v-if="!collapsed"
            class="text-[15px] font-bold text-highlighted tracking-tight truncate"
          >
            QuiikMail
          </span>
        </div>
        <UButton
          v-if="!collapsed"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="lg:hidden"
          aria-label="Close sidebar"
          @click="state.sidebarOpen = false"
        />
      </div>

      <!-- Compose -->
      <UButton
        block
        icon="i-lucide-pencil-line"
        label="Compose"
        class="mt-3 justify-center"
        :square="collapsed"
        @click="openCompose()"
      />
    </template>

    <!-- Folder navigation -->
    <template #default="{ collapsed }">
      <MailSidebarItem
        v-for="f in mainFolders"
        :key="f.key"
        :icon="f.icon"
        :label="f.label"
        :count="folderTotal(f.key)"
        :active="state.activeFolder === f.key"
        :collapsed="collapsed"
        @click="setFolder(f.key)"
      />

      <!-- Other section -->
      <div
        v-if="!collapsed"
        class="pt-3"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="w-full justify-between px-3 text-[11px] font-semibold uppercase tracking-widest text-muted hover:text-default"
          :icon="otherOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
          @click="otherOpen = !otherOpen"
        >
          <span>Other</span>
        </UButton>
        <div
          v-if="otherOpen"
          class="mt-0.5 space-y-0.5"
        >
          <MailSidebarItem
            v-for="f in otherFolders"
            :key="f.key"
            :icon="f.icon"
            :label="f.label"
            :count="folderTotal(f.key)"
            :active="state.activeFolder === f.key"
            :collapsed="collapsed"
            @click="setFolder(f.key)"
          />
        </div>
      </div>

      <!-- Labels section -->
      <div
        v-if="!collapsed"
        class="pt-3"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="w-full justify-between px-3 text-[11px] font-semibold uppercase tracking-widest text-muted hover:text-default"
          :icon="labelsOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
          @click="labelsOpen = !labelsOpen"
        >
          <span>Labels</span>
        </UButton>
        <div
          v-if="labelsOpen"
          class="mt-0.5 space-y-0.5"
        >
          <UButton
            v-for="lbl in state.labels"
            :key="lbl.id"
            color="neutral"
            variant="ghost"
            class="w-full justify-start px-3 text-[13px] font-medium text-muted hover:text-default"
          >
            <span
              class="size-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: lbl.color }"
            />
            <span class="flex-1 text-left truncate">{{ lbl.name }}</span>
            <span class="text-[11px] text-dimmed tabular-nums">{{ lbl.count }}</span>
          </UButton>
          <UButton
            icon="i-lucide-plus"
            label="Add Labels"
            color="neutral"
            variant="ghost"
            size="sm"
            class="w-full justify-start px-3 text-[13px] font-medium text-dimmed hover:text-primary"
          />
        </div>
      </div>
    </template>

    <!-- Storage bar -->
    <template #footer>
      <div class="w-full">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] text-dimmed">
            {{ storageUsed }} MB ({{ storagePercent.toFixed(0) }}%) / {{ storageTotal }} MB
          </span>
        </div>
        <UProgress
          :model-value="storagePercent"
          :max="100"
          size="2xs"
        />
      </div>
    </template>
  </UDashboardSidebar>
</template>
