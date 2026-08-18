<script setup lang="ts">
import { mailboxService } from '~/services/mailboxService'
import { apiErrorMessage } from '~/utils/apiError'
import { useMailStore } from '~/composables/useMailStore'
import type { CreateMailboxResult } from '~/types/mailbox'

const { state, closeSetup, reloadMailboxes } = useMailStore()

const step = ref(1)
const creating = ref(false)
const validating = ref(false)
const error = ref<string | null>(null)

const name = ref('')
const apiKey = ref('')
const fromAddress = ref('')
const autoWebhook = ref(true)
const keyValid = ref(false)
const keyLive = ref(true)
const result = ref<CreateMailboxResult | null>(null)
const webhookSecret = ref('')
const savingSecret = ref(false)
const secretSaved = ref(false)

const hasMailboxes = computed(() => state.mailboxes.length > 0)

watch(() => state.setupOpen, (open) => {
  if (open) {
    step.value = 1
    error.value = null
    result.value = null
    keyValid.value = false
    keyLive.value = true
  }
})

async function validateKey() {
  if (!apiKey.value) return
  validating.value = true
  error.value = null
  try {
    const res = await mailboxService.validateApiKey(apiKey.value)
    keyValid.value = res.valid
    keyLive.value = res.live
  } catch (e) {
    error.value = apiErrorMessage(e, 'This Resend API key could not be validated')
    keyValid.value = false
  } finally {
    validating.value = false
  }
}

async function createMailbox() {
  if (!keyValid.value) await validateKey()
  if (!keyValid.value) return
  creating.value = true
  error.value = null
  try {
    result.value = await mailboxService.create({
      name: name.value,
      apiKey: apiKey.value,
      fromAddress: fromAddress.value || undefined,
      autoWebhook: autoWebhook.value
    })
    step.value = 2
  } catch (e) {
    error.value = apiErrorMessage(e, 'Could not create the mailbox')
  } finally {
    creating.value = false
  }
}

async function saveWebhookSecret() {
  if (!result.value || !webhookSecret.value) return
  savingSecret.value = true
  error.value = null
  try {
    await mailboxService.update(result.value.mailbox.id, { webhookSecret: webhookSecret.value })
    result.value.mailbox.webhookConfigured = true
    secretSaved.value = true
  } catch (e) {
    error.value = apiErrorMessage(e, 'Could not save the webhook secret')
  } finally {
    savingSecret.value = false
  }
}

async function copyWebhookUrl() {
  try {
    await navigator.clipboard.writeText(result.value?.webhookUrl ?? '')
  } catch {
    // clipboard unavailable
  }
}

async function finish() {
  closeSetup()
  await reloadMailboxes()
}
</script>

<template>
  <UModal
    :open="state.setupOpen"
    :dismissible="hasMailboxes"
    :overlay="true"
    @update:open="(open) => { if (!open) closeSetup() }"
  >
    <template #body>
      <div class="flex flex-col gap-5 p-2 sm:p-4">
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="size-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <UIcon
              name="i-lucide-mail"
              class="size-5 text-inverted"
            />
          </div>
          <h2 class="text-lg font-bold text-highlighted">
            Connect a mailbox
          </h2>
          <p class="text-sm text-muted">
            Link your Resend account to receive and send email
          </p>
        </div>

        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2">
          <div
            v-for="i in 2"
            :key="i"
            class="size-2 rounded-full transition-colors"
            :class="i <= step ? 'bg-primary' : 'bg-default'"
          />
        </div>

        <UAlert
          v-if="error"
          icon="i-lucide-circle-alert"
          color="error"
          variant="soft"
          :title="error"
        />

        <!-- Step 1: mailbox details -->
        <div
          v-if="step === 1"
          class="flex flex-col gap-4"
        >
          <UFormField label="Mailbox name">
            <UInput
              v-model="name"
              name="name"
              placeholder="Work, Personal, …"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Resend API key"
            hint="Create one at resend.com/api-keys — needs read access to inbound email"
          >
            <UInput
              v-model="apiKey"
              name="apiKey"
              type="password"
              placeholder="re_…"
              size="lg"
              class="w-full"
              @blur="validateKey"
            />
            <div
              v-if="keyValid && keyLive"
              class="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="size-4"
              />
              Key validated
            </div>
            <div
              v-else-if="keyValid && !keyLive"
              class="mt-2 flex items-center gap-1.5 text-sm text-warning"
            >
              <UIcon
                name="i-lucide-triangle-alert"
                class="size-4"
              />
              Key is valid, but it's a test key — production sending may be disabled
            </div>
          </UFormField>

          <UFormField
            label="Send from address (optional)"
            hint="A verified sender on your Resend domain, e.g. you@yourdomain.com — this is the address recipients see, separate from your account email"
          >
            <UInput
              v-model="fromAddress"
              name="fromAddress"
              type="email"
              placeholder="you@yourdomain.com"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UCheckbox
            v-model="autoWebhook"
            label="Auto-create the inbound webhook (recommended)"
          />

          <UButton
            size="lg"
            block
            :loading="creating"
            :disabled="!name || !apiKey"
            @click="createMailbox"
          >
            Connect mailbox
          </UButton>
        </div>

        <!-- Step 2: webhook result -->
        <div
          v-else-if="result"
          class="flex flex-col gap-4"
        >
          <div class="flex items-start gap-3 rounded-xl bg-primary/10 p-4">
            <UIcon
              :name="result.webhookAutoConfigured ? 'i-lucide-circle-check' : 'i-lucide-settings-2'"
              class="size-5 text-primary shrink-0 mt-0.5"
            />
            <div class="text-sm text-muted">
              <p class="font-semibold text-highlighted">
                Mailbox "{{ result.mailbox.name }}" is connected
              </p>
              <p
                v-if="result.webhookAutoConfigured"
                class="mt-1"
              >
                The inbound webhook was created automatically — new email arrives in near real-time.
              </p>
              <p
                v-else
                class="mt-1"
              >
                Auto-configuration was skipped. Create a webhook in Resend pointing at this URL:
              </p>
            </div>
          </div>

          <div
            v-if="!result.webhookAutoConfigured"
            class="flex flex-col gap-3"
          >
            <UFormField label="Webhook URL">
              <UInput
                :model-value="result.webhookUrl"
                readonly
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    icon="i-lucide-copy"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    square
                    aria-label="Copy webhook URL"
                    @click="copyWebhookUrl"
                  />
                </template>
              </UInput>
            </UFormField>
            <UFormField
              label="Webhook signing secret"
              hint="Paste the whsec_… secret Resend shows when the webhook is created, so we can verify deliveries"
            >
              <UInput
                v-model="webhookSecret"
                type="password"
                placeholder="whsec_…"
                class="w-full"
              />
            </UFormField>
            <UButton
              size="md"
              block
              :loading="savingSecret"
              :disabled="!webhookSecret"
              @click="saveWebhookSecret"
            >
              Save secret
            </UButton>
            <p
              v-if="secretSaved"
              class="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="size-4"
              />
              Saved — webhook verification enabled
            </p>
          </div>

          <UButton
            size="lg"
            block
            @click="finish"
          >
            {{ result.mailbox.webhookConfigured ? 'Done — open my inbox' : 'Skip for now' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
