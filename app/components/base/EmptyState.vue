<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full py-16 px-6 text-center gap-4">
    <div class="size-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <UIcon :name="icon" class="size-8 text-gray-400 dark:text-gray-500" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ title }}</p>
      <p v-if="description" class="text-xs text-gray-500 dark:text-gray-500 max-w-xs">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>
