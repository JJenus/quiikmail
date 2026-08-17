<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const { state, closeCompose, minimizeCompose, saveDraft, sendMail } = useMailStore()
const compose = computed(() => state.compose)

function handleSend() {
  if (!state.compose.to) return
  sendMail()
}

function handleSaveDraft() {
  saveDraft()
  closeCompose()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="compose.open"
      :class="[
        'fixed z-50 flex flex-col bg-white shadow-2xl border border-slate-200 overflow-hidden',
        'bottom-0 left-0 right-0 rounded-t-2xl',
        'md:bottom-6 md:left-auto md:right-6 md:w-[540px] md:rounded-2xl',
        compose.minimized ? 'h-12' : 'h-[88vh] md:h-[560px]',
        'transition-all duration-200'
      ]"
    >
      <!-- Header bar -->
      <div
        class="flex items-center justify-between px-4 h-12 shrink-0 bg-slate-800 cursor-pointer select-none"
        @click="minimizeCompose"
      >
        <span class="text-[13px] font-semibold text-white truncate">
          {{ compose.subject || 'New Message' }}
        </span>
        <div class="flex items-center gap-1" @click.stop>
          <button
            class="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            :title="compose.minimized ? 'Expand' : 'Minimize'"
            @click="minimizeCompose"
          >
            <UIcon
              :name="compose.minimized ? 'i-lucide-maximize-2' : 'i-lucide-minus'"
              class="w-3.5 h-3.5"
            />
          </button>
          <button
            class="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Close"
            @click="closeCompose"
          >
            <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Body (hidden when minimized) -->
      <div v-if="!compose.minimized" class="flex flex-col flex-1 overflow-hidden">
        <!-- Fields -->
        <div class="border-b border-slate-100">
          <!-- To -->
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
            <span class="text-[12px] text-slate-400 w-8 shrink-0">To</span>
            <input
              v-model="state.compose.to"
              type="email"
              placeholder="recipient@example.com"
              class="flex-1 text-[13px] text-slate-700 placeholder:text-slate-300 bg-transparent outline-none"
            />
            <div class="flex items-center gap-2 text-[12px] text-slate-400 shrink-0">
              <button
                class="hover:text-slate-600 transition-colors font-medium"
                @click="state.compose.showCc = !state.compose.showCc"
              >Cc</button>
              <button
                class="hover:text-slate-600 transition-colors font-medium"
                @click="state.compose.showBcc = !state.compose.showBcc"
              >Bcc</button>
            </div>
          </div>

          <!-- Cc -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="compose.showCc"
              class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100"
            >
              <span class="text-[12px] text-slate-400 w-8 shrink-0">Cc</span>
              <input
                v-model="state.compose.cc"
                type="email"
                placeholder="cc@example.com"
                class="flex-1 text-[13px] text-slate-700 placeholder:text-slate-300 bg-transparent outline-none"
              />
            </div>
          </Transition>

          <!-- Bcc -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="compose.showBcc"
              class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100"
            >
              <span class="text-[12px] text-slate-400 w-8 shrink-0">Bcc</span>
              <input
                v-model="state.compose.bcc"
                type="email"
                placeholder="bcc@example.com"
                class="flex-1 text-[13px] text-slate-700 placeholder:text-slate-300 bg-transparent outline-none"
              />
            </div>
          </Transition>

          <!-- Subject -->
          <div class="flex items-center gap-2 px-4 py-2.5">
            <input
              v-model="state.compose.subject"
              type="text"
              placeholder="Subject"
              class="flex-1 text-[13px] font-medium text-slate-700 placeholder:text-slate-300 bg-transparent outline-none"
            />
          </div>
        </div>

        <!-- Body textarea -->
        <textarea
          v-model="state.compose.body"
          placeholder="Write your message..."
          class="flex-1 resize-none px-4 py-3 text-[13px] text-slate-600 placeholder:text-slate-300 bg-transparent outline-none leading-relaxed"
        />

        <!-- Footer toolbar -->
        <div class="flex items-center justify-between px-3 py-2.5 border-t border-slate-100 shrink-0">
          <div class="flex items-center gap-0.5">
            <IconBtn icon="i-lucide-type" label="Format text" size="sm" />
            <IconBtn icon="i-lucide-smile" label="Emoji" size="sm" />
            <IconBtn icon="i-lucide-paperclip" label="Attach file" size="sm" />
            <IconBtn icon="i-lucide-link" label="Insert link" size="sm" />
            <IconBtn icon="i-lucide-image" label="Insert image" size="sm" />
            <IconBtn icon="i-lucide-more-horizontal" label="More" size="sm" />
          </div>
          <div class="flex items-center gap-2">
            <button
              class="text-[12px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              @click="handleSaveDraft"
            >
              Save draft
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-xl transition-colors"
              :disabled="!compose.to"
              @click="handleSend"
            >
              Send
              <UIcon name="i-lucide-send" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
