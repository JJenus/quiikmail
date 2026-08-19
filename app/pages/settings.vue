<script setup lang="ts">
import { authService } from '~/services/authService'
import { mailboxService } from '~/services/mailboxService'
import { apiErrorMessage } from '~/utils/apiError'
import { useMailStore } from '~/composables/useMailStore'

definePageMeta({ middleware: 'auth' })

const { state, init, reloadMailboxes, openSetup } = useMailStore()
const session = useUserSession()

// ── Account ────────────────────────────────────────────────────────────
const username = computed(() => session.user.value?.username ?? '')
const email = ref(session.user.value?.email ?? '')
const accountSaving = ref(false)
const accountSaved = ref(false)
const accountError = ref<string | null>(null)

async function saveAccount() {
  accountError.value = null
  accountSaved.value = false
  accountSaving.value = true
  try {
    const user = await authService.updateProfile({ email: email.value })
    await session.fetch()
    accountSaved.value = true
    email.value = user.email ?? ''
  } catch (e) {
    accountError.value = apiErrorMessage(e, 'Could not update the account')
  } finally {
    accountSaving.value = false
  }
}

// ── Password ───────────────────────────────────────────────────────────
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const passwordSaving = ref(false)
const passwordSaved = ref(false)
const passwordError = ref<string | null>(null)

const passwordValid = computed(() =>
  newPassword.value.length >= 8
  && confirmPassword.value === newPassword.value
  && currentPassword.value.length > 0
)

async function changePassword() {
  passwordError.value = null
  passwordSaved.value = false
  passwordSaving.value = true
  try {
    await authService.updateProfile({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordSaved.value = true
  } catch (e) {
    passwordError.value = apiErrorMessage(e, 'Could not change the password')
  } finally {
    passwordSaving.value = false
  }
}

// ── Mailbox ────────────────────────────────────────────────────────────
const selectedId = ref<string | null>(state.activeMailboxId ?? state.mailboxes[0]?.id ?? null)
const mailboxName = ref('')
const fromAddress = ref('')
const apiKey = ref('')
const smtpHost = ref('')
const smtpPort = ref(587)
const smtpSecure = ref(false)
const smtpUser = ref('')
const smtpPass = ref('')
const imapHost = ref('')
const imapPort = ref(993)
const imapSecure = ref(true)
const imapUser = ref('')
const imapPass = ref('')
const mailboxSaving = ref(false)
const mailboxSaved = ref(false)
const mailboxError = ref<string | null>(null)
const smtpTesting = ref(false)
const smtpTested = ref(false)

const newSenderEmail = ref('')
const senderSaving = ref(false)
const senderError = ref<string | null>(null)

const selectedMailbox = computed(() => state.mailboxes.find(m => m.id === selectedId.value) ?? null)
const isSmtp = computed(() => selectedMailbox.value?.provider === 'smtp')

watch(() => state.mailboxes, (boxes) => {
  if (!selectedId.value && boxes.length > 0) selectedId.value = boxes[0]!.id
})

watch(selectedMailbox, (mb) => {
  if (!mb) return
  mailboxName.value = mb.name
  fromAddress.value = mb.fromAddress ?? ''
  apiKey.value = ''
  smtpHost.value = ''
  smtpPort.value = 587
  smtpSecure.value = false
  smtpUser.value = ''
  smtpPass.value = ''
  imapHost.value = ''
  imapPort.value = 993
  imapSecure.value = true
  imapUser.value = ''
  imapPass.value = ''
  mailboxSaved.value = false
  smtpTested.value = false
})

async function saveMailbox() {
  const mb = selectedMailbox.value
  if (!mb) return
  mailboxError.value = null
  mailboxSaved.value = false
  mailboxSaving.value = true
  try {
    if (mb.provider === 'smtp') {
      await mailboxService.update(mb.id, {
        name: mailboxName.value,
        smtpHost: smtpHost.value,
        smtpPort: smtpPort.value,
        smtpSecure: smtpSecure.value,
        smtpUser: smtpUser.value,
        smtpPass: smtpPass.value,
        imapHost: imapHost.value || undefined,
        imapPort: imapHost.value ? imapPort.value : undefined,
        imapSecure: imapHost.value ? imapSecure.value : undefined,
        imapUser: imapHost.value ? imapUser.value : undefined,
        imapPass: imapHost.value ? imapPass.value : undefined
      })
    } else {
      await mailboxService.update(mb.id, {
        name: mailboxName.value,
        fromAddress: fromAddress.value || null,
        apiKey: apiKey.value || undefined
      })
      apiKey.value = ''
    }
    mailboxSaved.value = true
    await reloadMailboxes()
  } catch (e) {
    mailboxError.value = apiErrorMessage(e, 'Could not update the mailbox')
  } finally {
    mailboxSaving.value = false
  }
}

async function testSmtp() {
  smtpTesting.value = true
  smtpTested.value = false
  mailboxError.value = null
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
    mailboxError.value = apiErrorMessage(e, 'SMTP connection failed')
  } finally {
    smtpTesting.value = false
  }
}

async function addSender() {
  const mb = selectedMailbox.value
  if (!mb || !newSenderEmail.value.trim()) return
  senderError.value = null
  senderSaving.value = true
  try {
    await mailboxService.addSender(mb.id, { email: newSenderEmail.value.trim() })
    newSenderEmail.value = ''
    await reloadMailboxes()
  } catch (e) {
    senderError.value = apiErrorMessage(e, 'Could not add the sender')
  } finally {
    senderSaving.value = false
  }
}

async function setDefaultSender(senderId: string) {
  const mb = selectedMailbox.value
  if (!mb) return
  try {
    await mailboxService.updateSender(mb.id, senderId, { isDefault: true })
    await reloadMailboxes()
  } catch (e) {
    senderError.value = apiErrorMessage(e, 'Could not change the default sender')
  }
}

async function removeSender(senderId: string) {
  const mb = selectedMailbox.value
  if (!mb) return
  try {
    await mailboxService.removeSender(mb.id, senderId)
    await reloadMailboxes()
  } catch (e) {
    senderError.value = apiErrorMessage(e, 'Could not remove the sender')
  }
}

onMounted(() => {
  if (!state.initialized) init()
})
</script>

<template>
  <div class="min-h-dvh bg-page-bg dark:bg-page-bg-dark">
    <div class="mx-auto max-w-2xl flex flex-col gap-6 px-4 py-8">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          square
          aria-label="Back to inbox"
          @click="navigateTo('/')"
        />
        <div>
          <h1 class="text-xl font-bold text-highlighted">
            Settings
          </h1>
          <p class="text-sm text-muted">
            Account, password and mailbox details
          </p>
        </div>
      </div>

      <!-- Account -->
      <UCard :ui="{ body: 'p-6', root: 'rounded-2xl' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-user"
              class="size-4 text-primary"
            />
            <span class="font-semibold text-highlighted">Account</span>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <UAlert
            v-if="accountError"
            icon="i-lucide-circle-alert"
            color="error"
            variant="soft"
            :title="accountError"
          />
          <UAlert
            v-if="accountSaved"
            icon="i-lucide-circle-check"
            color="success"
            variant="soft"
            title="Account updated"
          />

          <UFormField label="Username">
            <UInput
              :model-value="username"
              readonly
              disabled
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Recovery email (optional)"
            hint="Used only to recover your account - independent of any mailbox 'send from' address"
          >
            <UInput
              v-model="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              class="w-full"
            />
          </UFormField>

          <UButton
            :loading="accountSaving"
            @click="saveAccount"
          >
            Save account
          </UButton>
        </div>
      </UCard>

      <!-- Password -->
      <UCard :ui="{ body: 'p-6', root: 'rounded-2xl' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-lock"
              class="size-4 text-primary"
            />
            <span class="font-semibold text-highlighted">Change password</span>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <UAlert
            v-if="passwordError"
            icon="i-lucide-circle-alert"
            color="error"
            variant="soft"
            :title="passwordError"
          />
          <UAlert
            v-if="passwordSaved"
            icon="i-lucide-circle-check"
            color="success"
            variant="soft"
            title="Password changed"
          />

          <UFormField label="Current password">
            <UInput
              v-model="currentPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  square
                  :aria-label="showPassword ? 'Hide passwords' : 'Show passwords'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="New password"
            hint="At least 8 characters"
          >
            <UInput
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Confirm new password">
            <UInput
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              class="w-full"
            />
          </UFormField>

          <p
            v-if="confirmPassword && confirmPassword !== newPassword"
            class="text-sm text-error"
          >
            Passwords do not match
          </p>

          <UButton
            :loading="passwordSaving"
            :disabled="!passwordValid"
            @click="changePassword"
          >
            Change password
          </UButton>
        </div>
      </UCard>

      <!-- Mailboxes -->
      <UCard :ui="{ body: 'p-6', root: 'rounded-2xl' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-inbox"
              class="size-4 text-primary"
            />
            <span class="font-semibold text-highlighted">Mailboxes</span>
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <UAlert
            v-if="mailboxError"
            icon="i-lucide-circle-alert"
            color="error"
            variant="soft"
            :title="mailboxError"
          />
          <UAlert
            v-if="mailboxSaved"
            icon="i-lucide-circle-check"
            color="success"
            variant="soft"
            title="Mailbox updated"
          />

          <UFormField
            v-if="state.mailboxes.length > 0"
            label="Mailbox"
          >
            <USelect
              :model-value="selectedId ?? undefined"
              :items="state.mailboxes.map(m => ({ label: `${m.name} (${m.provider})`, value: m.id }))"
              class="w-full"
              @update:model-value="selectedId = $event ?? null"
            />
          </UFormField>

          <div
            v-if="!selectedMailbox"
            class="flex flex-col items-center gap-3 rounded-xl bg-default p-8 text-center"
          >
            <UIcon
              name="i-lucide-inbox"
              class="size-8 text-dimmed"
            />
            <p class="text-sm text-muted">
              No mailbox connected yet
            </p>
            <UButton
              size="sm"
              @click="openSetup"
            >
              Connect a mailbox
            </UButton>
          </div>

          <template v-else>
            <UFormField label="Name">
              <UInput
                v-model="mailboxName"
                class="w-full"
              />
            </UFormField>

            <!-- Resend fields -->
            <template v-if="!isSmtp">
              <UFormField
                label="Send from address"
                hint="A verified sender on your Resend domain - separate from your account email"
              >
                <UInput
                  v-model="fromAddress"
                  type="email"
                  placeholder="you@yourdomain.com"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Resend API key"
                hint="Leave empty to keep the current key"
              >
                <UInput
                  v-model="apiKey"
                  type="password"
                  placeholder="re_…"
                  class="w-full"
                />
              </UFormField>

              <div class="flex items-center gap-2 text-sm text-muted">
                <UIcon
                  :name="selectedMailbox.webhookConfigured ? 'i-lucide-webhook' : 'i-lucide-alert-circle'"
                  class="size-4"
                  :class="selectedMailbox.webhookConfigured ? 'text-emerald-500' : 'text-warning'"
                />
                <span>
                  {{ selectedMailbox.webhookConfigured ? 'Webhook enabled - email arrives in near real-time' : 'No webhook - email only arrives via manual sync' }}
                </span>
              </div>
            </template>

            <!-- SMTP fields -->
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
                <UFormField
                  label="Username"
                  hint="Leave empty to keep the current credentials"
                >
                  <UInput
                    v-model="smtpUser"
                    placeholder="you@example.com"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Password"
                  hint="Leave empty to keep the current credentials"
                >
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
                  <span class="text-xs font-normal text-dimmed"> - optional</span>
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
                <UFormField
                  label="Username"
                  hint="Leave empty to keep the current credentials"
                >
                  <UInput
                    v-model="imapUser"
                    placeholder="you@example.com"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Password"
                  hint="Leave empty to keep the current credentials"
                >
                  <UInput
                    v-model="imapPass"
                    type="password"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </template>

            <!-- Senders -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-highlighted">
                  Senders
                </span>
                <span
                  v-if="selectedMailbox.domain"
                  class="text-xs text-dimmed"
                >
                  domain: {{ selectedMailbox.domain }}
                </span>
              </div>
              <UAlert
                v-if="senderError"
                icon="i-lucide-circle-alert"
                color="error"
                variant="soft"
                :title="senderError"
              />
              <div
                v-for="sender in selectedMailbox.senders"
                :key="sender.id"
                class="flex items-center gap-2 rounded-lg border border-default px-3 py-2"
              >
                <span class="flex-1 min-w-0 truncate text-sm text-default">
                  {{ sender.email }}
                </span>
                <UBadge
                  v-if="sender.isDefault"
                  color="primary"
                  variant="soft"
                  size="sm"
                >
                  default
                </UBadge>
                <UButton
                  v-else
                  icon="i-lucide-star"
                  label="Set default"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="setDefaultSender(sender.id)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  :disabled="selectedMailbox.senders.length === 1"
                  aria-label="Remove sender"
                  @click="removeSender(sender.id)"
                />
              </div>
              <div class="flex items-center gap-2">
                <UInput
                  v-model="newSenderEmail"
                  type="email"
                  placeholder="sender@yourdomain.com"
                  class="flex-1"
                  @keyup.enter="addSender"
                />
                <UButton
                  icon="i-lucide-plus"
                  :loading="senderSaving"
                  :disabled="!newSenderEmail.trim()"
                  @click="addSender"
                >
                  Add
                </UButton>
              </div>
            </div>

            <UButton
              :loading="mailboxSaving"
              @click="saveMailbox"
            >
              Save mailbox
            </UButton>
          </template>
        </div>
      </UCard>
    </div>
  </div>
</template>
