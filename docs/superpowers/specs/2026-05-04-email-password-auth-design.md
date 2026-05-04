# Email/Password Auth Design

**Date:** 2026-05-04
**Status:** Approved

## Overview

Add a `POST /auth/password` route alongside the existing `POST /auth/telegram` route. On success it issues the same `session` httpOnly cookie using the existing JWT infrastructure. This is a single-admin system — credentials live entirely in environment variables, no database is touched during login.

## Decisions

- Runs **alongside** Telegram login, not replacing it
- Credentials stored in **env vars** (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_USER_ID`)
- Password hashed with **`Bun.password`** (Argon2id, built-in, no new dependency)
- No DB lookup at login — session signed directly from env vars
- `ADMIN_USER_ID` is the hex string of the existing MongoDB `_id` for the admin user

## Changes

### `src/types.ts`

Make `telegram_id` optional in `SessionPayload` to support password-based sessions that have no Telegram ID:

```ts
export interface SessionPayload {
  user_id: string
  telegram_id?: number
}
```

### `src/env.ts`

Three new required env vars added to `EnvSchema`:

```ts
ADMIN_EMAIL: z.string().email(),
ADMIN_PASSWORD_HASH: z.string().min(1),
ADMIN_USER_ID: z.string().length(24), // MongoDB ObjectId hex
```

### `src/lib/jwt.ts`

Relax `verifySession` to allow `telegram_id` to be absent:

```ts
if (typeof payload.user_id !== "string") throw new Error("invalid session payload")
const telegram_id = typeof payload.telegram_id === "number" ? payload.telegram_id : undefined
return { user_id: payload.user_id, telegram_id }
```

### `src/routes/auth.ts`

Extend `AuthRouteConfig` with three new fields:

```ts
interface AuthRouteConfig {
  botToken: string
  jwtSecret: string
  adminEmail: string
  adminPasswordHash: string
  adminUserId: string
}
```

Add `POST /password` to the existing `authRoutes` function:

```ts
app.post("/password", async (c) => {
  const { email, password } = await c.req.json()
  if (
    email !== cfg.adminEmail ||
    !(await Bun.password.verify(password, cfg.adminPasswordHash))
  ) {
    return c.json({ error: "invalid credentials" }, 401)
  }
  const token = await signSession({ user_id: cfg.adminUserId }, cfg.jwtSecret)
  setCookie(c, "session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })
  return c.json({ ok: true })
})
```

### `src/index.ts`

Pass the three new env fields into `authRoutes(cfg)`:

```ts
authRoutes({
  botToken: env.BOT_TOKEN,
  jwtSecret: env.JWT_SECRET,
  adminEmail: env.ADMIN_EMAIL,
  adminPasswordHash: env.ADMIN_PASSWORD_HASH,
  adminUserId: env.ADMIN_USER_ID,
})
```

### `src/scripts/hash-password.ts` (new file)

One-time setup script to generate the password hash:

```ts
const password = prompt("Password: ")
if (!password) process.exit(1)
console.log("ADMIN_PASSWORD_HASH=" + await Bun.password.hash(password))
```

### `package.json`

Add one script:

```json
"hash-password": "bun run src/scripts/hash-password.ts"
```

## Setup Flow

1. Run `bun run hash-password`, enter your password
2. Copy the printed `ADMIN_PASSWORD_HASH=...` line into `.env`
3. Add `ADMIN_EMAIL=your@email.com` and `ADMIN_USER_ID=<your MongoDB _id hex>` to `.env`
4. Restart the server

## Error Handling

- Missing or malformed JSON body → Hono throws 400 naturally
- Wrong email or wrong password → unified `401 { error: "invalid credentials" }` (no enumeration)
- `Bun.password.verify` throws → propagates as 500 (unexpected, hash corruption)

## Out of Scope

- Rate limiting / lockout (single-admin system, internal use)
- Password change endpoint (re-run hash-password script and update `.env`)
- Email/password user registration
