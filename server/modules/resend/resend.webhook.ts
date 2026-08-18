import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Svix-style webhook signature verification (used by Resend).
 * Headers: svix-id, svix-timestamp, svix-signature (space-separated "v1,<base64>" entries).
 * Constant-time compare + 5 minute timestamp window to prevent replay.
 */
export function verifyWebhookSignature(
  rawBody: string,
  headers: Record<string, string | undefined>,
  secret: string
): boolean {
  const id = headers['svix-id']
  const timestamp = headers['svix-timestamp']
  const signatureHeader = headers['svix-signature']
  if (!id || !timestamp || !signatureHeader) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false

  const signedContent = `${id}.${timestamp}.${rawBody}`
  const expected = createHmac('sha256', secret).update(signedContent).digest('base64')

  const provided = signatureHeader
    .split(' ')
    .map(part => part.trim())
    .find(part => part.startsWith('v1,'))
  if (!provided) return false

  const providedValue = provided.slice(3)
  const a = Buffer.from(expected)
  const b = Buffer.from(providedValue)
  return a.length === b.length && timingSafeEqual(a, b)
}
