<script setup lang="ts">
import type { Mail } from '~/types/mail'
import { useMailStore } from '~/composables/useMailStore'
import { useMailFormat } from '~/composables/useMailFormat'

const props = defineProps<{
  mail: Mail
  active?: boolean
}>()

const { toggleStar, toggleSelectMail, isSelected, selectMail } = useMailStore()
const { formatDate, getInitials, getAvatarBg } = useMailFormat()

const checked = computed(() => isSelected(props.mail.id))
</script>

<template>
  <div
    :class="[
      'group relative flex items-start gap-2.5 px-3 py-3.5 cursor-pointer transition-colors border-b border-default last:border-b-0',
      active ? 'bg-primary/10' : 'hover:bg-elevated/70'
    ]"
    @click="selectMail(mail.id)"
  >
    <!-- Unread left stripe -->
    <div
      :class="[
        'absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full',
        !mail.read ? 'bg-primary' : 'bg-transparent'
      ]"
    />

    <!-- Checkbox (visible on hover or when checked) -->
    <div
      class="flex items-start pt-0.5 w-4 shrink-0"
      @click.stop
    >
      <UCheckbox
        :model-value="checked"
        size="xs"
        :class="checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        @change="toggleSelectMail(mail.id)"
      />
    </div>

    <!-- Sender avatar -->
    <div class="shrink-0 pt-0.5">
      <UAvatar
        :text="getInitials(mail.from.name ?? mail.from.email)"
        size="sm"
        :style="{ backgroundColor: getAvatarBg(mail.from.name ?? mail.from.email) }"
        :ui="{ fallback: 'text-white' }"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Sender name + time -->
      <div class="flex items-baseline justify-between gap-2 mb-0.5">
        <span
          :class="[
            'text-[13px] truncate',
            !mail.read ? 'font-bold text-highlighted' : 'font-medium text-muted'
          ]"
        >
          {{ mail.from.name ?? mail.from.email }}
        </span>
        <span class="text-[11px] text-dimmed shrink-0 whitespace-nowrap tabular-nums">
          {{ formatDate(mail.date) }}
        </span>
      </div>

      <!-- Subject -->
      <p
        :class="[
          'text-[13px] truncate mb-1',
          !mail.read ? 'font-semibold text-default' : 'text-dimmed'
        ]"
      >
        {{ mail.subject }}
      </p>

      <!-- Preview -->
      <p class="text-xs text-dimmed leading-relaxed line-clamp-2 mb-2">
        {{ mail.preview }}
      </p>

      <!-- Badges row -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 flex-wrap min-w-0">
          <!-- Thread count badge -->
          <UBadge
            v-if="mail.threadCount && mail.threadCount > 1"
            color="neutral"
            variant="subtle"
            size="xs"
            icon="i-lucide-users"
          >
            {{ mail.threadCount }}+
          </UBadge>
          <!-- Extra avatars -->
          <UBadge
            v-if="mail.extraAvatars"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            +{{ mail.extraAvatars }}
          </UBadge>
          <!-- Attachment count -->
          <UBadge
            v-if="mail.attachments?.length"
            color="neutral"
            variant="subtle"
            size="xs"
            icon="i-lucide-paperclip"
          >
            {{ mail.attachments.length }}
          </UBadge>
          <!-- Label chips -->
          <UBadge
            v-for="lbl in (mail.labels ?? [])"
            :key="lbl"
            color="primary"
            variant="subtle"
            size="xs"
          >
            {{ lbl }}
          </UBadge>
        </div>

        <!-- Star button -->
        <UButton
          icon="i-lucide-star"
          :color="mail.starred ? 'warning' : 'neutral'"
          variant="ghost"
          size="xs"
          square
          :class="[
            'shrink-0 transition-opacity',
            mail.starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          ]"
          :title="mail.starred ? 'Unstar' : 'Star'"
          @click.stop="toggleStar(mail.id)"
        />
      </div>
    </div>
  </div>
</template>
