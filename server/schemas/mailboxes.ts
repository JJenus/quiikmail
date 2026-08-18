import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const mailboxes = pgTable('mailboxes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  provider: text('provider').notNull().default('resend'),
  apiKeyEnc: text('api_key_enc').notNull(),
  fromAddress: text('from_address'),
  domain: text('domain'),
  inboundAddress: text('inbound_address'),
  resendWebhookId: text('resend_webhook_id'),
  webhookSecretEnc: text('webhook_secret_enc'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type Mailbox = typeof mailboxes.$inferSelect
export type NewMailbox = typeof mailboxes.$inferInsert
