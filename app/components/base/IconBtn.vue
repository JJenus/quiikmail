<script setup lang="ts">
defineProps<{
  icon: string
  label?: string
  active?: boolean
  danger?: boolean
  size?: 'xs' | 'sm' | 'md'
  disabled?: boolean
  class?: string
}>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    :disabled="disabled"
    :title="label"
    :aria-label="label"
    :class="[
      'inline-flex items-center justify-center rounded-lg transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      size === 'xs' ? 'w-6 h-6' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
      active
        ? 'bg-violet-100 text-violet-600'
        : danger
          ? 'text-slate-400 hover:bg-red-50 hover:text-red-500'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
    ]"
    @click="$emit('click')"
  >
    <UIcon
      :name="icon"
      :class="size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'"
    />
  </button>
</template>
