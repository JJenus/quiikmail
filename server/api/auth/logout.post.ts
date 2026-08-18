import { resolve, Tokens } from '../../core/container'
import { noContent } from '../../core/http'
import type { AuthService } from '../../modules/auth/auth.service'

export default defineEventHandler(async (event) => {
  const service = resolve<AuthService>(Tokens.AuthService)
  await service.logout(event)
  return noContent(event)
})
