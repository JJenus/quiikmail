<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  count?: number
  active?: boolean
  collapsed?: boolean
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    :class="[
      'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      active
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
    ]"
    @click="$emit('click')"
  >
    <UIcon
      :name="icon"
      :class="[
        'size-4.5 shrink-0 transition-colors',
        active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
      ]"
    />
    <span v-if="!collapsed" class="flex-1 text-left truncate">{{ label }}</span>
    <span
      v-if="count && count > 0 && !collapsed"
      :class="[
        'text-xs font-semibold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5',
        active
          ? 'bg-primary-200 text-primary-800 dark:bg-primary-800/50 dark:text-primary-200'
          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      ]"
    >
      {{ count > 99 ? '99+' : count }}
    </span>
  </button>
</template>
