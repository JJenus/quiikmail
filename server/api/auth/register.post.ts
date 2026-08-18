import { resolve, Tokens } from '../../core/container'
import { created, readValidatedBody } from '../../core/http'
import { registerSchema } from '../../modules/auth/auth.schemas'
import type { AuthService } from '../../modules/auth/auth.service'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema)
  const service = resolve<AuthService>(Tokens.AuthService)
  return created(event, await service.register(event, body))
})
