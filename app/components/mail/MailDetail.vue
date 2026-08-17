<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'
import { useMailFormat } from '~/composables/useMailFormat'

const {
  state, selectedMail, toggleStar,
  deleteMails, archiveMails, replyTo, forwardMail, selectMail
} = useMailStore()
const { formatFullDate } = useMailFormat()

const mail = selectedMail
const showDetails = ref(false)

// Inline reply state
const replyBody = ref('')
const replyFocused = ref(false)

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

function handleSendReply() {
  if (!mail.value || !replyBody.value.trim()) return
  replyTo(mail.value)
  replyBody.value = ''
}

// Pagination mock
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
</script>

<template>
  <!-- Empty state -->
  <div
    v-if="!mail"
    class="flex-1 flex items-center justify-center h-full bg-slate-50/60"
  >
    <BaseEmptyState
      icon="i-lucide-mail-open"
      title="Select a message"
      description="Choose a message from the list to read it here."
    />
  </div>

  <!-- Mail reading pane -->
  <div v-else class="flex flex-col h-full bg-white overflow-hidden">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
      <!-- Left: back (mobile) + nav -->
      <div class="flex items-center gap-1">
        <button
          class="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          @click="selectMail(null)"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        </button>
        <button
          class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          @click="navigateMail(-1)"
        >
          <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
        </button>
        <span class="hidden md:block text-[12px] text-slate-400 px-1 tabular-nums">
          {{ currentIndex }} of {{ totalMails.toLocaleString() }}
        </span>
        <button
          class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          @click="navigateMail(1)"
        >
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
        </button>
      </div>

      <!-- Right: user profile -->
      <div class="flex items-center gap-3">
        <button class="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
          <UIcon name="i-lucide-bell" class="w-4 h-4" />
          <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
        </button>
        <div class="flex items-center gap-2 cursor-pointer group">
          <BaseMailAvatar name="Ralph Edwards" size="sm" />
          <div class="hidden sm:block text-right">
            <p class="text-[12px] font-semibold text-slate-700 leading-tight">Ralph Edwards</p>
            <p class="text-[11px] text-slate-400 leading-tight">edwards.ralph@example.com</p>
          </div>
          <UIcon name="i-lucide-chevron-down" class="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </div>

    <!-- Mail content + reply (scrollable) -->
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <div class="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">

        <!-- Sender row -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <BaseMailAvatar :name="mail.from.name" size="md" />
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[14px] font-semibold text-slate-800">{{ mail.from.name }}</span>
                <span class="text-[12px] text-slate-400">&lt;{{ mail.from.email }}&gt;</span>
              </div>
              <button
                class="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 mt-0.5 transition-colors"
                @click="showDetails = !showDetails"
              >
                <span>To Me</span>
                <UIcon
                  :name="showDetails ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="w-3 h-3"
                />
              </button>
              <div v-if="showDetails" class="mt-2 text-[12px] text-slate-400 space-y-0.5">
                <p><span class="text-slate-300">From:</span> {{ mail.from.name }} &lt;{{ mail.from.email }}&gt;</p>
                <p><span class="text-slate-300">To:</span> {{ mail.to.map(t => t.email).join(', ') }}</p>
                <p><span class="text-slate-300">Date:</span> {{ formatFullDate(mail.date) }}</p>
              </div>
            </div>
          </div>

          <!-- Actions: star, reply, reply all, forward, more -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              class="p-1.5 rounded-lg transition-colors"
              @click="toggleStar(mail.id)"
            >
              <UIcon
                name="i-lucide-star"
                :class="[
                  'w-4 h-4 transition-colors',
                  mail.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'
                ]"
              />
            </button>
            <button
              class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              @click="replyTo(mail)"
            >
              <UIcon name="i-lucide-reply" class="w-3.5 h-3.5" />
              Reply
            </button>
            <button
              class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              @click="replyTo(mail)"
            >
              <UIcon name="i-lucide-reply-all" class="w-3.5 h-3.5" />
              Reply All
            </button>
            <button
              class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              @click="forwardMail(mail)"
            >
              <UIcon name="i-lucide-forward" class="w-3.5 h-3.5" />
              Forward
            </button>
            <IconBtn icon="i-lucide-more-vertical" label="More" size="sm" />
          </div>
        </div>

        <!-- Date -->
        <p class="text-[12px] text-slate-400 flex items-center gap-1.5 -mt-2">
          <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
          {{ formatFullDate(mail.date) }}
        </p>

        <!-- Subject + labels -->
        <div>
          <h1 class="text-[18px] font-bold text-slate-800 leading-snug mb-2">
            {{ mail.subject }}
          </h1>
          <div v-if="mail.labels?.length" class="flex flex-wrap gap-1.5">
            <BaseMailLabel
              v-for="lbl in mail.labels"
              :key="lbl"
              :label="lbl"
              :removable="true"
            />
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-slate-100" />

        <!-- Body -->
        <div class="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">
          {{ mail.body }}
        </div>

        <!-- Attachments -->
        <div v-if="mail.attachments?.length" class="space-y-3">
          <p class="text-[13px] font-semibold text-slate-700">Attachments</p>
          <div class="flex flex-wrap gap-2">
            <MailAttachmentItem
              v-for="att in mail.attachments"
              :key="att.id"
              :attachment="att"
            />
          </div>
        </div>

        <!-- Inline Reply Box -->
        <div class="border border-slate-200 rounded-2xl overflow-hidden">
          <!-- To chip row -->
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
            <span class="text-[12px] text-slate-400 shrink-0">To</span>
            <div class="flex items-center gap-1.5 flex-wrap flex-1">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[12px] font-medium text-slate-600">
                {{ mail.from.name }}
                <button class="text-slate-400 hover:text-slate-600" @click="">
                  <UIcon name="i-lucide-x" class="w-3 h-3" />
                </button>
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 text-[12px] text-slate-400">
              <button class="hover:text-slate-600 transition-colors">Cc</button>
              <button class="hover:text-slate-600 transition-colors">Bcc</button>
              <button class="hover:text-slate-600 transition-colors">
                <UIcon name="i-lucide-maximize-2" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Body textarea -->
          <textarea
            v-model="replyBody"
            placeholder="Dear Shipping Company,

Thank you for the prompt notification about the arrival of my package..."
            class="w-full px-4 py-3 text-[13px] text-slate-600 placeholder:text-slate-300 bg-transparent outline-none resize-none leading-relaxed"
            rows="4"
            @focus="replyFocused = true"
            @blur="replyFocused = false"
          />

          <!-- Reply toolbar -->
          <div class="flex items-center justify-between px-3 py-2.5 border-t border-slate-100">
            <div class="flex items-center gap-0.5">
              <IconBtn icon="i-lucide-type" label="Text format" size="sm" />
              <IconBtn icon="i-lucide-smile" label="Emoji" size="sm" />
              <IconBtn icon="i-lucide-paperclip" label="Attach" size="sm" />
              <IconBtn icon="i-lucide-link" label="Link" size="sm" />
              <IconBtn icon="i-lucide-image" label="Image" size="sm" />
              <IconBtn icon="i-lucide-more-horizontal" label="More" size="sm" />
            </div>
            <button
              class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
              :disabled="!replyBody.trim()"
              @click="handleSendReply"
            >
              Send
              <UIcon name="i-lucide-send" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
