import { eq } from 'drizzle-orm'
import { getDatabase } from '../../core/database'
import { users, type NewUser, type User } from '../../schemas/users'

export class AuthRepository {
  constructor(private readonly db = getDatabase()) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(users.username, username)
    })
  }

  async findById(id: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(users.id, id)
    })
  }

  async create(input: NewUser): Promise<User> {
    const [row] = await this.db.insert(users).values(input).returning()
    return row!
  }
}
