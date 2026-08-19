import nodemailer, { type Transporter } from 'nodemailer'
import { appError } from '../../core/errors'
import { logger } from '../../core/logger'

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

export interface SmtpSendInput {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  text?: string
  html?: string
}

/** Outbound SMTP transport via nodemailer. */
export class SmtpClient {
  private transport(config: SmtpConfig): Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    })
  }

  /** Verifies the connection and credentials against the server. */
  async verify(config: SmtpConfig): Promise<void> {
    const transport = this.transport(config)
    try {
      await transport.verify()
    } catch (error) {
      throw appError(422, 'SMTP_ERROR', 'SMTP connection failed', { detail: (error as Error).message })
    } finally {
      transport.close()
    }
  }

  /** Sends a message; resolves with the SMTP Message-ID. */
  async send(config: SmtpConfig, input: SmtpSendInput): Promise<string> {
    const transport = this.transport(config)
    try {
      const info = await transport.sendMail({
        from: input.from,
        to: input.to,
        cc: input.cc?.length ? input.cc : undefined,
        bcc: input.bcc?.length ? input.bcc : undefined,
        subject: input.subject,
        text: input.text,
        html: input.html
      })
      return info.messageId ?? ''
    } catch (error) {
      logger.mail.warn(`SMTP send failed for ${config.host}: ${(error as Error).message}`)
      throw appError(502, 'SMTP_ERROR', 'Could not send this email', { detail: (error as Error).message })
    } finally {
      transport.close()
    }
  }
}
