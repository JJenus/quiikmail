<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  count?: number
  active?: boolean
}>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    :class="[
      'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400',
      active
        ? 'bg-violet-100 text-violet-700'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    ]"
    @click="$emit('click')"
  >
    <UIcon
      :name="icon"
      :class="[
        'w-4 h-4 shrink-0',
        active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-500'
      ]"
    />
    <span class="flex-1 text-left truncate">{{ label }}</span>
    <span
      v-if="count !== undefined && count > 0"
      :class="[
        'text-[11px] font-semibold tabular-nums min-w-[24px] text-right',
        active ? 'text-violet-600' : 'text-slate-400'
      ]"
    >
      {{ count > 999 ? '999+' : count }}
    </span>
  </button>
</template>
