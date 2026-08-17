<script setup lang="ts">
defineProps<{
  icon: string
  label?: string
  active?: boolean
  color?: string
  size?: 'xs' | 'sm' | 'md'
  disabled?: boolean
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    :disabled="disabled"
    :title="label"
    :aria-label="label"
    :class="[
      'inline-flex items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-40 disabled:cursor-not-allowed',
      size === 'xs' ? 'size-7' : size === 'sm' ? 'size-8' : 'size-9',
      active
        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
        : color === 'danger'
          ? 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 text-gray-500 dark:text-gray-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
    ]"
    @click="$emit('click')"
  >
    <UIcon :name="icon" :class="size === 'xs' ? 'size-3.5' : size === 'sm' ? 'size-4' : 'size-4.5'" />
  </button>
</template>
