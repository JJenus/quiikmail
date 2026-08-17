<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const { state } = useMailStore()
const showDetail = computed(() => !!state.selectedId)

useHead({
  title: 'MailZen — Fast, clean email',
  meta: [{ name: 'description', content: 'Fast, clean email client built with Nuxt UI' }]
})
</script>

<template>
  <!-- Lavender page background -->
  <div class="min-h-dvh bg-[#EEE9FF] flex items-center justify-center p-0 md:p-4 lg:p-6">

    <!-- App shell card -->
    <div
      class="
        w-full h-dvh flex flex-col overflow-hidden
        md:flex-row
        md:h-[calc(100dvh-2rem)] md:max-h-[860px]
        md:max-w-[1300px]
        md:rounded-2xl
        bg-white
        shadow-2xl shadow-violet-200/50
      "
    >

      <!-- ── Sidebar ── -->
      <!-- Mobile slide-over -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="state.sidebarOpen" class="fixed inset-0 z-40 md:hidden">
          <div
            class="absolute inset-0 bg-black/20 backdrop-blur-sm"
            @click="state.sidebarOpen = false"
          />
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
          >
            <div v-if="state.sidebarOpen" class="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
              <MailSidebar />
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- Desktop sidebar -->
      <div class="hidden md:flex md:w-56 lg:w-64 xl:w-[220px] shrink-0 border-r border-slate-100 overflow-hidden">
        <MailSidebar />
      </div>

      <!-- ── Right section (topbar + list + detail) ── -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

        <!-- Global top bar (desktop) -->
        <MailTopBar />

        <!-- List + detail row -->
        <div class="flex flex-1 min-h-0 overflow-hidden">

          <!-- List panel -->
          <div
            :class="[
              'flex flex-col border-r border-slate-100 overflow-hidden shrink-0',
              'w-full md:w-[300px] lg:w-[320px]',
              showDetail ? 'hidden md:flex' : 'flex'
            ]"
          >
            <!-- Mobile-only topbar -->
            <div class="flex items-center gap-2 px-3 py-3 md:hidden border-b border-slate-100 shrink-0 bg-white">
              <button
                class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                @click="state.sidebarOpen = true"
              >
                <UIcon name="i-lucide-menu" class="w-5 h-5" />
              </button>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-violet-600 flex items-center justify-center">
                  <UIcon name="i-lucide-mail" class="w-4 h-4 text-white" />
                </div>
                <span class="text-[15px] font-bold text-slate-800">MailZen</span>
              </div>
            </div>
            <MailList />
          </div>

          <!-- Detail panel -->
          <div
            :class="[
              'flex flex-col flex-1 min-w-0 overflow-hidden',
              showDetail ? 'flex' : 'hidden md:flex'
            ]"
          >
            <MailDetail />
          </div>

        </div>
      </div>
    </div>

    <!-- Compose floating window -->
    <MailCompose />
  </div>
</template>
