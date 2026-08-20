# Contributing

Thanks for contributing to QuiikMail!

## Getting started

- **Stack**: Nuxt 4 (client under `app/`, Nitro backend under `server/`), pnpm, Postgres + Drizzle.
- **Setup**: copy `.env.example` to `.env` (or `.env.dev`), run a local Postgres, then
  `pnpm install && pnpm dev` (see `DEPLOY.md` and `AGENTS.md` for details).
- **Checks**: `pnpm lint` and `pnpm typecheck` must pass; there is no test suite.
  `pnpm build` verifies the compiled output.

## How to contribute

1. Fork this repository and create a branch from `main`.
2. Make your changes; keep commits focused and conventional (`feat: ...`, `fix: ...`, `docs: ...`).
3. Run `pnpm lint` and `pnpm typecheck` locally and make sure both are clean.
4. Open a pull request. The maintainer reviews it and syncs accepted changes into the
   private deployment repo, where CI/CD runs.

## Conventions

- Everything is a Nuxt UI component (`UButton`, `UInput`, `UModal`, ...) - no hand-rolled controls.
- Use the custom palette in `app/assets/css/main.css` (`--color-qm-*`) and semantic tokens
  (`bg-default`, `text-muted`, ...) instead of ad-hoc colors.
- Backend: thin route handlers, service + repository classes, zod v4 validation, consistent error
  envelope `{ statusCode, code, message, details? }`.
- ESLint stylistic settings (`commaDangle: never`, `braceStyle: 1tbs`) come from `nuxt.config.ts` -
  do not override them in `eslint.config.mjs`.

## Important gotchas

- `useMailStore` is a module-level `reactive()` singleton - never create state inside the composable
  function body.
- Nuxt's tsconfig enables `noUncheckedIndexedAccess` - index/array accesses need `!`.
- Nitro auto-imports server utils (`requireUserSession`, `setUserSession`, ...) - never import them
  from `nuxt-auth-utils`.
- Mail HTML is rendered via DOMPurify (`app/utils/mailHtml.ts`) - all `v-html` input is sanitized.
- See `AGENTS.md` in the repo root for the full set of conventions.