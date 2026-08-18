import { boolean, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { mailboxes } from './mailboxes'

export const mails = pgTable('mails', {
  id: text('id').primaryKey(),
  mailboxId: text('mailbox_id').notNull().references(() => mailboxes.id, { onDelete: 'cascade' }),
  resendEmailId: text('resend_email_id').notNull(),
  fromName: text('from_name'),
  fromEmail: text('from_email').notNull(),
  to: jsonb('to').notNull().$type<Array<{ name: string | null, email: string }>>().default([]),
  cc: jsonb('cc').$type<Array<{ name: string | null, email: string }>>().default([]),
  bcc: jsonb('bcc').$type<Array<{ name: string | null, email: string }>>().default([]),
  subject: text('subject').notNull().default(''),
  bodyText: text('body_text'),
  bodyHtml: text('body_html'),
  preview: text('preview'),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
  messageId: text('message_id'),
  folder: text('folder').notNull().default('inbox'),
  read: boolean('read').notNull().default(false),
  starred: boolean('starred').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
  uniqueIndex('mails_mailbox_resend_idx').on(table.mailboxId, table.resendEmailId)
])

export type Mail = typeof mails.$inferSelect
export type NewMail = typeof mails.$inferInsert
