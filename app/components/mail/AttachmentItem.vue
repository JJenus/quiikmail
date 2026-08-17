<script setup lang="ts">
import type { MailAttachment } from '~/types/mail'
import { useMailFormat } from '~/composables/useMailFormat'

defineProps<{
  attachment: MailAttachment
}>()

const { formatFileSize, getFileIcon } = useMailFormat()
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
    <div class="size-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
      <UIcon :name="getFileIcon(attachment.type)" class="size-4.5 text-gray-500 dark:text-gray-400" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ attachment.name }}</p>
      <p class="text-xs text-gray-400">{{ formatFileSize(attachment.size) }}</p>
    </div>
    <IconBtn
      icon="i-lucide-download"
      label="Download"
      size="sm"
      class="opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </div>
</template>
