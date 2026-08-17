<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const { state } = useMailStore()
</script>

<!--
  Global top bar that sits above the list + detail on desktop.
  Contains search (centre) and user profile (right).
  On mobile it is hidden in favour of the per-panel bars.
-->
<template>
  <div class="hidden md:flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
    <!-- Search -->
    <div class="flex-1 max-w-xs flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
      <UIcon name="i-lucide-search" class="w-4 h-4 text-slate-400 shrink-0" />
      <input
        v-model="state.searchQuery"
        type="text"
        placeholder="Search mail here..."
        class="flex-1 bg-transparent text-[13px] text-slate-600 placeholder:text-slate-400 outline-none min-w-0"
      />
      <button
        v-if="state.searchQuery"
        class="text-slate-400 hover:text-slate-600 transition-colors"
        @click="state.searchQuery = ''"
      >
        <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="flex-1" />

    <!-- Bell -->
    <button class="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
      <UIcon name="i-lucide-bell" class="w-4 h-4" />
      <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
    </button>

    <!-- User -->
    <div class="flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
      <BaseMailAvatar name="Ralph Edwards" size="sm" />
      <div class="text-right">
        <p class="text-[12px] font-semibold text-slate-700 leading-tight">Ralph Edwards</p>
        <p class="text-[11px] text-slate-400 leading-tight">edwards.ralph@example.com</p>
      </div>
      <UIcon name="i-lucide-chevron-down" class="w-3.5 h-3.5 text-slate-400" />
    </div>
  </div>
</template>
