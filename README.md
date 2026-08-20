# QuiikMail

A fast, clean email client built with **Nuxt 4**, **Nuxt UI 4**, and **Tailwind CSS 4**, backed by a full **Nitro** backend (Resend → Postgres).

## Stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 4 (app/ + server/ split) |
| UI Components | Nuxt UI 4 (Radix + Tailwind) |
| Styling | Tailwind CSS 4 + custom violet palette + dark mode |
| State | `useMailStore` composable (reactive singleton) |
| Auth | `nuxt-auth-utils` (session cookies, password hashing) |
| Data | Postgres via Drizzle ORM |
| Email | Resend API (send, inbound webhook + polling sync) |
| Icons | Lucide (via `@iconify-json/lucide`) |

## Project structure

```
app/
├── assets/css/main.css          # Custom palette + global styles (dark-aware)
├── components/mail/             # All mail-specific components
│   ├── AttachmentItem.vue       # Download via /api/attachments/:id
│   ├── MailSetupModal.vue       # Mailbox setup wizard (modal, 2 steps)
│   ├── MailCompose.vue          # Single UDrawer (bottom sheet on mobile, floating window on desktop)
│   ├── MailDetail.vue
│   ├── MailList.vue
│   ├── MailListItem.vue
│   ├── MailSidebar.vue
│   ├── MailTopBar.vue           # Search, mailbox switcher, sync, theme, user menu
│   └── SidebarItem.vue
├── composables/
│   ├── useMailStore.ts          # Central reactive state + all actions
│   └── useMailFormat.ts         # Date, file size, avatar colour helpers
├── middleware/
│   ├── auth.ts                  # Redirects anonymous users to /login
│   └── guest.ts                 # Redirects logged-in users away from auth pages
├── pages/
│   ├── index.vue                # App shell (UDashboardGroup: sidebar + list + detail)
│   ├── login.vue
│   ├── register.vue             # Optional recovery email (separate from mailbox "send from")
│   └── settings.vue             # Account + mailbox settings
├── services/
│   ├── authService.ts           # register / login / logout / me
│   ├── mailboxService.ts        # CRUD + validate + sync + webhook secret
│   └── mailService.ts           # Mails, drafts, flags, folders, attachments
├── types/
│   ├── mail.ts                  # Mail contract shared with the API
│   ├── mailbox.ts               # MailboxDto + API response types
│   └── auth.d.ts                # #auth-utils module augmentation
└── utils/
    ├── apiError.ts              # API error helper
    └── mailHtml.ts              # DOMPurify sanitization + plain-text linkify
server/
├── api/                         # Thin route handlers (auth, mailboxes, mails, attachments, webhooks)
├── core/                        # errors, logger, crypto (AES-256-GCM), database, env, container (DI)
├── middleware/session.ts        # Guards /api/**, skips auth + webhook routes
├── modules/                     # auth, mailboxes, mails, resend (client + Svix webhook verify), smtp, sync
├── plugins/                     # DI graph + env file loader
├── schemas/                     # Drizzle schema (users, mailboxes, mailbox_senders, mails, attachments)
├── tasks/imap-sync.ts           # Scheduled IMAP polling (Nitro cron)
└── error-handler.ts             # Error envelope { statusCode, code, message, details? }
```

## Setup

1. Postgres must be running; create the dev role/db (`quiikmail`/`quiikmail`) and copy `.env.example` → `.env` (DB URL, `NUXT_MAIL_ENC_KEY`, `NUXT_SESSION_PASSWORD`, `NUXT_MAIL_APP_URL`).
2. `pnpm db:push` - sync the Drizzle schema.
3. `pnpm dev` - http://localhost:3000
4. Register an account, then connect a mailbox from the setup modal with a Resend API key.

## Dev

```bash
pnpm install      # note: pnpm, not npm (packageManager: pnpm@11.20.0)
pnpm dev          # http://localhost:3000
pnpm db:push      # sync schema
pnpm lint
pnpm typecheck
pnpm build
pnpm preview
```

## Theme

- **Dark mode** via `@nuxtjs/color-mode` (bundled with Nuxt UI): `preference: 'system'`, fallback light. Toggle in the topbar (`UColorModeButton`).
- Use semantic tokens (`bg-default`, `text-muted`, `border-default`, `bg-primary`, …) instead of hardcoded colors.
- Primary: violet (`#7C3AED` / Tailwind `violet-600`)
- Page background: `#EEE9FF` light / `#16122B` dark
- Custom CSS vars: `--color-qm-50` → `--color-qm-900`