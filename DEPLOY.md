# Deployment Guide

QuiikMail runs on **AlwaysData** (SSH host `ssh-surfdigitech.alwaysdata.net`, user `surfdigitech`). The site
lives at `surfdigitech.alwaysdata.net`, serving the Nitro build from `~/app/.output`. Postgres is an AlwaysData
managed DB.

## Environments & env files

| Mode | Command | Env source | Precedence (low → high) |
| --- | --- | --- | --- |
| Local dev | `pnpm dev` | `.env.dev` (+ Nuxt's own `.env` load) | `.env` → `.env.dev` |
| Local preview | `node .output/server/index.mjs` | `.env` + `.env.prod` (runtime plugin `server/plugins/load-env.ts`) | `.env` → `.env.prod` → real env |
| Production | AlwaysData panel (web process) | panel env vars (real env) | panel vars always win |

- `.env`, `.env.dev`, `.env.prod` are gitignored (`.env.*` + `!.env.example`). Copy `.env.example` to create them.
- The runtime env plugin is a no-op on AlwaysData: panel vars are already in `process.env` and are never
  overridden by files.
- `runtimeConfig` uses the nested `mail.*` shape (`NUXT_MAIL_DATABASE_URL`, `NUXT_MAIL_ENC_KEY`,
  `NUXT_MAIL_APP_URL`) so Nitro's runtime overlay picks up panel vars even when the build baked something else.

### Required env vars

- `NUXT_MAIL_DATABASE_URL` – Postgres URL.
- `NUXT_MAIL_ENC_KEY` – AES-256-GCM key encrypting API keys / SMTP & IMAP credentials / webhook secrets at
  rest. **Never change it after data exists** – encrypted columns become undecryptable. If it must rotate,
  re-enter every mailbox's API key / SMTP / IMAP credentials afterwards.
- `NUXT_MAIL_APP_URL` – public base URL (used for webhook URLs).
- `NUXT_SESSION_PASSWORD` – session signing secret (nuxt-auth-utils).

## First run

1. **Provision the DB** on AlwaysData (or wherever the server's `NUXT_MAIL_DATABASE_URL` points). There are no
   auto-applied migrations: `server/db/migrations/0000_providers_senders.sql` is a **baseline snapshot for
   documentation only** – it was generated against an already-populated database and contains `CREATE TABLE`
   for everything; running it on a fresh DB is fine, but running it on a populated one fails. The local/dev
   workflow is `pnpm db:push` (schema sync, no migration files). For production, schema changes are applied as
   hand-written **additive** SQL (see "Schema changes on the live DB").
2. **Set env vars** in the AlwaysData panel (admin.alwaysdata.com → Sites → your site → environment).
3. **Build + upload**:
   ```bash
   pnpm install && pnpm build
   cd .output && tar czf /tmp/opencode/quiikmail-output.tar.gz .
   scp /tmp/opencode/quiikmail-output.tar.gz surfdigitech@ssh-surfdigitech.alwaysdata.net:~
   ssh surfdigitech@ssh-surfdigitech.alwaysdata.net '
     mv ~/app/.output ~/app/.output.old-$(date +%Y%m%d)
     mkdir -p ~/app/.output
     tar xzf ~/quiikmail-output.tar.gz -C ~/app/.output
     rm ~/quiikmail-output.tar.gz
   '
   ```
   (The site process is not reachable from SSH; the old build keeps serving until the panel restart.)
4. **Restart the site** in the AlwaysData panel (admin.alwaysdata.com → Sites → your site → Restart). This is
   the only step that must be done manually in the panel.
5. **Verify**: `surfdigitech.alwaysdata.net/login` loads; sign in; compose/send a mail; check the site logs in
   the panel for the `imap-sync` scheduled task (runs every 5 minutes).

## Subsequent code changes

```bash
pnpm lint && pnpm typecheck && pnpm build
# upload as in "First run" (the tar/scp/ssh block), keeping the old build as .output.old-YYYYMMDD
# then restart in the panel
```

Rollback: `ssh ... 'mv ~/app/.output ~/app/.output.broken && mv ~/app/.output.old-YYYYMMDD ~/app/.output'`
+ panel restart.

## Schema changes on the live DB

Local schema is kept in sync with `pnpm db:push` (Drizzle push; safe, no migration files). Production gets
**additive** SQL only – never `CREATE TABLE` on tables that exist, never destructive statements without a
backup.

```bash
# 1. change server/schemas/*.ts, then sync the local DB
pnpm db:push

# 2. connect to the prod DB from the AlwaysData console or SSH psql with the panel DB credentials
ssh surfdigitech@ssh-surfdigitech.alwaysdata.net
psql "postgres://<user>:<password>@<host>/<db>"

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
- Secrets go into `*_enc` columns (`AES-256-GCM`, `NUXT_MAIL_ENC_KEY`) – never plaintext.
- After a successful deploy, `pnpm db:push` locally will report "No changes detected" – if it reports a diff,
  the prod SQL missed something.
- If you prefer tracked migrations: `pnpm db:generate --name=<name>` produces SQL in
  `server/db/migrations/` (the current baseline is `0000_providers_senders.sql`). Only use generated files on
  a fresh DB; on the populated prod DB, keep writing additive SQL by hand.

## Known non-issues

- `[Icon] failed to load icon lucide:mail` in the server console: SSR-side iconify resolution warning only –
  icons are bundled and render client-side.
- `.env` "will not be loaded when running the server in production" warning during `pnpm dev`/`pnpm build`:
  expected; production env comes from panel vars + `server/plugins/load-env.ts`.