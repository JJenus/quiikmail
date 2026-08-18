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

// Desktop floating window: bottom-right, collapses to just the header when minimized
const modalUi = computed(() => ({
  content: [
    'md:top-auto md:left-auto md:right-6 md:bottom-6 md:translate-x-0 md:translate-y-0',
    'md:w-[540px] md:max-w-none md:max-h-none md:rounded-2xl',
    'transition-all duration-200',
    state.compose.minimized ? 'md:h-12' : 'md:h-[560px]'
  ].join(' '),
  header: 'shrink-0 flex items-center gap-2 bg-inverted text-inverted px-4 h-12',
  body: 'flex-1 overflow-hidden p-0',
  footer: 'shrink-0 p-0'
}))

// Mobile bottom sheet
const drawerUi = computed(() => ({
  content: [
    'rounded-t-2xl mt-0 transition-all duration-200',
    state.compose.minimized ? 'h-12' : 'h-[88vh]'
  ].join(' '),
  header: 'shrink-0 flex items-center gap-2 bg-inverted text-inverted px-4 h-12',
  container: 'flex flex-col flex-1 min-h-0 overflow-hidden p-0',
  footer: 'shrink-0 p-0'
}))

const headerButtonClass = 'text-inverted/60 hover:text-inverted hover:bg-white/15 dark:hover:bg-black/10'

// ── Shared field + footer markup (rendered in both Modal and Drawer) ──
const [DefineComposeFields, ReuseComposeFields] = createReusableTemplate()
const [DefineComposeFooter, ReuseComposeFooter] = createReusableTemplate()
</script>

<template>
  <!-- ── DESKTOP: floating window (bottom-right, no backdrop) ── -->
  <UModal
    :open="compose.open"
    class="hidden md:flex"
    :overlay="false"
    :dismissible="false"
    :close="false"
    :ui="modalUi"
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
    :overlay="false"
    :handle="false"
    :dismissible="false"
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
    </template>

    <template #actions>
      <UButton
        :icon="compose.minimized ? 'i-lucide-maximize-2' : 'i-lucide-minus'"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        :class="headerButtonClass"
        :title="compose.minimized ? 'Expand' : 'Minimize'"
        @click="minimizeCompose"
      />
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        :class="headerButtonClass"
        title="Close"
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
          :ui="{ base: 'rounded-xl px-4 py-2 text-[13px] font-semibold' }"
          @click="handleSend"
        />
      </div>
    </div>
  </DefineComposeFooter>
</template>
