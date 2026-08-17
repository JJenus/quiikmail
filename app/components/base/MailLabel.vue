<script setup lang="ts">
defineProps<{
  label: string
  removable?: boolean
}>()
defineEmits<{ remove: [] }>()

const colorMap: Record<string, string> = {
  Social:   'bg-violet-100 text-violet-600',
  Personal: 'bg-amber-100 text-amber-600',
  Clients:  'bg-emerald-100 text-emerald-600',
  Work:     'bg-blue-100 text-blue-600',
  Finance:  'bg-rose-100 text-rose-600',
}
const cls = (label: string) => colorMap[label] ?? 'bg-slate-100 text-slate-500'
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
      cls(label)
    ]"
  >
    {{ label }}
    <button
      v-if="removable"
      class="ml-0.5 hover:opacity-70 transition-opacity"
      @click.stop="$emit('remove')"
    >
      <UIcon name="i-lucide-x" class="w-2.5 h-2.5" />
    </button>
  </span>
</template>
