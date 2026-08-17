<script setup lang="ts">
import type { MailAttachment } from '~/types/mail'
import { useMailFormat } from '~/composables/useMailFormat'

const props = defineProps<{
  attachment: MailAttachment
}>()

const { formatFileSize, getFileIcon } = useMailFormat()
const fileInfo = computed(() => getFileIcon(props.attachment.type))
</script>

<template>
  <UButton
    color="neutral"
    variant="outline"
    class="group rounded-xl px-3 py-2.5 justify-start min-w-52"
  >
    <template #leading>
      <div
        class="size-8 rounded-lg flex items-center justify-center shrink-0"
        :style="{ backgroundColor: fileInfo.color + '18' }"
      >
        <UIcon
          :name="fileInfo.icon"
          class="size-4"
          :style="{ color: fileInfo.color }"
        />
      </div>
    </template>

    <span class="flex-1 min-w-0 text-left">
      <span class="block text-xs font-medium text-default truncate">{{ attachment.name }}</span>
      <span class="block text-[11px] text-dimmed">{{ formatFileSize(attachment.size) }}</span>
    </span>

    <UIcon
      name="i-lucide-download"
      class="size-3.5 text-dimmed group-hover:text-primary transition-colors"
    />
  </UButton>
</template>
