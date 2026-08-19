import { customType, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { mails } from './mails'

const bytea = customType<{ data: Buffer, driverData: Buffer }>({
  dataType() {
    return 'bytea'
  }
})

export const attachments = pgTable('attachments', {
  id: text('id').primaryKey(),
  mailId: text('mail_id').notNull().references(() => mails.id, { onDelete: 'cascade' }),
  resendAttachmentId: text('resend_attachment_id'),
  filename: text('filename').notNull(),
  size: integer('size').notNull().default(0),
  contentType: text('content_type'),
  disposition: text('disposition'),
  downloadUrl: text('download_url'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  data: bytea('data'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export type MailAttachmentRow = typeof attachments.$inferSelect
export type NewAttachment = typeof attachments.$inferInsert
