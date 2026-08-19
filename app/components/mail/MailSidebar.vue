<script setup lang="ts">
import type { MailFolder } from '~/types/mail'
import { useMailStore } from '~/composables/useMailStore'

const { state, setFolder, unreadCount, openCompose } = useMailStore()

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
const collapsed = ref(false)

// Storage mock: 10.06 MB / 200 MB
const storageUsed = 10.06
const storageTotal = 200
const storagePercent = (storageUsed / storageTotal) * 100
</script>

<template>
  <UDashboardSidebar
    v-model:open="state.sidebarOpen"
    v-model:collapsed="collapsed"
    collapsible
    :collapsed-size="64"
    :default-size="256"
    :ui="{
      root: 'md:flex min-h-0!',
      header: 'h-auto shrink-0 flex flex-col items-stretch gap-3 px-3 pt-5 pb-4',
      body: 'flex-1 overflow-y-auto px-2 pb-3 space-y-0.5',
      footer: 'shrink-0 px-4 py-4 border-t border-default'
    }"
  >
    <!-- Logo row + compose button -->
    <template #header="{ collapsed: isCollapsed, collapse }">
      <div
        class="flex items-center justify-between w-full gap-2 px-1"
        :class="isCollapsed ? 'flex-col gap-3' : ''"
      >
        <UButton
          color="neutral"
          variant="ghost"
          square
          size="sm"
          class="shrink-0"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="collapse(!isCollapsed)"
        >
          <div class="size-8 rounded-xl bg-primary flex items-center justify-center">
            <UIcon
              name="i-lucide-mail"
              class="size-4 text-inverted"
            />
          </div>
        </UButton>
        <template v-if="!isCollapsed">
          <span class="text-[15px] font-bold text-highlighted tracking-tight truncate">
            QuiikMail
          </span>
          <UButton
            icon="i-lucide-panel-left-close"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            class="text-dimmed hover:text-default"
            aria-label="Collapse sidebar"
            @click="collapse(true)"
          />
        </template>
      </div>

      <UButton
        v-if="!isCollapsed"
        color="primary"
        block
        class="py-2.5 rounded-xl"
        @click="openCompose()"
      >
        Compose
        <template #trailing>
          <UIcon
            name="i-lucide-pencil-line"
            class="size-4"
          />
        </template>
      </UButton>
      <UButton
        v-else
        icon="i-lucide-pencil-line"
        color="primary"
        square
        class="rounded-xl"
        aria-label="Compose"
        @click="openCompose()"
      />
    </template>

    <!-- Folder navigation -->
    <template #default="{ collapsed: isCollapsed }">
      <MailSidebarItem
        v-for="f in mainFolders"
        :key="f.key"
        :icon="f.icon"
        :label="f.label"
        :badge="unreadCount(f.key)"
        :active="state.activeFolder === f.key"
        :collapsed="isCollapsed"
        @click="setFolder(f.key)"
      />

      <!-- Other section -->
      <div
        v-if="!isCollapsed"
        class="pt-0"
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
            :badge="unreadCount(f.key)"
            :active="state.activeFolder === f.key"
            @click="setFolder(f.key)"
          />
        </div>
      </div>
      <template v-else>
        <MailSidebarItem
          v-for="f in otherFolders"
          :key="f.key"
          :icon="f.icon"
          :label="f.label"
          :badge="unreadCount(f.key)"
          :active="state.activeFolder === f.key"
          :collapsed="true"
          @click="setFolder(f.key)"
        />
      </template>

      <!-- Labels section -->
      <div class="pt-0">
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
    <template #footer="{ collapsed: isCollapsed }">
      <div
        v-if="!isCollapsed"
        class="w-full"
      >
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
