<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const { state } = useMailStore()
const showDetail = computed(() => !!state.selectedId)

useHead({
  title: 'QuiikMail — Fast, clean email',
  meta: [{ name: 'description', content: 'Fast, clean email client built with Nuxt UI' }]
})
</script>

<template>
  <div class="min-h-dvh bg-page-bg dark:bg-page-bg-dark flex items-center justify-center p-0 md:p-4 lg:p-6">
    <!-- App shell card -->
    <div class="relative w-full h-dvh md:h-[calc(100dvh-2rem)] md:max-h-[860px] md:max-w-[1300px]">
      <UDashboardGroup
        :unit="'px'"
        storage-key="quiikmail-layout"
        :ui="{
          base: 'absolute inset-0 flex overflow-hidden bg-default rounded-none md:rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-default'
        }"
      >
        <!-- Sidebar (desktop panel + mobile slideover) -->
        <MailSidebar />

        <!-- List panel -->
        <UDashboardPanel
          id="mail-list"
          resizable
          :default-size="320"
          :min-size="260"
          :max-size="400"
          class="min-h-0!"
          :class="showDetail ? 'hidden md:flex' : 'flex'"
        >
          <template #header>
            <MailTopBar />
          </template>

          <MailList />
        </UDashboardPanel>

        <!-- Detail panel -->
        <UDashboardPanel
          id="mail-detail"
          class="min-h-0!"
          :class="showDetail ? 'flex' : 'hidden md:flex'"
        >
          <MailDetail />
        </UDashboardPanel>
      </UDashboardGroup>
    </div>

    <!-- Compose (modal on desktop, bottom sheet on mobile) -->
    <MailCompose />
  </div>
</template>
