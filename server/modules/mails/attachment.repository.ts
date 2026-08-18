import { eq, inArray } from 'drizzle-orm'
import { getDatabase } from '../../core/database'
import { attachments, type MailAttachmentRow } from '../../schemas/attachments'

export class AttachmentRepository {
  constructor(private readonly db = getDatabase()) {}

  listByMailIds(mailIds: string[]): Promise<MailAttachmentRow[]> {
    return this.db.query.attachments.findMany({
      where: inArray(attachments.mailId, mailIds)
    })
  }

  findById(id: string): Promise<MailAttachmentRow | undefined> {
    return this.db.query.attachments.findFirst({
      where: eq(attachments.id, id)
    })
  }

  async updateUrl(id: string, downloadUrl: string, expiresAt: Date | null): Promise<MailAttachmentRow> {
    const [row] = await this.db
      .update(attachments)
      .set({ downloadUrl, expiresAt })
      .where(eq(attachments.id, id))
      .returning()
    return row!
  }
}
