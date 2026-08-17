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
  <div v-else class="flex flex-col h-full overflow-hidden">

    <!-- Per-mail toolbar: back (mobile) + pagination + actions -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white shrink-0">
      <div class="flex items-center gap-1">
        <!-- Mobile back -->
        <button
          class="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          @click="selectMail(null)"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        </button>
        <!-- Desktop pagination -->
        <button
          class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-30"
          :disabled="currentIndex <= 1"
          @click="navigateMail(-1)"
        >
          <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
        </button>
        <span class="hidden md:block text-[12px] text-slate-400 px-1 tabular-nums select-none">
          {{ currentIndex }} of {{ totalMails.toLocaleString() }}
        </span>
        <button
          class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-30"
          :disabled="currentIndex >= totalMails"
          @click="navigateMail(1)"
        >
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
        </button>
      </div>

      <!-- Right action bar -->
      <div class="flex items-center gap-1">
        <IconBtn icon="i-lucide-archive" label="Archive" size="sm" @click="handleArchive" />
        <IconBtn icon="i-lucide-trash-2" label="Delete" size="sm" :danger="true" @click="handleDelete" />
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto overscroll-contain bg-white">
      <div class="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">

        <!-- Sender header row -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <BaseMailAvatar :name="mail.from.name" size="md" />
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[14px] font-bold text-slate-800">{{ mail.from.name }}</span>
                <span class="text-[12px] text-slate-400 truncate">&lt;{{ mail.from.email }}&gt;</span>
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
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <div v-if="showDetails" class="mt-2 text-[12px] text-slate-400 space-y-0.5">
                  <p><span class="text-slate-300 mr-1">From:</span>{{ mail.from.name }} &lt;{{ mail.from.email }}&gt;</p>
                  <p><span class="text-slate-300 mr-1">To:</span>{{ mail.to.map(t => t.email).join(', ') }}</p>
                  <p><span class="text-slate-300 mr-1">Date:</span>{{ formatFullDate(mail.date) }}</p>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Star + action buttons -->
          <div class="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            <button class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" @click="toggleStar(mail.id)">
              <UIcon
                name="i-lucide-star"
                :class="['w-4 h-4 transition-colors', mail.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400']"
              />
            </button>
            <button
              class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              @click="replyTo(mail)"
            >
              <UIcon name="i-lucide-reply" class="w-3.5 h-3.5" /> Reply
            </button>
            <button
              class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              @click="replyTo(mail)"
            >
              <UIcon name="i-lucide-reply-all" class="w-3.5 h-3.5" /> Reply All
            </button>
            <button
              class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              @click="forwardMail(mail)"
            >
              <UIcon name="i-lucide-forward" class="w-3.5 h-3.5" /> Forward
            </button>
            <IconBtn icon="i-lucide-more-vertical" label="More actions" size="sm" />
          </div>
        </div>

        <!-- Date line -->
        <p class="text-[12px] text-slate-400 flex items-center gap-1.5 -mt-1">
          <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
          {{ formatFullDate(mail.date) }}
        </p>

        <!-- Subject + label chips -->
        <div>
          <h1 class="text-[20px] font-bold text-slate-800 leading-snug mb-2">
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

        <div class="border-t border-slate-100" />

        <!-- Body -->
        <div class="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">
          {{ mail.body }}
        </div>

        <!-- Attachments -->
        <div v-if="mail.attachments?.length" class="space-y-2.5">
          <p class="text-[13px] font-semibold text-slate-700">Attachments</p>
          <div class="flex flex-wrap gap-2">
            <MailAttachmentItem
              v-for="att in mail.attachments"
              :key="att.id"
              :attachment="att"
            />
          </div>
        </div>

        <!-- ── Inline reply box ── -->
        <div class="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <!-- To chip row -->
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-white">
            <span class="text-[12px] text-slate-400 shrink-0">To</span>
            <div class="flex-1 flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 border border-violet-200 rounded-lg text-[12px] font-medium text-violet-700">
                {{ mail.from.name }}
                <button class="text-violet-400 hover:text-violet-600 ml-0.5 transition-colors">
                  <UIcon name="i-lucide-x" class="w-3 h-3" />
                </button>
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 text-[12px] text-slate-400">
              <button class="hover:text-slate-600 font-medium transition-colors">Cc</button>
              <button class="hover:text-slate-600 font-medium transition-colors">Bcc</button>
              <button class="hover:text-slate-600 transition-colors">
                <UIcon name="i-lucide-maximize-2" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Textarea -->
          <textarea
            v-model="replyBody"
            placeholder="Write your reply..."
            class="w-full px-4 py-3 text-[13px] text-slate-600 placeholder:text-slate-300 bg-white outline-none resize-none leading-relaxed"
            rows="4"
          />

          <!-- Formatting toolbar + Send -->
          <div class="flex items-center justify-between px-3 py-2.5 border-t border-slate-100 bg-white">
            <div class="flex items-center gap-0.5">
              <IconBtn icon="i-lucide-type" label="Format" size="sm" />
              <IconBtn icon="i-lucide-bold" label="Bold" size="sm" />
              <IconBtn icon="i-lucide-italic" label="Italic" size="sm" />
              <IconBtn icon="i-lucide-smile" label="Emoji" size="sm" />
              <IconBtn icon="i-lucide-paperclip" label="Attach" size="sm" />
              <IconBtn icon="i-lucide-link" label="Link" size="sm" />
              <IconBtn icon="i-lucide-more-horizontal" label="More" size="sm" />
            </div>
            <button
              class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-xl transition-colors"
              :disabled="!replyBody.trim()"
              @click="replyTo(mail); replyBody = ''"
            >
              Send
              <UIcon name="i-lucide-send" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Bottom spacing -->
        <div class="h-4" />
      </div>
    </div>
  </div>
</template>
