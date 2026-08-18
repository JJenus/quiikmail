import { resolve, Tokens } from '../../core/container'
import { ok, readValidatedBody } from '../../core/http'
import { loginSchema } from '../../modules/auth/auth.schemas'
import type { AuthService } from '../../modules/auth/auth.service'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema)
  const service = resolve<AuthService>(Tokens.AuthService)
  return ok(event, await service.login(event, body))
})
