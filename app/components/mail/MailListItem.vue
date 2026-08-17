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
      'group relative flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800/80',
      active
        ? 'bg-primary-50/80 dark:bg-primary-900/10'
        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      !mail.read && !active ? 'bg-white dark:bg-gray-900' : ''
    ]"
    @click="selectMail(mail.id)"
  >
    <!-- Unread indicator -->
    <div
      :class="[
        'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-opacity',
        !mail.read ? 'bg-primary-500 opacity-100' : 'opacity-0'
      ]"
    />

    <!-- Checkbox (appears on hover or when selected) -->
    <div class="flex items-center pt-0.5 shrink-0" @click.stop>
      <UCheckbox
        :model-value="checked"
        :class="[
          'transition-opacity',
          checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]"
        @update:model-value="toggleSelectMail(mail.id)"
      />
    </div>

    <!-- Avatar (hidden when checkbox shown) -->
    <div
      :class="[
        'shrink-0 transition-all',
        checked ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 group-hover:opacity-0 group-hover:w-0 group-hover:overflow-hidden'
      ]"
    >
      <BaseMailAvatar :name="mail.from.name" size="sm" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2 mb-0.5">
        <span
          :class="[
            'text-sm truncate',
            !mail.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'
          ]"
        >
          {{ mail.from.name }}
        </span>
        <span class="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
          {{ formatDate(mail.date) }}
        </span>
      </div>

      <p
        :class="[
          'text-sm truncate mb-1',
          !mail.read ? 'font-medium text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
        ]"
      >
        {{ mail.subject }}
      </p>

      <div class="flex items-center gap-2">
        <p class="text-xs text-gray-400 dark:text-gray-500 truncate flex-1">
          {{ mail.preview }}
        </p>
        <div class="flex items-center gap-1 shrink-0">
          <UIcon
            v-if="mail.attachments?.length"
            name="i-lucide-paperclip"
            class="size-3 text-gray-400"
          />
          <button
            class="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            :title="mail.starred ? 'Unstar' : 'Star'"
            @click.stop="toggleStar(mail.id)"
          >
            <UIcon
              :name="mail.starred ? 'i-lucide-star' : 'i-lucide-star'"
              :class="[
                'size-3.5 transition-colors',
                mail.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-400'
              ]"
            />
          </button>
        </div>
      </div>

      <!-- Labels -->
      <div v-if="mail.labels?.length" class="flex flex-wrap gap-1 mt-1.5">
        <BaseMailLabel v-for="label in mail.labels" :key="label" :label="label" />
      </div>
    </div>
  </div>
</template>
