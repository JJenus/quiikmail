<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useMailStore } from '~/composables/useMailStore'
import { useMailFormat } from '~/composables/useMailFormat'

const { state, activeMailbox, syncNow, setActiveMailbox, refreshMails, openSetup, resetState } = useMailStore()
const { getInitials, getAvatarBg } = useMailFormat()
const session = useUserSession()

const username = computed(() => session.user.value?.username ?? '')
const displayName = computed(() => session.user.value?.email ?? username.value)

const mailboxItems = computed<DropdownMenuItem[][]>(() => [
  state.mailboxes.map(m => ({
    label: m.name,
    description: m.webhookConfigured ? 'Webhook enabled' : 'Manual sync',
    icon: m.id === state.activeMailboxId ? 'i-lucide-check' : 'i-lucide-mail',
    onSelect: () => setActiveMailbox(m.id)
  })),
  [
    {
      label: 'Add mailbox',
      icon: 'i-lucide-plus',
      onSelect: () => openSetup()
    }
  ]
])

const userItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: displayName.value || username.value,
      description: `@${username.value}`,
      type: 'label',
      avatar: { text: getInitials(displayName.value || username.value), style: { backgroundColor: getAvatarBg(displayName.value || username.value) } }
    }
  ],
  [
    { label: 'Settings', icon: 'i-lucide-settings', onSelect: () => navigateTo('/settings') }
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: async () => {
        await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        resetState()
        await session.fetch().catch(() => {})
        await navigateTo('/login')
      }
    }
  ]
])

const lastSyncedLabel = computed(() => {
  const at = activeMailbox.value?.lastSyncedAt
  if (!at) return 'Never synced'
  return `Synced ${new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
})

const syncFailed = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => state.searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => refreshMails(), 400)
})

async function runSync() {
  syncFailed.value = false
  try {
    await syncNow()
  } catch {
    syncFailed.value = true
  }
}
</script>

<template>
  <UDashboardNavbar
    :toggle="false"
    :ui="{ center: 'flex' }"
  >
    <!-- Search (mobile search lives in MailList) -->
    <template #default>
      <UInput
        v-model="state.searchQuery"
        icon="i-lucide-search"
        placeholder="Search mail here..."
        variant="subtle"
        class="hidden md:block w-56 xl:w-72"
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
    </template>

    <!-- Right actions -->
    <template #right>
      <!-- Mailbox switcher -->
      <UDropdownMenu
        :items="mailboxItems"
        :ui="{ content: 'w-64' }"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="px-2.5"
          :aria-label="`Mailbox: ${activeMailbox?.name ?? 'No mailbox'}`"
        >
          <UIcon
            name="i-lucide-inbox"
            class="size-4 text-muted"
          />
          <span class="hidden sm:block max-w-28 truncate text-default">{{ activeMailbox?.name ?? 'No mailbox' }}</span>
          <UIcon
            name="i-lucide-chevron-down"
            class="hidden sm:block size-3.5 text-dimmed"
          />
        </UButton>
      </UDropdownMenu>

      <!-- Sync -->
      <UTooltip :text="syncFailed ? 'Sync failed' : `Sync now - ${lastSyncedLabel}`">
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          square
          size="sm"
          :class="state.syncing ? 'animate-spin' : ''"
          aria-label="Sync mail"
          @click="runSync"
        />
      </UTooltip>

      <UColorModeButton size="sm" />

      <!-- User profile -->
      <UDropdownMenu
        :items="userItems"
        :ui="{ content: 'w-64' }"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="px-2.5"
        >
          <UAvatar
            :text="getInitials(displayName || username)"
            size="2xs"
            class="text-white"
            :style="{ backgroundColor: getAvatarBg(displayName || username) }"
            :ui="{ fallback: 'text-white' }"
          />
          <span class="hidden lg:block text-left">
            <span class="block text-xs font-semibold text-default leading-tight">{{ displayName || username }}</span>
            <span class="block text-[11px] text-dimmed leading-tight">@{{ username }}</span>
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="hidden sm:block size-3.5 text-dimmed"
          />
        </UButton>
      </UDropdownMenu>
    </template>
  </UDashboardNavbar>
</template>
