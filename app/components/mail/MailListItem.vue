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
      'group relative flex items-start gap-2.5 px-3 py-3 cursor-pointer transition-colors',
      'border-b border-slate-100',
      active
        ? 'bg-violet-50'
        : 'hover:bg-slate-50',
    ]"
    @click="selectMail(mail.id)"
  >
    <!-- Unread stripe -->
    <div
      :class="[
        'absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full transition-opacity',
        !mail.read ? 'bg-violet-500 opacity-100' : 'opacity-0'
      ]"
    />

    <!-- Checkbox -->
    <div class="flex items-start pt-0.5 w-4 shrink-0" @click.stop>
      <input
        type="checkbox"
        :checked="checked"
        :class="[
          'w-4 h-4 rounded border-slate-300 text-violet-600 cursor-pointer transition-opacity accent-violet-600',
          checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]"
        @change="toggleSelectMail(mail.id)"
      />
    </div>

    <!-- Avatar stack -->
    <div class="shrink-0 relative mt-0.5">
      <BaseMailAvatar :name="mail.from.name" size="sm" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Row 1: sender + time -->
      <div class="flex items-center justify-between gap-2 mb-0.5">
        <span
          :class="[
            'text-[13px] truncate',
            !mail.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'
          ]"
        >
          {{ mail.from.name }}
        </span>
        <span class="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
          {{ formatDate(mail.date) }}
        </span>
      </div>

      <!-- Row 2: subject -->
      <p
        :class="[
          'text-[13px] truncate mb-1',
          !mail.read ? 'font-semibold text-slate-700' : 'font-normal text-slate-500'
        ]"
      >
        {{ mail.subject }}
      </p>

      <!-- Row 3: preview -->
      <p class="text-[12px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
        {{ mail.preview }}
      </p>

      <!-- Row 4: badges + star -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 flex-wrap">
          <!-- Thread count -->
          <span
            v-if="mail.threadCount && mail.threadCount > 1"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-medium rounded-md"
          >
            <UIcon name="i-lucide-users" class="w-3 h-3" />
            {{ mail.threadCount }}+
          </span>
          <!-- Extra avatars count -->
          <span
            v-if="mail.extraAvatars"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-medium rounded-md"
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
          <!-- Labels -->
          <BaseMailLabel
            v-for="lbl in mail.labels"
            :key="lbl"
            :label="lbl"
          />
        </div>

        <!-- Star -->
        <button
          class="shrink-0 transition-opacity focus:outline-none"
          :class="mail.starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          :title="mail.starred ? 'Unstar' : 'Star'"
          @click.stop="toggleStar(mail.id)"
        >
          <UIcon
            name="i-lucide-star"
            :class="[
              'w-3.5 h-3.5 transition-colors',
              mail.starred
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 hover:text-amber-400'
            ]"
          />
        </button>
      </div>
    </div>
  </div>
</template>
