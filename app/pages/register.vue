<script setup lang="ts">
import { authService } from '~/services/authService'
import { apiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: 'guest' })

const session = useUserSession()
const username = ref('')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const showPassword = ref(false)

async function submit() {
  error.value = null
  loading.value = true
  try {
    await authService.register({
      username: username.value,
      email: email.value || undefined,
      password: password.value
    })
    await session.fetch()
    await navigateTo('/')
  } catch (e) {
    error.value = apiErrorMessage(e, 'Could not create the account')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-dvh bg-page-bg dark:bg-page-bg-dark flex items-center justify-center p-4"
  >
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center gap-3 mb-6">
        <div
          class="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <UIcon
            name="i-lucide-mail"
            class="size-6 text-inverted"
          />
        </div>
        <h1 class="text-2xl font-bold text-highlighted">
          Create your account
        </h1>
        <p class="text-sm text-muted">
          A username is all you need
        </p>
      </div>

      <UCard :ui="{ body: 'p-6', root: 'rounded-2xl' }">
        <UAlert
          v-if="error"
          icon="i-lucide-circle-alert"
          color="error"
          variant="soft"
          :title="error"
          class="mb-4"
        />
        <form
          class="flex flex-col gap-4"
          @submit.prevent="submit"
        >
          <UFormField
            label="Username"
            hint="3–32 characters, letters/numbers/._-"
          >
            <UInput
              v-model="username"
              name="username"
              placeholder="your_username"
              autocomplete="username"
              size="lg"
              class="w-full"
              required
            />
          </UFormField>
          <UFormField
            label="Recovery email (optional)"
            hint="Used only to recover your account - never shown to recipients, and independent of any mailbox 'send from' address"
          >
            <UInput
              v-model="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              size="lg"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Password"
            hint="At least 8 characters"
          >
            <UInput
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="new-password"
              size="lg"
              class="w-full"
              required
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  square
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>
          <UButton
            type="submit"
            size="lg"
            block
            :loading="loading"
            :disabled="!username || password.length < 8"
          >
            Create account
          </UButton>
        </form>
      </UCard>

      <p class="text-center text-sm text-muted mt-6">
        Already have an account?
        <NuxtLink
          to="/login"
          class="text-primary font-semibold hover:underline"
        >Sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>
