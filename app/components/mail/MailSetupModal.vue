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
const provider = ref<'resend' | 'smtp'>('resend')

// Resend branch
const apiKey = ref('')
const keyValid = ref(false)
const keyLive = ref(true)
const domains = ref<{ name: string, status: string }[]>([])
const selectedDomain = ref('')

// SMTP branch
const smtpHost = ref('')
const smtpPort = ref(587)
const smtpSecure = ref(false)
const smtpUser = ref('')
const smtpPass = ref('')
const smtpTesting = ref(false)
const smtpTested = ref(false)
const imapHost = ref('')
const imapPort = ref(993)
const imapSecure = ref(true)
const imapUser = ref('')
const imapPass = ref('')

// Senders (both providers)
const senders = ref([''])
const autoWebhook = ref(true)

const result = ref<CreateMailboxResult | null>(null)
const webhookSecret = ref('')
const savingSecret = ref(false)
const secretSaved = ref(false)

const hasMailboxes = computed(() => state.mailboxes.length > 0)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validSenders = computed(() => senders.value.map(s => s.trim()).filter(s => emailPattern.test(s)))

const canSubmit = computed(() => {
  if (!name.value.trim()) return false
  if (provider.value === 'resend') {
    return keyValid.value && apiKey.value.trim().length > 0
  }
  return smtpHost.value.trim().length > 0 && smtpPort.value > 0 && smtpUser.value.trim().length > 0 && smtpPass.value.length > 0
})

watch(
  () => state.setupOpen,
  (open) => {
    if (open) {
      step.value = 1
      error.value = null
      result.value = null
      keyValid.value = false
      keyLive.value = true
      domains.value = []
      selectedDomain.value = ''
      smtpTested.value = false
    }
  }
)

function addSenderRow() {
  senders.value = [...senders.value, '']
}

function removeSenderRow(index: number) {
  senders.value = senders.value.filter((_, i) => i !== index)
}

async function validateKey() {
  if (!apiKey.value) return
  validating.value = true
  error.value = null
  try {
    const res = await mailboxService.validateApiKey(apiKey.value)
    keyValid.value = res.valid
    keyLive.value = res.live
    domains.value = res.domains
    if (res.domains.length > 0 && !selectedDomain.value) {
      const verified = res.domains.find(d => d.status === 'verified')
      selectedDomain.value = verified?.name ?? ''
    }
  } catch (e) {
    error.value = apiErrorMessage(
      e,
      'This Resend API key could not be validated'
    )
    keyValid.value = false
  } finally {
    validating.value = false
  }
}

async function testSmtp() {
  smtpTesting.value = true
  smtpTested.value = false
  error.value = null
  try {
    await mailboxService.testSmtp({
      host: smtpHost.value,
      port: smtpPort.value,
      secure: smtpSecure.value,
      user: smtpUser.value,
      pass: smtpPass.value
    })
    smtpTested.value = true
  } catch (e) {
    error.value = apiErrorMessage(e, 'SMTP connection failed')
  } finally {
    smtpTesting.value = false
  }
}

async function createMailbox() {
  if (provider.value === 'resend' && !keyValid.value) await validateKey()
  if (!canSubmit.value) return
  creating.value = true
  error.value = null
  try {
    const smtp = provider.value === 'smtp'
    result.value = await mailboxService.create({
      name: name.value.trim(),
      provider: provider.value,
      apiKey: smtp ? undefined : apiKey.value.trim(),
      domain: smtp ? undefined : (selectedDomain.value || undefined),
      senders: validSenders.value,
      autoWebhook: smtp ? false : autoWebhook.value,
      smtpHost: smtp ? smtpHost.value.trim() : undefined,
      smtpPort: smtp ? smtpPort.value : undefined,
      smtpSecure: smtp ? smtpSecure.value : undefined,
      smtpUser: smtp ? smtpUser.value.trim() : undefined,
      smtpPass: smtp ? smtpPass.value : undefined,
      imapHost: smtp && imapHost.value.trim() ? imapHost.value.trim() : undefined,
      imapPort: smtp && imapHost.value.trim() ? imapPort.value : undefined,
      imapSecure: smtp && imapHost.value.trim() ? imapSecure.value : undefined,
      imapUser: smtp && imapHost.value.trim() ? imapUser.value.trim() : undefined,
      imapPass: smtp && imapHost.value.trim() ? imapPass.value : undefined
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
    await mailboxService.update(result.value.mailbox.id, {
      webhookSecret: webhookSecret.value
    })
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
    scrollable
    :open="state.setupOpen"
    :dismissible="hasMailboxes"
    :overlay="true"
    @update:open="
      (open) => {
        if (!open) closeSetup();
      }
    "
  >
    <template #content>
      <div class="flex flex-col gap-5 p-2 sm:p-4">
        <div class="flex flex-col items-center gap-2 text-center">
          <div
            class="size-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <UIcon
              name="i-lucide-mail"
              class="size-5 text-inverted"
            />
          </div>
          <h2 class="text-lg font-bold text-highlighted">
            Connect a mailbox
          </h2>
          <p class="text-sm text-muted">
            Receive and send email via Resend or any SMTP provider
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
          <div class="space-y-2">
            <p class="text-sm font-semibold text-default">
              Connection type
            </p>
            <div
              class="grid grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Connection type"
            >
              <div
                role="radio"
                :aria-checked="provider === 'resend'"
                tabindex="0"
                class="relative flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                :class="provider === 'resend' ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/20' : 'border-default bg-default hover:bg-elevated'"
                @click="provider = 'resend'"
                @keydown.enter.prevent="provider = 'resend'"
                @keydown.space.prevent="provider = 'resend'"
              >
                <UIcon
                  name="i-lucide-zap"
                  class="size-5"
                  :class="provider === 'resend' ? 'text-primary' : 'text-dimmed'"
                />
                <span class="text-sm font-semibold text-default">Resend API</span>
                <span class="text-xs text-dimmed leading-snug">Use a Resend API key - webhook receiving included</span>
                <UIcon
                  v-if="provider === 'resend'"
                  name="i-lucide-circle-check"
                  class="absolute top-2.5 right-2.5 size-4 text-primary"
                />
              </div>
              <div
                role="radio"
                :aria-checked="provider === 'smtp'"
                tabindex="0"
                class="relative flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                :class="provider === 'smtp' ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/20' : 'border-default bg-default hover:bg-elevated'"
                @click="provider = 'smtp'"
                @keydown.enter.prevent="provider = 'smtp'"
                @keydown.space.prevent="provider = 'smtp'"
              >
                <UIcon
                  name="i-lucide-server"
                  class="size-5"
                  :class="provider === 'smtp' ? 'text-primary' : 'text-dimmed'"
                />
                <span class="text-sm font-semibold text-default">SMTP / IMAP</span>
                <span class="text-xs text-dimmed leading-snug">Connect your own mail server - IMAP polling optional</span>
                <UIcon
                  v-if="provider === 'smtp'"
                  name="i-lucide-circle-check"
                  class="absolute top-2.5 right-2.5 size-4 text-primary"
                />
              </div>
            </div>
          </div>

          <UFormField label="Mailbox name">
            <UInput
              v-model="name"
              name="name"
              placeholder="Work, Personal, …"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Resend branch -->
          <template v-if="provider === 'resend'">
            <UFormField
              label="Resend API key"
              hint="Create one at resend.com/api-keys - needs read access to inbound email"
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
                Key is valid, but it's a test key - production sending may be
                disabled
              </div>
            </UFormField>

            <UFormField
              v-if="domains.length > 0"
              label="Verified domain"
              hint="Only addresses on this domain can be used as senders"
            >
              <USelectMenu
                v-model="selectedDomain"
                :items="domains.map(d => ({
                  label: d.status === 'verified' ? `${d.name} (verified)` : `${d.name} (${d.status})`,
                  value: d.name,
                  disabled: d.status !== 'verified'
                }))"
                value-key="value"
                size="lg"
                placeholder="Select a domain…"
                class="w-full"
              />
            </UFormField>
          </template>

          <!-- SMTP branch -->
          <template v-else>
            <div class="flex flex-col gap-4 rounded-xl bg-default p-4">
              <p class="text-sm font-semibold text-highlighted">
                Outgoing (SMTP)
              </p>
              <UFormField label="Host">
                <UInput
                  v-model="smtpHost"
                  placeholder="smtp.example.com"
                  class="w-full"
                />
              </UFormField>
              <div class="flex gap-3">
                <UFormField
                  label="Port"
                  class="w-28"
                >
                  <UInput
                    v-model.number="smtpPort"
                    type="number"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Encryption"
                  class="flex-1"
                >
                  <USelect
                    v-model="smtpSecure"
                    :items="[
                      { label: 'TLS (port 587)', value: false },
                      { label: 'SSL (port 465)', value: true }
                    ]"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <UFormField label="Username">
                <UInput
                  v-model="smtpUser"
                  placeholder="you@example.com"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Password">
                <UInput
                  v-model="smtpPass"
                  type="password"
                  class="w-full"
                />
              </UFormField>
              <UButton
                variant="outline"
                :loading="smtpTesting"
                @click="testSmtp"
              >
                Test connection
              </UButton>
              <p
                v-if="smtpTested"
                class="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
              >
                <UIcon
                  name="i-lucide-circle-check"
                  class="size-4"
                />
                Connection works
              </p>
            </div>

            <div class="flex flex-col gap-4 rounded-xl bg-default p-4">
              <p class="text-sm font-semibold text-highlighted">
                Incoming (IMAP)
                <span class="text-xs font-normal text-dimmed"> - optional, enables polling</span>
              </p>
              <UFormField label="Host">
                <UInput
                  v-model="imapHost"
                  placeholder="imap.example.com"
                  class="w-full"
                />
              </UFormField>
              <div class="flex gap-3">
                <UFormField
                  label="Port"
                  class="w-28"
                >
                  <UInput
                    v-model.number="imapPort"
                    type="number"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Encryption"
                  class="flex-1"
                >
                  <USelect
                    v-model="imapSecure"
                    :items="[
                      { label: 'SSL (port 993)', value: true },
                      { label: 'No encryption', value: false }
                    ]"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <UFormField label="Username">
                <UInput
                  v-model="imapUser"
                  placeholder="you@example.com"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Password">
                <UInput
                  v-model="imapPass"
                  type="password"
                  class="w-full"
                />
              </UFormField>
            </div>
          </template>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-highlighted">
                Senders
              </span>
              <UButton
                icon="i-lucide-plus"
                label="Add"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="addSenderRow"
              />
            </div>
            <div
              v-for="(sender, index) in senders"
              :key="index"
              class="flex items-center gap-2"
            >
              <UInput
                v-model="senders[index]"
                type="email"
                :placeholder="provider === 'resend' ? 'you@yourdomain.com' : 'you@example.com'"
                class="flex-1"
              />
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                square
                :disabled="senders.length === 1"
                aria-label="Remove sender"
                @click="removeSenderRow(index)"
              />
            </div>
            <p class="text-xs text-dimmed">
              Addresses you can send from - shown in the compose From
              dropdown. {{ provider === 'resend' ? 'Must match the verified domain above.' : '' }}
            </p>
          </div>

          <UCheckbox
            v-if="provider === 'resend'"
            v-model="autoWebhook"
            label="Auto-create the inbound webhook (recommended)"
          />

          <UButton
            size="lg"
            block
            :loading="creating"
            :disabled="!canSubmit"
            @click="createMailbox"
          >
            Connect mailbox
          </UButton>
        </div>

        <!-- Step 2: result -->
        <div
          v-else-if="result"
          class="flex flex-col gap-4"
        >
          <div class="flex items-start gap-3 rounded-xl bg-primary/10 p-4">
            <UIcon
              :name="
                result.webhookAutoConfigured
                  ? 'i-lucide-circle-check'
                  : 'i-lucide-settings-2'
              "
              class="size-5 text-primary shrink-0 mt-0.5"
            />
            <div class="text-sm text-muted">
              <p class="font-semibold text-highlighted">
                Mailbox "{{ result.mailbox.name }}" is connected
              </p>
              <p
                v-if="result.mailbox.provider === 'smtp'"
                class="mt-1"
              >
                {{
                  result.mailbox.senders.length > 0
                    ? 'New email arrives via periodic IMAP polling - use "Sync now" in the toolbar or wait for the next poll.'
                    : 'Add sender addresses in Settings to start sending.'
                }}
              </p>
              <p
                v-else-if="result.webhookAutoConfigured"
                class="mt-1"
              >
                The inbound webhook was created automatically - new email
                arrives in near real-time.
              </p>
              <p
                v-else
                class="mt-1"
              >
                Auto-configuration was skipped. Create a webhook in Resend
                pointing at this URL:
              </p>
            </div>
          </div>

          <div
            v-if="result.mailbox.provider === 'resend' && !result.webhookAutoConfigured"
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
              Saved - webhook verification enabled
            </p>
          </div>

          <UButton
            size="lg"
            block
            @click="finish"
          >
            {{
              result.mailbox.provider === 'smtp'
                ? 'Done - open my inbox'
                : (result.mailbox.webhookConfigured
                  ? 'Done - open my inbox'
                  : 'Skip for now')
            }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
