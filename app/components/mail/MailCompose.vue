<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const { state, closeCompose, minimizeCompose, saveDraft, sendMail } = useMailStore()
const compose = computed(() => state.compose)

function handleSend() {
  const success = sendMail()
  if (!success) {
    // TODO: show toast error
  }
}

function handleSaveDraft() {
  saveDraft()
  closeCompose()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="compose.open"
      :class="[
        'fixed z-50 shadow-2xl rounded-t-2xl md:rounded-2xl overflow-hidden',
        'bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:w-[540px]',
        compose.minimized ? 'h-12' : 'h-[90vh] md:h-[560px]',
        'flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-all duration-200'
      ]"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 h-12 shrink-0 bg-gray-800 dark:bg-gray-950 cursor-pointer"
        @click="minimizeCompose"
      >
        <span class="text-sm font-semibold text-white">
          {{ compose.subject || 'New Message' }}
        </span>
        <div class="flex items-center gap-1" @click.stop>
          <IconBtn
            :icon="compose.minimized ? 'i-lucide-maximize-2' : 'i-lucide-minus'"
            label="Minimize"
            size="xs"
            class="text-gray-300 hover:text-white hover:bg-gray-700"
            @click="minimizeCompose"
          />
          <IconBtn
            icon="i-lucide-x"
            label="Close"
            size="xs"
            class="text-gray-300 hover:text-white hover:bg-gray-700"
            @click="closeCompose"
          />
        </div>
      </div>

      <!-- Form -->
      <div v-if="!compose.minimized" class="flex flex-col flex-1 overflow-hidden">
        <!-- Fields -->
        <div class="border-b border-gray-100 dark:border-gray-800">
          <!-- To -->
          <div class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-xs font-medium text-gray-400 w-8 shrink-0">To</span>
            <input
              v-model="state.compose.to"
              type="email"
              placeholder="recipient@example.com"
              class="flex-1 text-sm text-gray-800 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
            <div class="flex gap-1">
              <button
                class="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium px-1"
                @click="state.compose.showCc = !state.compose.showCc"
              >Cc</button>
              <button
                class="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium px-1"
                @click="state.compose.showBcc = !state.compose.showBcc"
              >Bcc</button>
            </div>
          </div>

          <!-- CC -->
          <div v-if="compose.showCc" class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-xs font-medium text-gray-400 w-8 shrink-0">Cc</span>
            <input
              v-model="state.compose.cc"
              type="email"
              placeholder="cc@example.com"
              class="flex-1 text-sm text-gray-800 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <!-- BCC -->
          <div v-if="compose.showBcc" class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <span class="text-xs font-medium text-gray-400 w-8 shrink-0">Bcc</span>
            <input
              v-model="state.compose.bcc"
              type="email"
              placeholder="bcc@example.com"
              class="flex-1 text-sm text-gray-800 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <!-- Subject -->
          <div class="flex items-center gap-2 px-4 py-2">
            <input
              v-model="state.compose.subject"
              type="text"
              placeholder="Subject"
              class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>
        </div>

        <!-- Body -->
        <textarea
          v-model="state.compose.body"
          placeholder="Write your message..."
          class="flex-1 resize-none px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-transparent outline-none leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-600"
        />

        <!-- Footer actions -->
        <div class="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div class="flex items-center gap-1">
            <IconBtn icon="i-lucide-paperclip" label="Attach file" size="sm" />
            <IconBtn icon="i-lucide-image" label="Insert image" size="sm" />
            <IconBtn icon="i-lucide-link" label="Insert link" size="sm" />
          </div>

          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              size="sm"
              color="neutral"
              icon="i-lucide-save"
              @click="handleSaveDraft"
            >
              Save draft
            </UButton>
            <UButton
              size="sm"
              icon="i-lucide-send"
              :disabled="!compose.to"
              @click="handleSend"
            >
              Send
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
