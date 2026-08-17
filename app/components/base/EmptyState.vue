<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full py-16 px-6 text-center gap-3">
    <div class="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
      <UIcon :name="icon" class="w-7 h-7 text-violet-400" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-semibold text-slate-700">{{ title }}</p>
      <p v-if="description" class="text-xs text-slate-400 max-w-xs">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>
