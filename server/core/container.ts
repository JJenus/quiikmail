/**
 * Tiny dependency container — services are registered once at startup
 * (server/plugins/container.ts) and resolved by token from route handlers.
 * Constructor injection only; no decorators or frameworks.
 */

const registry = new Map<string, unknown>()

export function register<T>(token: string, instance: T): T {
  if (registry.has(token)) {
    throw new Error(`[container] Token "${token}" is already registered`)
  }
  registry.set(token, instance)
  return instance
}

export function resolve<T>(token: string): T {
  const instance = registry.get(token)
  if (!instance) {
    throw new Error(`[container] No instance registered for token "${token}"`)
  }
  return instance as T
}

export function has(token: string): boolean {
  return registry.has(token)
}

export const Tokens = {
  AuthService: 'service.auth',
  MailboxService: 'service.mailbox',
  MailService: 'service.mail',
  AttachmentService: 'service.attachment',
  SyncService: 'service.sync',
  IngestService: 'service.ingest',
  ResendClientFactory: 'factory.resend-client',
  CryptoService: 'service.crypto',
  MailboxRepository: 'repo.mailbox'
} as const
