<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  count?: number
  badge?: number
  active?: boolean
  collapsed?: boolean
}>()
defineEmits<{ click: [] }>()
</script>

<template>
  <UButton
    :icon="icon"
    :label="collapsed ? undefined : label"
    color="neutral"
    variant="ghost"
    block
    :active="active"
    active-color="primary"
    active-variant="soft"
    :square="collapsed"
    class="justify-start"
    :class="collapsed ? 'justify-center' : ''"
    @click="$emit('click')"
  >
    <template
      v-if="!collapsed && badge !== undefined && badge > 0"
      #trailing
    >
      <span
        class="min-w-5 h-5 px-1.5 rounded-full bg-primary text-inverted text-[11px] font-semibold tabular-nums flex items-center justify-center ms-auto"
      >
        {{ badge > 999 ? '999+' : badge }}
      </span>
    </template>
    <template
      v-else-if="!collapsed && count !== undefined && count > 0"
      #trailing
    >
      <span
        class="text-[11px] font-semibold tabular-nums ms-auto"
        :class="active ? 'text-primary' : 'text-dimmed'"
      >
        {{ count > 999 ? '999+' : count }}
      </span>
    </template>
  </UButton>
</template>
