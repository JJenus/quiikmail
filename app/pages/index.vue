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
        <!-- Sidebar (fixed on desktop, slide-over on mobile) -->
        <MailSidebar />

        <!-- Main column: global topbar above list + detail -->
        <div class="flex flex-col flex-1 min-w-0 min-h-0">
          <MailTopBar />

          <div class="flex flex-1 min-h-0 overflow-hidden">
            <!-- List panel -->
            <UDashboardPanel
              id="mail-list"
              resizable
              :default-size="320"
              :min-size="260"
              :max-size="400"
              class="min-h-0!"
              :class="showDetail ? 'hidden md:flex' : 'flex'"
              :ui="{ root: 'md:w-(--width)', body: 'flex-1 overflow-hidden p-0' }"
            >
              <template #header>
                <!-- Mobile-only: menu + logo (desktop topbar is in MailTopBar) -->
                <div class="md:hidden flex items-center gap-2 px-3 py-3 border-b border-default shrink-0 bg-default">
                  <UButton
                    icon="i-lucide-menu"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                    aria-label="Open sidebar"
                    @click="state.sidebarOpen = true"
                  />
                  <div class="flex items-center gap-2">
                    <div class="size-7 rounded-xl bg-primary flex items-center justify-center">
                      <UIcon
                        name="i-lucide-mail"
                        class="size-4 text-inverted"
                      />
                    </div>
                    <span class="text-[15px] font-bold text-highlighted">QuiikMail</span>
                  </div>
                </div>
              </template>

              <template #body>
                <MailList />
              </template>
            </UDashboardPanel>

            <!-- Detail panel -->
            <UDashboardPanel
              id="mail-detail"
              class="min-h-0!"
              :class="showDetail ? 'flex' : 'hidden md:flex'"
              :ui="{ body: 'flex-1 overflow-hidden p-0' }"
            >
              <template #body>
                <MailDetail />
              </template>
            </UDashboardPanel>
          </div>
        </div>
      </UDashboardGroup>
    </div>

    <!-- Compose floating window (desktop) / bottom sheet (mobile) -->
    <MailCompose />
  </div>
</template>
