import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { getDatabase } from '../../core/database'
import { mailboxes, type Mailbox, type NewMailbox } from '../../schemas/mailboxes'
import { mailboxSenders, type MailboxSender, type NewMailboxSender } from '../../schemas/mailbox-senders'

export class MailboxRepository {
  constructor(private readonly db = getDatabase()) {}

  listByUser(userId: string): Promise<Mailbox[]> {
    return this.db.query.mailboxes.findMany({
      where: eq(mailboxes.userId, userId),
      orderBy: (mb, { asc }) => [asc(mb.createdAt)]
    })
  }

  findByIdForUser(id: string, userId: string): Promise<Mailbox | undefined> {
    return this.db.query.mailboxes.findFirst({
      where: and(eq(mailboxes.id, id), eq(mailboxes.userId, userId))
    })
  }

  findById(id: string): Promise<Mailbox | undefined> {
    return this.db.query.mailboxes.findFirst({
      where: eq(mailboxes.id, id)
    })
  }

  async listAll(): Promise<Mailbox[]> {
    return this.db.query.mailboxes.findMany()
  }

  async create(input: NewMailbox): Promise<Mailbox> {
    const [row] = await this.db.insert(mailboxes).values(input).returning()
    return row!
  }

  async update(id: string, values: Partial<Omit<NewMailbox, 'id' | 'userId'>>): Promise<Mailbox | undefined> {
    const [row] = await this.db.update(mailboxes).set(values).where(eq(mailboxes.id, id)).returning()
    return row
  }

  async updateLastSynced(id: string): Promise<void> {
    await this.db
      .update(mailboxes)
      .set({ lastSyncedAt: new Date() })
      .where(eq(mailboxes.id, id))
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(mailboxes).where(eq(mailboxes.id, id))
  }

  listSenders(mailboxId: string): Promise<MailboxSender[]> {
    return this.db.query.mailboxSenders.findMany({
      where: eq(mailboxSenders.mailboxId, mailboxId),
      orderBy: [desc(mailboxSenders.isDefault), asc(mailboxSenders.email)]
    })
  }

  listSendersForMailboxes(mailboxIds: string[]): Promise<MailboxSender[]> {
    if (mailboxIds.length === 0) return Promise.resolve([])
    return this.db.query.mailboxSenders.findMany({
      where: inArray(mailboxSenders.mailboxId, mailboxIds)
    })
  }

  findSenderById(id: string, mailboxId: string): Promise<MailboxSender | undefined> {
    return this.db.query.mailboxSenders.findFirst({
      where: and(eq(mailboxSenders.id, id), eq(mailboxSenders.mailboxId, mailboxId))
    })
  }

  async createSender(input: NewMailboxSender): Promise<MailboxSender> {
    const [row] = await this.db.insert(mailboxSenders).values(input).returning()
    return row!
  }

  async updateSender(
    id: string,
    values: Partial<Omit<NewMailboxSender, 'id' | 'mailboxId'>>
  ): Promise<MailboxSender | undefined> {
    const [row] = await this.db.update(mailboxSenders).set(values).where(eq(mailboxSenders.id, id)).returning()
    return row
  }

  async removeSender(id: string, mailboxId: string): Promise<void> {
    await this.db.delete(mailboxSenders).where(and(eq(mailboxSenders.id, id), eq(mailboxSenders.mailboxId, mailboxId)))
  }

  /** Clears the default flag for the mailbox, then marks the given sender as default. */
  async setDefaultSender(mailboxId: string, senderId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.update(mailboxSenders).set({ isDefault: false }).where(eq(mailboxSenders.mailboxId, mailboxId))
      await tx
        .update(mailboxSenders)
        .set({ isDefault: true })
        .where(and(eq(mailboxSenders.id, senderId), eq(mailboxSenders.mailboxId, mailboxId)))
    })
  }
}
