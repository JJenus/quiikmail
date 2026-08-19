import { boolean, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { mailboxes } from './mailboxes'

export const mailboxSenders = pgTable('mailbox_senders', {
  id: text('id').primaryKey(),
  mailboxId: text('mailbox_id').notNull().references(() => mailboxes.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
  uniqueIndex('mailbox_senders_mailbox_email_idx').on(table.mailboxId, table.email)
])

export type MailboxSender = typeof mailboxSenders.$inferSelect
export type NewMailboxSender = typeof mailboxSenders.$inferInsert
