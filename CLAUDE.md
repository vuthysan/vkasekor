# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two-package workspace (no root package.json — operate inside the relevant directory):

- `backend/` — Bun + Hono + MongoDB API + cron scheduler. Entrypoint `src/index.ts`.
- `dash/` — Next.js 16 (App Router, React 19) operator dashboard + Khmer-language farmer portal.
- `docs/` — `Master-Plan.md` (system overview, rules engine), `user-flow.md`, `To-Do.md`.
- `PRODUCT.md`, `DESIGN.md`, `DESIGN.json` — product/brand/design constraints; consult before UI changes.

## Common commands

Backend (`cd backend`):

```bash
bun install
bun run dev                  # bun --watch src/index.ts
bun test                     # all tests (mongodb-memory-server starts an in-memory DB)
bun test tests/lib/jwt.test.ts          # single file
bun test --test-name-pattern "rule"     # filter by test name
bun run setup-indexes        # create Mongo indexes against $MONGODB_URI
bun run seed                 # seed Rule documents from src/seeds/*
bun run hash-password        # produce ADMIN_PASSWORD_HASH for .env
```

Frontend (`cd dash`):

```bash
bun install                  # or npm install — both lockfiles exist
bun run dev                  # next dev (port 3000)
bun run build && bun run start
```

There is no lint script in either package; rely on `tsc --noEmit` (via `next build` for `dash`, or `bun build` / IDE for `backend`).

## Backend architecture

- **Stack**: Bun runtime, Hono router, native `mongodb` driver (no Mongoose), `zod` for validation, `jose` for JWT, `node-cron` for scheduling.
- **Path alias**: `~/*` → `./src/*` (configured in `backend/tsconfig.json`).
- **Env loading** (`src/env.ts`): all env vars validated with zod at boot. `JWT_SECRET` requires ≥32 chars; `ADMIN_USER_ID` must be a 24-char ObjectId. In `NODE_ENV=test`, validation is skipped (tests inject env directly via `helpers.ts`).
- **DB singleton** (`src/lib/db.ts`): `connectDb()` is called once in `index.ts`; routes/cron access collections via the typed `collections.{users,assets,rules,alerts,system}()` accessors. Document types live in `src/types.ts`.
- **Routes** are factories that take config (`jwtSecret`, `botToken`, etc.) and return a Hono sub-app:
  - `/api/auth` — Telegram login widget (`/telegram`) + admin email/password (`/password`, uses `Bun.password.verify`). Sets `session` cookie (HttpOnly, 7d).
  - `/api/assets`, `/api/admin/users`, `/api/alerts`, `/api/rules` — gated by `requireAuth` middleware (`src/middleware/auth.ts`), which reads the `session` cookie and sets `c.var.session`.
- **Cron / Rules Engine** (`src/cron/daily-check.ts`):
  - Schedule: `0 7 * * *` in `Asia/Phnom_Penh`. Also runs catch-up on startup.
  - For each active asset, computes `age = daysBetween(arrival_date, processingDay)` using ICT-anchored day boundaries (`src/lib/lifecycle.ts`), then `matchingRulesForAge(rules, type, age)` — rules are matched by `(asset_type, day_offset)` exact equality.
  - **Idempotency**: an alert insert keyed on `(asset_id, rule_id, scheduled_for)` relies on a unique index; duplicate-key (Mongo error 11000) is swallowed so re-runs are safe. Telegram failures are recorded as `delivery_status: "failed"` rather than thrown — there is no retry sweep yet (acknowledged V1 gap, see comment in `daily-check.ts`).
  - Catch-up logic uses `system.last_cron_run` to fill gaps day-by-day if the cron missed runs.
  - Auto-harvest: when `age >= ASSET_CONFIG[type].defaultHarvestDays`, the asset's status flips to `harvested`.
  - `/dev/trigger-cron` (POST) is exposed only when `NODE_ENV !== "production"`.
- **Telegram alert formatting** is split: `khmer-formatter.ts` builds the Khmer message; `khmer-numerals.ts` converts digits.
- **Tests** (`bun test`): unit tests in `tests/lib/`; integration tests in `tests/integration/` use `setupTestDb()`/`teardownTestDb()`/`clearAllCollections()` from `helpers.ts` to wrap each suite around an in-memory Mongo. Telegram is exercised via fetch mocking — do not hit the real Bot API in tests.

## Frontend architecture

- **Next.js 16, React 19, Tailwind v4, Motion (Framer), HeroUI v3 (`@heroui/react`), TanStack Table.**
- **Important**: `dash/AGENTS.md` warns that this is a **breaking** Next.js release with new APIs and conventions. Before writing App Router / RSC / data-fetching code, read `dash/node_modules/next/dist/docs/` for the current guidance — do not rely on training-data Next.js patterns. Heed deprecation warnings emitted by the dev server.
- **Path alias**: `~/*` → `./` (project root), so `~/components/...`, `~/lib/...`.
- **Routing**:
  - `app/page.tsx` — public login page (HeroUI form, brand panel).
  - `app/(auth)/layout.tsx` — authenticated shell with sidebar + header (currently client-side only; auth gating not yet wired to backend `/api/auth/me`).
  - `app/(auth)/{overview,assets,schedules}/` — operator dashboard surfaces.
  - `app/(auth)/farm/` — Khmer-language farmer portal; nests its own layout that injects `Kantumruy_Pro` and sets `lang="km"`.
- **Design system** is enforced by `PRODUCT.md` + `DESIGN.md`/`DESIGN.json`: earthy green-and-parchment palette via CSS custom properties (`--color-canopy-deep`, `--color-rice-parchment`, `--color-sprout`, `--color-sage-mist`, `--color-dried-grass`, etc., declared in `app/globals.css`). Fonts: `Playfair_Display` (display), `Inter` (UI), `Kantumruy_Pro` (Khmer) — exposed as CSS variables on `<html>`. Avoid generic SaaS blue/purple, gradient text, hero metrics, cartoon farm illustrations.

## Domain model essentials

The "Rules Engine" abstracts agronomy from code: a `Rule` document carries `(asset_type, day_offset, category, severity, title_kh, instructions_kh, ...)`. Adding a new asset type is a data change (seed new rules + extend `ASSET_CONFIG` in `src/lib/asset-config.ts`), not an engine change. See `docs/Master-Plan.md` for the full rationale and roadmap.

## Conventions worth honoring

- Backend uses ES modules, `import` with the `~/` alias, no relative `../../` chains.
- All date arithmetic for asset age and cron scheduling MUST go through `src/lib/lifecycle.ts` (Phnom Penh / ICT boundaries) — do not use raw `Date` math, which will drift around DST-free but timezone-offset boundaries.
- Mongo writes that should be idempotent rely on unique indexes + catching error code `11000`; mirror this pattern rather than pre-checking with a `findOne`.
- Khmer-facing strings live in seed data and `khmer-formatter.ts` — keep operator UI English; farmer portal (`/farm`) Khmer.
