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
      v-if="!collapsed && count !== undefined && count > 0"
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
