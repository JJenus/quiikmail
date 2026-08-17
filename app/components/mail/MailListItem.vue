<script setup lang="ts">
import type { Mail } from '~/types/mail'
import { useMailStore } from '~/composables/useMailStore'
import { useMailFormat } from '~/composables/useMailFormat'

const props = defineProps<{
  mail: Mail
  active?: boolean
}>()

const { toggleStar, toggleSelectMail, isSelected, selectMail } = useMailStore()
const { formatDate } = useMailFormat()

const checked = computed(() => isSelected(props.mail.id))
</script>

<template>
  <div
    :class="[
      'group relative flex items-start gap-2.5 px-3 py-3.5 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0',
      active ? 'bg-violet-50' : 'hover:bg-slate-50/70'
    ]"
    @click="selectMail(mail.id)"
  >
    <!-- Unread left stripe -->
    <div
      :class="[
        'absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full',
        !mail.read ? 'bg-violet-500' : 'bg-transparent'
      ]"
    />

    <!-- Checkbox (visible on hover or when checked) -->
    <div class="flex items-start pt-1 w-4 shrink-0" @click.stop>
      <input
        type="checkbox"
        :checked="checked"
        :class="[
          'w-4 h-4 rounded border-slate-300 cursor-pointer accent-violet-600 transition-opacity',
          checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]"
        @change="toggleSelectMail(mail.id)"
      />
    </div>

    <!-- Sender avatar -->
    <div class="shrink-0 pt-0.5">
      <BaseMailAvatar :name="mail.from.name" size="sm" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Sender name + time -->
      <div class="flex items-baseline justify-between gap-2 mb-0.5">
        <span
          :class="[
            'text-[13px] truncate',
            !mail.read ? 'font-bold text-slate-800' : 'font-medium text-slate-500'
          ]"
        >
          {{ mail.from.name }}
        </span>
        <span class="text-[11px] text-slate-400 shrink-0 whitespace-nowrap tabular-nums">
          {{ formatDate(mail.date) }}
        </span>
      </div>

      <!-- Subject -->
      <p
        :class="[
          'text-[13px] truncate mb-1',
          !mail.read ? 'font-semibold text-slate-700' : 'text-slate-400'
        ]"
      >
        {{ mail.subject }}
      </p>

      <!-- Preview -->
      <p class="text-[12px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
        {{ mail.preview }}
      </p>

      <!-- Badges row -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 flex-wrap min-w-0">
          <!-- Thread count badge -->
          <span
            v-if="mail.threadCount && mail.threadCount > 1"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-medium rounded-md"
          >
            <UIcon name="i-lucide-users" class="w-3 h-3" />
            {{ mail.threadCount }}+
          </span>
          <!-- Extra avatars -->
          <span
            v-if="mail.extraAvatars"
            class="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-medium rounded-md"
          >
            +{{ mail.extraAvatars }}
          </span>
          <!-- Attachment count -->
          <span
            v-if="mail.attachments?.length"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-medium rounded-md"
          >
            <UIcon name="i-lucide-paperclip" class="w-3 h-3" />
            {{ mail.attachments.length }}
          </span>
          <!-- Label chips -->
          <BaseMailLabel
            v-for="lbl in (mail.labels ?? [])"
            :key="lbl"
            :label="lbl"
          />
        </div>

        <!-- Star button -->
        <button
          :class="[
            'shrink-0 p-0.5 rounded transition-opacity focus:outline-none',
            mail.starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          ]"
          :title="mail.starred ? 'Unstar' : 'Star'"
          @click.stop="toggleStar(mail.id)"
        >
          <!-- Use SVG directly for reliable fill control -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="w-3.5 h-3.5 transition-colors"
            :fill="mail.starred ? '#FBBF24' : 'none'"
            :stroke="mail.starred ? '#FBBF24' : '#CBD5E1'"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
