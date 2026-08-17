<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const { state, selectMail } = useMailStore()

// On mobile, we show list OR detail, not both
const showDetail = computed(() => !!state.selectedId)

useHead({
  title: 'QuiikMail',
  meta: [{ name: 'description', content: 'Fast, clean email client' }]
})
</script>

<template>
  <div class="flex h-dvh overflow-hidden bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar — mobile: slide-over overlay, md+: fixed column -->
    <div
      :class="[
        'fixed inset-0 z-40 md:relative md:z-auto',
        'md:flex md:w-64 lg:w-72 md:shrink-0',
        state.sidebarOpen
          ? 'flex flex-col'
          : 'hidden md:flex'
      ]"
    >
      <!-- Mobile overlay backdrop -->
      <div
        class="absolute inset-0 bg-black/30 md:hidden"
        @click="state.sidebarOpen = false"
      />
      <!-- Sidebar panel -->
      <div class="relative z-10 flex flex-col h-full w-72 md:w-full border-r border-gray-100 dark:border-gray-800">
        <MailSidebar />
      </div>
    </div>

    <!-- Main area -->
    <div class="flex flex-1 min-w-0 overflow-hidden">
      <div
        class="flex flex-col flex-1 min-w-0 md:grid md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]"
      >
        <!-- List column -->
        <div
          :class="[
            'flex flex-col min-h-0 overflow-hidden',
            showDetail ? 'hidden md:flex' : 'flex'
          ]"
        >
          <!-- Mobile header -->
          <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800 md:hidden bg-white dark:bg-gray-900 shrink-0">
            <IconBtn
              icon="i-lucide-menu"
              label="Open sidebar"
              @click="state.sidebarOpen = true"
            />
            <div class="flex items-center gap-2">
              <div class="size-6 rounded-lg bg-primary-500 flex items-center justify-center">
                <UIcon name="i-lucide-zap" class="size-3.5 text-white" />
              </div>
              <span class="text-sm font-bold text-gray-900 dark:text-white">QuiikMail</span>
            </div>
          </div>
          <MailList class="flex-1 min-h-0" />
        </div>

        <!-- Detail column -->
        <div
          :class="[
            'flex flex-col min-h-0 overflow-hidden',
            showDetail ? 'flex' : 'hidden md:flex'
          ]"
        >
          <MailDetail />
        </div>
      </div>
    </div>

    <!-- Compose floating window -->
    <MailCompose />
  </div>
</template>
