# Deployment Guide

> Public version of the private `DEPLOY.md`. Host identifiers are redacted with
> placeholders - keep this file in sync when the private guide changes.

QuiikMail deploys as a Nitro server (`node .output/server/index.mjs`) behind the hosting
provider's reverse proxy. This guide describes the general flow; concrete hosts,
credentials and the production database live only in the maintainer's private
environment.

## Environments & env files

| Mode | Command | Env source | Precedence (low to high) |
| --- | --- | --- | --- |
| Local dev | `pnpm dev` | `.env.dev` (+ Nuxt's own `.env` load) | `.env` -> `.env.dev` |
| Local preview | `node .output/server/index.mjs` | `.env` + `.env.prod` (runtime plugin `server/plugins/load-env.ts`) | `.env` -> `.env.prod` -> real env |
| Production | hosting panel env vars (real env) | panel vars always win | |

- `.env`, `.env.dev`, `.env.prod` are gitignored (`.env.*` + `!.env.example`). Copy `.env.example` to create them.
- The runtime env plugin is a no-op when real env vars are already set: they are never overridden by files.
- `runtimeConfig` uses the nested `mail.*` shape (`NUXT_MAIL_DATABASE_URL`, `NUXT_MAIL_ENC_KEY`,
  `NUXT_MAIL_APP_URL`) so the runtime env overlay picks up panel vars even when the build baked something else.

### Required env vars

- `NUXT_MAIL_DATABASE_URL` - Postgres URL.
- `NUXT_MAIL_ENC_KEY` - AES-256-GCM key encrypting API keys / SMTP & IMAP credentials / webhook secrets at
  rest. **Never change it after data exists** - encrypted columns become undecryptable. If it must rotate,
  re-enter every mailbox's API key / SMTP / IMAP credentials afterwards.
- `NUXT_MAIL_APP_URL` - public base URL (used for webhook URLs).
- `NUXT_SESSION_PASSWORD` - session signing secret (nuxt-auth-utils).

## First run

1. **Provision the DB**. There are no auto-applied migrations:
   `server/db/migrations/0000_providers_senders.sql` is a **baseline snapshot for documentation only** -
   it was generated against an already-populated database. The local/dev workflow is `pnpm db:push`
   (schema sync, no migration files). For production, schema changes are applied as hand-written
   **additive** SQL (see "Schema changes on the live DB").
2. **Set env vars** in the hosting panel.
3. **Build + upload**:
   ```bash
   pnpm install && pnpm build
   cd .output && tar czf /tmp/quiikmail-output.tar.gz .
   scp /tmp/quiikmail-output.tar.gz <ssh-user>@<ssh-host>:~
   ssh <ssh-user>@<ssh-host> '
     mv ~/app/.output ~/app/.output.old-$(date +%Y%m%d)
     mkdir -p ~/app/.output
     tar xzf ~/quiikmail-output.tar.gz -C ~/app/.output
     rm ~/quiikmail-output.tar.gz
   '
   ```
   (The old build keeps serving until the panel restart.)
4. **Restart the site** in the hosting panel (the one manual step).
5. **Verify**: `/login` loads; sign in; compose/send a mail; check the site logs for the `imap-sync`
   scheduled task (runs every 5 minutes).

## Subsequent code changes

```bash
pnpm lint && pnpm typecheck && pnpm build
# upload as in "First run" (the tar/scp/ssh block), keeping the old build as .output.old-YYYYMMDD
# then restart in the panel
```

Rollback: swap the `.output` directory back to the previous backup, then restart.

## Schema changes on the live DB

Local schema is kept in sync with `pnpm db:push` (Drizzle push; safe, no migration files). Production gets
**additive** SQL only - never `CREATE TABLE` on tables that exist, never destructive statements without a
backup.

```bash
# 1. change server/schemas/*.ts, then sync the local DB
pnpm db:push

# 2. connect to the prod DB (panel credentials)
psql "<DATABASE_URL>"

# 3. run the ALTER statements in a single transaction:
BEGIN;
ALTER TABLE ... ADD COLUMN ...;   -- additive, nullable or with DEFAULT
-- backfills if needed: UPDATE ...;
COMMIT;

# 4. verify
SELECT ... ; -- row counts, new columns, index list
```

Conventions used so far (follow them):
- New columns: nullable or `DEFAULT ... NOT NULL` so existing rows survive.
- Unique constraints get named indexes (e.g. `mailbox_senders_mailbox_email_idx`).
- Secrets go into `*_enc` columns (`AES-256-GCM`, `NUXT_MAIL_ENC_KEY`) - never plaintext.
- After a successful deploy, `pnpm db:push` locally will report "No changes detected" - if it reports a diff,
  the prod SQL missed something.
- If you prefer tracked migrations: `pnpm db:generate --name=<name>` produces SQL in
  `server/db/migrations/` (the current baseline is `0000_providers_senders.sql`). Only use generated files on
  a fresh DB; on the populated prod DB, keep writing additive SQL by hand.

## Known non-issues

- `[Icon] failed to load icon lucide:mail` in the server console: SSR-side iconify resolution warning only -
  icons are bundled and render client-side.
- `.env` "will not be loaded when running the server in production" warning during `pnpm dev`/`pnpm build`:
  expected; production env comes from panel vars + `server/plugins/load-env.ts`.