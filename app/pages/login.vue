<script setup lang="ts">
import { authService } from '~/services/authService'
import { apiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: 'guest' })

const session = useUserSession()
const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function submit() {
  error.value = null
  loading.value = true
  try {
    await authService.login({ username: username.value, password: password.value })
    await session.fetch()
    await navigateTo('/')
  } catch (e) {
    error.value = apiErrorMessage(e, 'Invalid username or password')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-dvh bg-page-bg dark:bg-page-bg-dark flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center gap-3 mb-6">
        <div class="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <UIcon
            name="i-lucide-mail"
            class="size-6 text-inverted"
          />
        </div>
        <h1 class="text-2xl font-bold text-highlighted">
          Welcome back
        </h1>
        <p class="text-sm text-muted">
          Sign in to QuiikMail
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
          <UFormField label="Username">
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
          <UFormField label="Password">
            <UInput
              v-model="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              size="lg"
              class="w-full"
              required
            />
          </UFormField>
          <UButton
            type="submit"
            size="lg"
            block
            :loading="loading"
            :disabled="!username || !password"
          >
            Sign in
          </UButton>
        </form>
      </UCard>

      <p class="text-center text-sm text-muted mt-6">
        No account yet?
        <NuxtLink
          to="/register"
          class="text-primary font-semibold hover:underline"
        >Create one</NuxtLink>
      </p>
    </div>
  </div>
</template>
