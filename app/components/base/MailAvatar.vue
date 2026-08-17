<script setup lang="ts">
import { useMailFormat } from '~/composables/useMailFormat'

const props = defineProps<{
  name: string
  avatar?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

const { getInitials, getAvatarBg } = useMailFormat()

const sizeClass = computed(() => ({
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-10 h-10 text-sm'
}[props.size ?? 'md']))
</script>

<template>
  <div
    :style="!avatar ? { backgroundColor: getAvatarBg(name) } : {}"
    :class="[sizeClass, 'rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none overflow-hidden']"
  >
    <img v-if="avatar" :src="avatar" :alt="name" class="w-full h-full object-cover" />
    <span v-else>{{ getInitials(name) }}</span>
  </div>
</template>
