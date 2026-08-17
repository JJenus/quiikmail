<script setup lang="ts">
defineProps<{
  label: string
}>()

const colorMap: Record<string, string> = {
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  dev: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

const color = computed((props: any) =>
  colorMap[props?.label] ?? colorMap.default
)
</script>

<template>
  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium', colorMap[label] ?? colorMap.default]">
    {{ label }}
  </span>
</template>
