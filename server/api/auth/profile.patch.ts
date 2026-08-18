import { resolve, Tokens } from '../../core/container'
import { ok, readValidatedBody } from '../../core/http'
import { requireAuth } from '../../core/session'
import { updateProfileSchema } from '../../modules/auth/auth.schemas'
import type { AuthService } from '../../modules/auth/auth.service'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readValidatedBody(event, updateProfileSchema)

  const authService = resolve<AuthService>(Tokens.AuthService)
  return ok(event, await authService.updateProfile(event, body))
})
