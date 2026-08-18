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
const mailboxSaving = ref(false)
const mailboxSaved = ref(false)
const mailboxError = ref<string | null>(null)

const selectedMailbox = computed(() => state.mailboxes.find(m => m.id === selectedId.value) ?? null)

watch(() => state.mailboxes, (boxes) => {
  if (!selectedId.value && boxes.length > 0) selectedId.value = boxes[0]!.id
})

watch(selectedMailbox, (mb) => {
  if (!mb) return
  mailboxName.value = mb.name
  fromAddress.value = mb.fromAddress ?? ''
  apiKey.value = ''
  mailboxSaved.value = false
})

async function saveMailbox() {
  const mb = selectedMailbox.value
  if (!mb) return
  mailboxError.value = null
  mailboxSaved.value = false
  mailboxSaving.value = true
  try {
    await mailboxService.update(mb.id, {
      name: mailboxName.value,
      fromAddress: fromAddress.value || null,
      apiKey: apiKey.value || undefined
    })
    apiKey.value = ''
    mailboxSaved.value = true
    await reloadMailboxes()
  } catch (e) {
    mailboxError.value = apiErrorMessage(e, 'Could not update the mailbox')
  } finally {
    mailboxSaving.value = false
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
            hint="Used only to recover your account — independent of any mailbox 'send from' address"
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
              :items="state.mailboxes.map(m => ({ label: m.name, value: m.id }))"
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

            <UFormField
              label="Send from address"
              hint="A verified sender on your Resend domain — separate from your account email"
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
                {{ selectedMailbox.webhookConfigured ? 'Webhook enabled — email arrives in near real-time' : 'No webhook — email only arrives via manual sync' }}
              </span>
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
