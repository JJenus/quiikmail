<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useMailStore } from '~/composables/useMailStore'
import { useMailFormat } from '~/composables/useMailFormat'

const { state } = useMailStore()
const { getInitials, getAvatarBg } = useMailFormat()

const notifications = [
  {
    id: 1,
    icon: 'i-lucide-mail',
    color: 'text-primary',
    title: 'New message from Binford Ltd.',
    time: '2 min ago',
    unread: true
  },
  {
    id: 2,
    icon: 'i-lucide-star',
    color: 'text-amber-500',
    title: 'Marvin McKinney starred your reply',
    time: '15 min ago',
    unread: true
  },
  {
    id: 3,
    icon: 'i-lucide-paperclip',
    color: 'text-blue-500',
    title: 'Bank of America sent an attachment',
    time: '1 hr ago',
    unread: false
  },
  {
    id: 4,
    icon: 'i-lucide-user-check',
    color: 'text-emerald-500',
    title: 'Your account was verified',
    time: '3 hrs ago',
    unread: false
  }
]

const unreadNotifCount = computed(() => notifications.filter(n => n.unread).length)

interface NotifItem extends DropdownMenuItem {
  unread: boolean
}

const notifItems: NotifItem[] = notifications.map(n => ({
  label: n.title,
  description: n.time,
  icon: n.icon,
  unread: n.unread,
  ui: {
    itemLeadingIcon: n.color,
    itemTrailing: n.unread
      ? 'relative after:content-[""] after:size-1.5 after:rounded-full after:bg-primary after:shrink-0'
      : ''
  }
}))

const userItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Ralph Edwards',
      description: 'edwards.ralph@example.com',
      type: 'label',
      avatar: { text: getInitials('Ralph Edwards'), style: { backgroundColor: getAvatarBg('Ralph Edwards') } }
    }
  ],
  [
    { label: 'My Profile', icon: 'i-lucide-user' },
    { label: 'Settings', icon: 'i-lucide-settings' },
    { label: 'Keyboard shortcuts', icon: 'i-lucide-keyboard' }
  ],
  [
    { label: 'Help & support', icon: 'i-lucide-help-circle' }
  ],
  [
    { label: 'Sign out', icon: 'i-lucide-log-out', color: 'error' }
  ]
])
</script>

<template>
  <UDashboardNavbar
    :toggle="false"
    class="hidden md:flex"
    :ui="{ center: 'flex' }"
  >
    <!-- Search -->
    <template #default>
      <UInput
        v-model="state.searchQuery"
        icon="i-lucide-search"
        placeholder="Search mail here..."
        variant="subtle"
        class="w-64 xl:w-72"
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
      <UColorModeButton size="sm" />
      <UDropdownMenu
        :items="notifItems"
        :ui="{ content: 'w-80' }"
        :content="{ align: 'end' }"
      >
        <UButton
          icon="i-lucide-bell"
          color="neutral"
          variant="ghost"
          square
          size="sm"
          class="relative"
          aria-label="Notifications"
        >
          <span
            v-if="unreadNotifCount > 0"
            class="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full ring-2 ring-default"
          />
        </UButton>

        <template #content-top>
          <div class="flex items-center justify-between px-3 py-2.5 border-b border-default">
            <span class="text-[13px] font-semibold text-highlighted">Notifications</span>
            <UButton
              label="Mark all read"
              color="primary"
              variant="link"
              size="sm"
              class="text-[11px]"
            />
          </div>
        </template>

        <template #content-bottom>
          <div class="px-3 py-2 border-t border-default">
            <UButton
              label="View all notifications"
              color="primary"
              variant="link"
              size="sm"
              class="w-full text-center"
            />
          </div>
        </template>
      </UDropdownMenu>

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
            :text="getInitials('Ralph Edwards')"
            size="2xs"
            class="text-white"
            :style="{ backgroundColor: getAvatarBg('Ralph Edwards') }"
            :ui="{ fallback: 'text-white' }"
          />
          <span class="hidden lg:block text-left">
            <span class="block text-xs font-semibold text-default leading-tight">Ralph Edwards</span>
            <span class="block text-[11px] text-dimmed leading-tight">edwards.ralph@example.com</span>
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-3.5 text-dimmed"
          />
        </UButton>
      </UDropdownMenu>
    </template>
  </UDashboardNavbar>
</template>
