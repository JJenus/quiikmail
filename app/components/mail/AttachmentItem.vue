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
  <div
    class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50 transition-colors cursor-pointer group"
  >
    <!-- Icon -->
    <div
      class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      :style="{ backgroundColor: fileInfo.color + '18' }"
    >
      <UIcon
        :name="fileInfo.icon"
        class="w-4 h-4"
        :style="{ color: fileInfo.color }"
      />
    </div>
    <!-- Name + size -->
    <div class="flex-1 min-w-0">
      <p class="text-[12px] font-medium text-slate-700 truncate">{{ attachment.name }}</p>
      <p class="text-[11px] text-slate-400">{{ formatFileSize(attachment.size) }}</p>
    </div>
    <!-- Download -->
    <UIcon
      name="i-lucide-download"
      class="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-500 transition-colors"
    />
  </div>
</template>
