import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/**
 * AES-256-GCM encryption for secrets at rest (Resend API keys, webhook signing secrets).
 * Payload format: v1:<iv base64>:<authTag base64>:<ciphertext base64>
 */
export class CryptoService {
  constructor(private readonly secret: string) {}

  private deriveKey(): Buffer {
    return createHash('sha256').update(this.secret).digest()
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.deriveKey(), iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
  }

  decrypt(payload: string): string {
    const [version, ivB64, tagB64, dataB64] = payload.split(':')
    if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) {
      throw new Error('Unsupported or malformed encrypted payload')
    }
    const decipher = createDecipheriv('aes-256-gcm', this.deriveKey(), Buffer.from(ivB64, 'base64'))
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()])
    return decrypted.toString('utf8')
  }
}
