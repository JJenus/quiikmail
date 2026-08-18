import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { appError } from '../../core/errors'
import type { AuthUser } from '../../core/session'
import type { LoginInput, RegisterInput, UpdateProfileInput } from './auth.schemas'
import type { AuthRepository } from './auth.repository'
import type { User } from '../../schemas/users'

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email
  }
}

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(event: H3Event, input: RegisterInput): Promise<{ user: AuthUser }> {
    const username = input.username.toLowerCase()
    const email = input.email?.trim() || null

    const existing = await this.repo.findByUsername(username)
    if (existing) throw appError(409, 'USERNAME_TAKEN', 'This username is already taken')

    const user = await this.repo.create({
      id: randomUUID(),
      username,
      email,
      passwordHash: await hashPassword(input.password)
    })

    await setUserSession(event, { user: toAuthUser(user) })
    return { user: toAuthUser(user) }
  }

  async login(event: H3Event, input: LoginInput): Promise<{ user: AuthUser }> {
    const user = await this.repo.findByUsername(input.username.toLowerCase())
    if (!user) throw appError(401, 'INVALID_CREDENTIALS', 'Invalid username or password')

    const valid = await verifyPassword(user.passwordHash, input.password)
    if (!valid) throw appError(401, 'INVALID_CREDENTIALS', 'Invalid username or password')

    await setUserSession(event, { user: toAuthUser(user) })
    return { user: toAuthUser(user) }
  }

  async logout(event: H3Event): Promise<void> {
    await clearUserSession(event)
  }

  async updateProfile(event: H3Event, input: UpdateProfileInput): Promise<{ user: AuthUser }> {
    const session = await requireUserSession(event)
    const current = await this.repo.findById(session.user.id)
    if (!current) throw appError(404, 'NOT_FOUND', 'User not found')

    const values: Partial<Pick<User, 'email' | 'passwordHash'>> = {}
    if (input.email !== undefined) values.email = input.email || null

    if (input.newPassword !== undefined) {
      if (!input.currentPassword) throw appError(400, 'CURRENT_PASSWORD_REQUIRED', 'Current password is required')
      const valid = await verifyPassword(current.passwordHash, input.currentPassword)
      if (!valid) throw appError(400, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect')
      values.passwordHash = await hashPassword(input.newPassword)
    }

    if (Object.keys(values).length === 0) {
      throw appError(400, 'NOTHING_TO_UPDATE', 'Nothing to update')
    }

    const updated = await this.repo.update(current.id, values)
    if (!updated) throw appError(404, 'NOT_FOUND', 'User not found')

    const user = toAuthUser(updated)
    await setUserSession(event, { user })
    return { user }
  }
}
