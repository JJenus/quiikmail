<script setup lang="ts">
import { useMailStore } from '~/composables/useMailStore'

const { state, closeCompose, minimizeCompose, saveDraft, sendMail, activeMailbox } = useMailStore()
const compose = computed(() => state.compose)

const senderItems = computed(() =>
  (activeMailbox.value?.senders ?? []).map(s => ({
    label: s.isDefault ? `${s.email} (default)` : s.email,
    value: s.email
  }))
)

const defaultSender = computed(() =>
  activeMailbox.value?.senders.find(s => s.isDefault)?.email
  ?? activeMailbox.value?.senders[0]?.email
  ?? ''
)

// Model that falls back to the mailbox's default sender when nothing is chosen.
const fromModel = computed({
  get: () => state.compose.from || defaultSender.value,
  set: (value: string | null) => {
    state.compose.from = value === defaultSender.value ? '' : (value ?? '')
  }
})

const sendFailed = ref(false)

function handleSend() {
  if (!state.compose.to) return
  sendMail()
    .then((ok) => {
      sendFailed.value = !ok
    })
}

function handleSaveDraft() {
  saveDraft()
  closeCompose()
}

// Closing via dismiss/overlay/esc should reset the compose window
function onCloseChange(open: boolean) {
  if (!open) closeCompose()
}

// Single bottom drawer: full-width bottom sheet on mobile,
// bottom-right floating window on desktop.
const drawerUi = computed(() => ({
  content: [
    'rounded-t-2xl mt-0 transition-all duration-200',
    'md:inset-x-auto md:right-6! md:bottom-6 md:w-[540px] md:rounded-2xl',
    state.compose.minimized ? 'h-12' : 'h-[88vh] md:h-[560px] md:max-h-[calc(100vh-5rem)]'
  ].join(' '),
  container: 'flex flex-col flex-1 min-h-0 overflow-hidden p-0',
  header: 'shrink-0 flex items-center gap-2 bg-inverted text-inverted px-4 h-12',
  body: 'flex-1 overflow-hidden p-0',
  footer: 'shrink-0 p-0'
}))

const headerButtonClass = 'text-inverted/60 hover:text-inverted hover:bg-white/15 dark:hover:bg-black/10'
</script>

<template>
  <UDrawer
    :open="compose.open"
    direction="bottom"
    :overlay="false"
    :handle="false"
    :dismissible="false"
    :close="false"
    :ui="drawerUi"
    @update:open="onCloseChange"
  >
    <template #header>
      <span
        class="flex-1 min-w-0 truncate text-[13px] font-semibold cursor-pointer select-none"
        @click="minimizeCompose"
      >
        {{ compose.subject || 'New Message' }}
      </span>
      <UButton
        :icon="compose.minimized ? 'i-lucide-maximize-2' : 'i-lucide-minus'"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        class="shrink-0"
        :class="headerButtonClass"
        :title="compose.minimized ? 'Expand' : 'Minimize'"
        @click.stop="minimizeCompose"
      />
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        class="shrink-0"
        :class="headerButtonClass"
        title="Close"
        @click.stop="closeCompose"
      />
    </template>

    <template #body>
      <div
        v-if="!compose.minimized"
        class="flex flex-col h-full min-h-0"
      >
        <div class="border-b border-default">
          <!-- From -->
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-default">
            <span class="text-xs font-medium text-dimmed w-8 shrink-0">From</span>
            <USelectMenu
              v-model="fromModel"
              :items="senderItems"
              value-key="value"
              size="xs"
              variant="none"
              class="flex-1 min-w-0"
              :ui="{
                base: 'px-0 py-0 text-[13px]',
                value: 'truncate text-default'
              }"
              placeholder="No sender configured"
              :disabled="senderItems.length === 0"
            />
          </div>
          <!-- To -->
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-default">
            <span class="text-xs font-medium text-dimmed w-8 shrink-0">To</span>
            <UInput
              v-model="state.compose.to"
              type="email"
              placeholder="recipient@example.com"
              variant="none"
              class="flex-1"
              :ui="{ base: 'px-0 py-0 text-[13px]' }"
            />
            <div class="flex gap-1 shrink-0">
              <UButton
                label="Cc"
                variant="link"
                size="xs"
                :color="compose.showCc ? 'primary' : 'neutral'"
                @click="state.compose.showCc = !state.compose.showCc"
              />
              <UButton
                label="Bcc"
                variant="link"
                size="xs"
                :color="compose.showBcc ? 'primary' : 'neutral'"
                @click="state.compose.showBcc = !state.compose.showBcc"
              />
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
              class="flex items-center gap-2 px-4 py-2.5 border-b border-default"
            >
              <span class="text-xs font-medium text-dimmed w-8 shrink-0">Cc</span>
              <UInput
                v-model="state.compose.cc"
                type="email"
                placeholder="cc@example.com"
                variant="none"
                class="flex-1"
                :ui="{ base: 'px-0 py-0 text-[13px]' }"
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
              class="flex items-center gap-2 px-4 py-2.5 border-b border-default"
            >
              <span class="text-xs font-medium text-dimmed w-8 shrink-0">Bcc</span>
              <UInput
                v-model="state.compose.bcc"
                type="email"
                placeholder="bcc@example.com"
                variant="none"
                class="flex-1"
                :ui="{ base: 'px-0 py-0 text-[13px]' }"
              />
            </div>
          </Transition>
          <!-- Subject -->
          <div class="flex items-center gap-2 px-4 py-2.5">
            <UInput
              v-model="state.compose.subject"
              placeholder="Subject"
              variant="none"
              class="flex-1"
              :ui="{ base: 'px-0 py-0 text-[13px] font-medium' }"
            />
          </div>
        </div>

        <!-- Body -->
        <UTextarea
          v-model="state.compose.body"
          placeholder="Write your message..."
          variant="none"
          class="flex-1 min-h-0"
          :ui="{ base: 'h-full w-full resize-none px-4 py-3 text-[13px] leading-relaxed' }"
        />
      </div>
    </template>

    <template #footer>
      <div
        v-if="!compose.minimized"
        class="flex flex-col gap-2 px-3 py-2.5 border-t border-default"
      >
        <p
          v-if="sendFailed"
          class="text-xs text-error flex items-center gap-1.5"
        >
          <UIcon
            name="i-lucide-circle-alert"
            class="size-3.5"
          />
          Could not send — check the mailbox send-from address and try again
        </p>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UButton
              label="Save draft"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="handleSaveDraft"
            />
            <UButton
              icon="i-lucide-send"
              label="Send"
              :disabled="!compose.to"
              :ui="{ base: 'rounded-xl px-4 py-2 text-[13px] font-semibold' }"
              @click="handleSend"
            />
          </div>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
