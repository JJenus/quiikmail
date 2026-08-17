<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
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

// Closing via dismiss/overlay/esc should reset the compose window
function onCloseChange(open: boolean) {
  if (!open) closeCompose()
}

// ── Shared field + footer markup (rendered in both Modal and Drawer) ──
const [DefineComposeFields, ReuseComposeFields] = createReusableTemplate()
const [DefineComposeFooter, ReuseComposeFooter] = createReusableTemplate()
</script>

<template>
  <!-- ── DESKTOP: centered modal ── -->
  <UModal
    :open="compose.open"
    class="hidden md:block"
    :ui="{
      content: 'w-[calc(100vw-2rem)] max-w-xl rounded-2xl',
      header: 'shrink-0 flex items-center gap-2 border-b border-default px-5 py-3',
      body: 'flex-1 overflow-hidden p-0',
      footer: 'shrink-0 p-0',
      close: 'static shrink-0'
    }"
    @update:open="onCloseChange"
  >
    <template #header>
      <span class="flex-1 min-w-0 truncate text-[13px] font-semibold text-highlighted">
        {{ compose.subject || 'New Message' }}
      </span>
      <UButton
        :icon="compose.minimized ? 'i-lucide-maximize-2' : 'i-lucide-minus'"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        :title="compose.minimized ? 'Expand' : 'Minimize'"
        @click="minimizeCompose"
      />
    </template>

    <template #body>
      <ReuseComposeFields v-if="!compose.minimized" />
    </template>

    <template #footer>
      <ReuseComposeFooter v-if="!compose.minimized" />
    </template>
  </UModal>

  <!-- ── MOBILE: bottom sheet ── -->
  <UDrawer
    :open="compose.open"
    direction="bottom"
    class="md:hidden"
    :ui="{
      content: 'h-[92dvh] rounded-t-2xl',
      container: 'flex flex-col flex-1 min-h-0 overflow-hidden p-0',
      header: 'shrink-0 flex items-center gap-2 px-4 py-3 border-b border-default',
      footer: 'shrink-0 p-0'
    }"
    @update:open="onCloseChange"
  >
    <template #header>
      <span class="flex-1 min-w-0 truncate text-sm font-semibold text-highlighted">
        {{ compose.subject || 'New Message' }}
      </span>
    </template>

    <template #actions>
      <UButton
        :icon="compose.minimized ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        aria-label="Minimize"
        @click="minimizeCompose"
      />
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        aria-label="Close"
        @click="closeCompose"
      />
    </template>

    <template #body>
      <ReuseComposeFields v-if="!compose.minimized" />
    </template>

    <template #footer>
      <ReuseComposeFooter v-if="!compose.minimized" />
    </template>
  </UDrawer>

  <!-- ── Shared markup ── -->
  <DefineComposeFields>
    <div class="flex flex-col flex-1 min-h-0">
      <div class="border-b border-default">
        <!-- To -->
        <div class="flex items-center gap-3 px-5 py-2.5 border-b border-default">
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
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="compose.showCc"
            class="flex items-center gap-3 px-5 py-2.5 border-b border-default"
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
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="compose.showBcc"
            class="flex items-center gap-3 px-5 py-2.5 border-b border-default"
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
        <div class="flex items-center gap-3 px-5 py-2.5">
          <UInput
            v-model="state.compose.subject"
            placeholder="Subject"
            variant="none"
            class="flex-1"
            :ui="{ base: 'px-0 py-0 text-[13px] font-semibold' }"
          />
        </div>
      </div>

      <!-- Body -->
      <UTextarea
        v-model="state.compose.body"
        placeholder="Write your message..."
        variant="none"
        class="flex-1 min-h-0"
        :ui="{ base: 'h-full w-full resize-none px-5 py-4 text-[13px] leading-relaxed' }"
      />
    </div>
  </DefineComposeFields>

  <DefineComposeFooter>
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
          icon="i-lucide-image"
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
          @click="handleSend"
        />
      </div>
    </div>
  </DefineComposeFooter>
</template>
