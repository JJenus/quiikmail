<script setup lang="ts">
import { useMailFormat } from '~/composables/useMailFormat'

const props = defineProps<{
  name: string
  avatar?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

const { getInitials, getAvatarColor } = useMailFormat()

const sizeClasses = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-11 text-base'
}

const size = computed(() => props.size ?? 'md')
</script>

<template>
  <div
    :class="[
      'rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none',
      sizeClasses[size],
      !avatar ? getAvatarColor(name) : ''
    ]"
  >
    <img v-if="avatar" :src="avatar" :alt="name" class="size-full rounded-full object-cover" />
    <span v-else>{{ getInitials(name) }}</span>
  </div>
</template>
