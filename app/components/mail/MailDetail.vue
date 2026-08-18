<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useMailStore } from '~/composables/useMailStore'
import { useMailFormat } from '~/composables/useMailFormat'

const {
  state, selectedMail, toggleStar,
  deleteMails, archiveMails, replyTo, forwardMail, selectMail
} = useMailStore()
const { formatFullDate, getInitials, getAvatarBg } = useMailFormat()

const mail = selectedMail
const showDetails = ref(false)
const replyBody = ref('')

watch(() => mail.value?.id, () => {
  replyBody.value = ''
  showDetails.value = false
})

function handleDelete() {
  if (!mail.value) return
  deleteMails([mail.value.id])
  selectMail(null)
}

function handleArchive() {
  if (!mail.value) return
  archiveMails([mail.value.id])
  selectMail(null)
}

const currentIndex = computed(() => {
  if (!mail.value) return 0
  return state.mails.findIndex(m => m.id === mail.value!.id) + 1
})
const totalMails = computed(() => state.mails.length)

function navigateMail(dir: -1 | 1) {
  const idx = state.mails.findIndex(m => m.id === state.selectedId)
  const next = state.mails[idx + dir]
  if (next) selectMail(next.id)
}

const moreActions: DropdownMenuItem[] = [
  { label: 'Archive', icon: 'i-lucide-archive', onSelect: () => handleArchive() },
  { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => handleDelete() }
]
</script>

<template>
  <!-- Empty state -->
  <div
    v-if="!mail"
    class="flex-1 flex items-center justify-center h-full bg-elevated/40"
  >
    <UEmpty
      variant="naked"
      icon="i-lucide-mail-open"
      title="Select a message"
      description="Choose a message from the list to read it here."
    />
  </div>

  <!-- Mail reading pane -->
  <div
    v-else
    class="flex flex-col h-full overflow-hidden bg-default"
  >
    <!-- Per-mail toolbar: back (mobile) + pagination + actions -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-default shrink-0">
      <div class="flex items-center gap-1">
        <!-- Mobile back -->
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="md:hidden"
          aria-label="Back to list"
          @click="selectMail(null)"
        />
        <!-- Desktop pagination -->
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="hidden md:flex"
          :disabled="currentIndex <= 1"
          aria-label="Previous message"
          @click="navigateMail(-1)"
        />
        <span class="hidden md:block text-xs text-dimmed px-1 tabular-nums select-none">
          {{ currentIndex }} of {{ totalMails.toLocaleString() }}
        </span>
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="hidden md:flex"
          :disabled="currentIndex >= totalMails"
          aria-label="Next message"
          @click="navigateMail(1)"
        />
      </div>

      <!-- Right action bar -->
      <div class="flex items-center gap-1">
        <UTooltip text="Archive">
          <UButton
            icon="i-lucide-archive"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            @click="handleArchive"
          />
        </UTooltip>
        <UTooltip text="Delete">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            square
            @click="handleDelete"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <div class="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">
        <!-- Sender header row -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <UAvatar
              :text="getInitials(mail.from.name ?? mail.from.email)"
              size="lg"
              :style="{ backgroundColor: getAvatarBg(mail.from.name ?? mail.from.email) }"
              :ui="{ fallback: 'text-white' }"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-highlighted">{{ mail.from.name ?? mail.from.email }}</span>
                <span class="text-xs text-dimmed truncate">&lt;{{ mail.from.email }}&gt;</span>
              </div>
              <UButton
                :label="showDetails ? 'Hide details' : 'To Me'"
                color="neutral"
                variant="link"
                size="xs"
                class="mt-0.5 text-dimmed"
                :icon="showDetails ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                @click="showDetails = !showDetails"
              />
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <div
                  v-if="showDetails"
                  class="mt-2 text-xs text-dimmed space-y-0.5"
                >
                  <p><span class="text-muted mr-1">From:</span>{{ mail.from.name ?? mail.from.email }} &lt;{{ mail.from.email }}&gt;</p>
                  <p><span class="text-muted mr-1">To:</span>{{ mail.to.map(t => t.email).join(', ') }}</p>
                  <p><span class="text-muted mr-1">Date:</span>{{ formatFullDate(mail.date) }}</p>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Star + action buttons -->
          <div class="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            <UButton
              :icon="'i-lucide-star'"
              :color="mail.starred ? 'warning' : 'neutral'"
              variant="ghost"
              size="sm"
              square
              :title="mail.starred ? 'Unstar' : 'Star'"
              @click="toggleStar(mail.id)"
            />
            <UButton
              icon="i-lucide-reply"
              label="Reply"
              color="neutral"
              variant="outline"
              size="sm"
              class="hidden sm:flex"
              @click="replyTo(mail)"
            />
            <UButton
              icon="i-lucide-reply-all"
              label="Reply All"
              color="neutral"
              variant="outline"
              size="sm"
              class="hidden sm:flex"
              @click="replyTo(mail)"
            />
            <UButton
              icon="i-lucide-forward"
              label="Forward"
              color="neutral"
              variant="outline"
              size="sm"
              class="hidden sm:flex"
              @click="forwardMail(mail)"
            />
            <UDropdownMenu
              :items="moreActions"
              :content="{ align: 'end' }"
            >
              <UButton
                icon="i-lucide-more-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                square
                aria-label="More actions"
              />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Date line -->
        <p class="text-xs text-dimmed flex items-center gap-1.5 -mt-1">
          <UIcon
            name="i-lucide-calendar"
            class="size-3.5"
          />
          {{ formatFullDate(mail.date) }}
        </p>

        <!-- Subject + label chips -->
        <div>
          <h1 class="text-xl font-bold text-highlighted leading-snug mb-2">
            {{ mail.subject }}
          </h1>
          <div
            v-if="mail.labels?.length"
            class="flex flex-wrap gap-1.5"
          >
            <UBadge
              v-for="lbl in mail.labels"
              :key="lbl"
              color="primary"
              variant="subtle"
              size="sm"
            >
              {{ lbl }}
              <UButton
                icon="i-lucide-x"
                color="primary"
                variant="link"
                size="xs"
                square
                class="ms-0.5"
                :aria-label="`Remove ${lbl} label`"
              />
            </UBadge>
          </div>
        </div>

        <USeparator />

        <!-- Body -->
        <div class="text-sm text-default leading-relaxed whitespace-pre-wrap">
          {{ mail.body }}
        </div>

        <!-- Attachments -->
        <div
          v-if="mail.attachments?.length"
          class="space-y-2.5"
        >
          <p class="text-[13px] font-semibold text-default">
            Attachments
          </p>
          <div class="flex flex-wrap gap-2">
            <MailAttachmentItem
              v-for="att in mail.attachments"
              :key="att.id"
              :attachment="att"
            />
          </div>
        </div>

        <!-- ── Inline reply box ── -->
        <div class="border border-default rounded-2xl overflow-hidden shadow-sm bg-default">
          <!-- To chip row -->
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-default">
            <span class="text-xs text-dimmed shrink-0">To</span>
            <div class="flex-1 flex items-center gap-1.5 flex-wrap min-w-0">
              <UBadge
                color="primary"
                variant="subtle"
                size="sm"
              >
                {{ mail.from.name ?? mail.from.email }}
                <UButton
                  icon="i-lucide-x"
                  color="primary"
                  variant="link"
                  size="xs"
                  square
                  class="ms-0.5"
                  aria-label="Remove recipient"
                />
              </UBadge>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <UButton
                label="Cc"
                color="neutral"
                variant="ghost"
                size="xs"
                class="text-dimmed"
              />
              <UButton
                label="Bcc"
                color="neutral"
                variant="ghost"
                size="xs"
                class="text-dimmed"
              />
              <UButton
                icon="i-lucide-maximize-2"
                color="neutral"
                variant="ghost"
                size="xs"
                square
              />
            </div>
          </div>

          <!-- Textarea -->
          <UTextarea
            v-model="replyBody"
            placeholder="Write your reply..."
            variant="none"
            :rows="4"
            class="w-full"
            :ui="{ base: 'w-full resize-none px-4 py-3 text-[13px] leading-relaxed' }"
          />

          <!-- Formatting toolbar + Send -->
          <div class="flex items-center justify-between px-3 py-2.5 border-t border-default">
            <div class="flex items-center gap-0.5">
              <UButton
                icon="i-lucide-type"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
              <UButton
                icon="i-lucide-bold"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
              <UButton
                icon="i-lucide-italic"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
              <UButton
                icon="i-lucide-smile"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
              <UButton
                icon="i-lucide-paperclip"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
              <UButton
                icon="i-lucide-link"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
              <UButton
                icon="i-lucide-more-horizontal"
                color="neutral"
                variant="ghost"
                size="sm"
                square
              />
            </div>
            <UButton
              icon="i-lucide-send"
              label="Send"
              :disabled="!replyBody.trim()"
              @click="replyTo(mail); replyBody = ''"
            />
          </div>
        </div>

        <!-- Bottom spacing -->
        <div class="h-4" />
      </div>
    </div>
  </div>
</template>
