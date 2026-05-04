# Email/Password Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `POST /auth/password` alongside Telegram login so the admin can log in with email + password stored in env vars.

**Architecture:** Credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_USER_ID`) live in env vars. On login, the route verifies email and password using `Bun.password.verify` (Argon2id, no new dependency), then signs the same JWT cookie used by Telegram login. No database is touched during login. `SessionPayload.telegram_id` becomes optional to accommodate sessions that have no Telegram context.

**Tech Stack:** Hono, MongoDB, jose (JWT), `Bun.password` (built-in), Zod, bun:test

---

## File Map

| File | Change |
|------|--------|
| `src/types.ts` | Make `telegram_id?: number` (optional) |
| `src/lib/jwt.ts` | Relax `verifySession` — allow missing `telegram_id` |
| `src/env.ts` | Add `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_USER_ID` to `EnvSchema` |
| `src/routes/auth.ts` | Extend `AuthRouteConfig`; add `POST /password` handler |
| `src/index.ts` | Pass the three new env fields into `authRoutes()` |
| `src/scripts/hash-password.ts` | New: one-time setup script to generate password hash |
| `package.json` | Add `hash-password` script entry |
| `.env.example` | Document the three new vars |
| `tests/lib/jwt.test.ts` | Add test: session round-trips without `telegram_id` |
| `tests/lib/env.test.ts` | Update existing happy-path call; add tests for new fields |
| `tests/integration/auth.test.ts` | Update `buildApp()`; add `POST /auth/password` tests |

---

## Task 1: Update `SessionPayload` and `verifySession` for optional `telegram_id`

**Files:**
- Modify: `src/types.ts`
- Modify: `src/lib/jwt.ts`
- Modify: `tests/lib/jwt.test.ts`

- [ ] **Step 1: Write failing test for session without `telegram_id`**

Open `tests/lib/jwt.test.ts` and add this test inside the existing `describe` block, after the last `it(...)`:

```ts
it("round-trips a payload without telegram_id", async () => {
  const token = await signSession({ user_id: "abc" }, SECRET)
  const decoded = await verifySession(token, SECRET)
  expect(decoded.user_id).toBe("abc")
  expect(decoded.telegram_id).toBeUndefined()
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
bun test tests/lib/jwt.test.ts
```

Expected: FAIL — `verifySession` throws `"invalid session payload"` because `telegram_id` is missing.

- [ ] **Step 3: Update `SessionPayload` in `src/types.ts`**

Change:
```ts
export interface SessionPayload {
  user_id: string
  telegram_id: number
}
```
To:
```ts
export interface SessionPayload {
  user_id: string
  telegram_id?: number
}
```

- [ ] **Step 4: Update `verifySession` in `src/lib/jwt.ts`**

Replace the function body with:
```ts
export async function verifySession(token: string, secret: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, key(secret), { algorithms: [ALG] })
  if (typeof payload.user_id !== "string") {
    throw new Error("invalid session payload")
  }
  const telegram_id = typeof payload.telegram_id === "number" ? payload.telegram_id : undefined
  return { user_id: payload.user_id, telegram_id }
}
```

- [ ] **Step 5: Run all jwt tests to confirm they pass**

```bash
bun test tests/lib/jwt.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/lib/jwt.ts tests/lib/jwt.test.ts
git commit -m "feat: make SessionPayload.telegram_id optional"
```

---

## Task 2: Add new env vars to `EnvSchema`

**Files:**
- Modify: `src/env.ts`
- Modify: `.env.example`
- Modify: `tests/lib/env.test.ts`

- [ ] **Step 1: Write failing tests for the new fields**

Open `tests/lib/env.test.ts`. The existing happy-path `loadEnv()` call is missing the three new required fields — it will fail once we add them. Update the full file to:

```ts
import { describe, expect, it } from "bun:test"
import { loadEnv } from "~/env"

const base = {
  MONGODB_URI: "mongodb://x/y",
  BOT_TOKEN: "abc",
  TELEGRAM_GROUP_ID: "-100123",
  JWT_SECRET: "s".repeat(32),
  PORT: "8080",
  NODE_ENV: "test",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD_HASH: "somehash",
  ADMIN_USER_ID: "a".repeat(24),
}

describe("loadEnv", () => {
  it("returns parsed env when all required vars present", () => {
    const env = loadEnv(base)
    expect(env.MONGODB_URI).toBe("mongodb://x/y")
    expect(env.PORT).toBe(8080)
    expect(env.ADMIN_EMAIL).toBe("admin@example.com")
    expect(env.ADMIN_USER_ID).toBe("a".repeat(24))
  })

  it("throws when JWT_SECRET is shorter than 32 chars", () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: "short" })).toThrow()
  })

  it("throws when BOT_TOKEN is missing", () => {
    const { BOT_TOKEN: _, ...rest } = base
    expect(() => loadEnv(rest as any)).toThrow()
  })

  it("throws when ADMIN_EMAIL is not a valid email", () => {
    expect(() => loadEnv({ ...base, ADMIN_EMAIL: "notanemail" })).toThrow()
  })

  it("throws when ADMIN_USER_ID is not 24 characters", () => {
    expect(() => loadEnv({ ...base, ADMIN_USER_ID: "tooshort" })).toThrow()
  })

  it("throws when ADMIN_PASSWORD_HASH is missing", () => {
    const { ADMIN_PASSWORD_HASH: _, ...rest } = base
    expect(() => loadEnv(rest as any)).toThrow()
  })
})
```

- [ ] **Step 2: Run test to confirm failures**

```bash
bun test tests/lib/env.test.ts
```

Expected: FAIL — `env.ADMIN_EMAIL` is undefined, new tests throw unexpected errors.

- [ ] **Step 3: Add fields to `EnvSchema` in `src/env.ts`**

Add these three lines inside `EnvSchema` (after the existing `JWT_SECRET` line):

```ts
ADMIN_EMAIL: z.string().email(),
ADMIN_PASSWORD_HASH: z.string().min(1),
ADMIN_USER_ID: z.string().length(24),
```

- [ ] **Step 4: Update `.env.example`** to document the new vars. Add after the `# Auth` section:

```
# Admin (email+password login)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=   # run: bun run hash-password
ADMIN_USER_ID=         # your MongoDB user _id hex (24 chars)
```

- [ ] **Step 5: Run env tests to confirm they all pass**

```bash
bun test tests/lib/env.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/env.ts .env.example tests/lib/env.test.ts
git commit -m "feat: add ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_USER_ID env vars"
```

---

## Task 3: Add `POST /auth/password` route

**Files:**
- Modify: `src/routes/auth.ts`
- Modify: `tests/integration/auth.test.ts`

- [ ] **Step 1: Write failing integration tests for `POST /auth/password`**

Open `tests/integration/auth.test.ts`. Make these changes:

1. Add import at the top:
```ts
import type { SessionPayload } from "~/types"
```

2. Add module-level constants and hash variable before `buildApp`:
```ts
const ADMIN_EMAIL = "admin@test.com"
const ADMIN_USER_ID = "a".repeat(24)
let ADMIN_PASSWORD_HASH = ""
```

3. Change `beforeAll` to also compute the hash:
```ts
beforeAll(async () => {
  ADMIN_PASSWORD_HASH = await Bun.password.hash("secret123")
  await setupTestDb()
})
```

4. Update `buildApp` to pass the new config fields:
```ts
function buildApp() {
  const app = new Hono()
  app.route(
    "/api/auth",
    authRoutes({
      botToken: BOT_TOKEN,
      jwtSecret: JWT_SECRET,
      adminEmail: ADMIN_EMAIL,
      adminPasswordHash: ADMIN_PASSWORD_HASH,
      adminUserId: ADMIN_USER_ID,
    }),
  )
  return app
}
```

5. Add a new `describe` block at the end of the file (after the `GET /api/auth/me` block):
```ts
describe("POST /api/auth/password", () => {
  it("issues a session cookie for correct credentials", async () => {
    const res = await buildApp().request("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: "secret123" }),
    })
    expect(res.status).toBe(200)
    const setCookie = res.headers.get("set-cookie") ?? ""
    expect(setCookie).toContain("session=")
    expect(setCookie).toContain("HttpOnly")
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it("returns 401 for wrong password", async () => {
    const res = await buildApp().request("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: "wrongpassword" }),
    })
    expect(res.status).toBe(401)
  })

  it("returns 401 for wrong email", async () => {
    const res = await buildApp().request("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "other@test.com", password: "secret123" }),
    })
    expect(res.status).toBe(401)
  })

  it("session from password login is accepted by /me", async () => {
    const token = await signSession({ user_id: ADMIN_USER_ID }, JWT_SECRET)
    const _id = new ObjectId(ADMIN_USER_ID)
    await collections.users().insertOne({
      _id,
      telegram_id: 1,
      telegram_username: "admin",
      display_name: "Admin",
      approved: true,
      created_at: new Date(),
      last_login_at: new Date(),
    })
    const res = await buildApp().request("/api/auth/me", {
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.display_name).toBe("Admin")
  })
})
```

- [ ] **Step 2: Run tests to confirm the new ones fail**

```bash
bun test tests/integration/auth.test.ts
```

Expected: TypeScript compilation error (new fields missing from `authRoutes` call) and new tests fail with 404.

- [ ] **Step 3: Update `AuthRouteConfig` and add the route in `src/routes/auth.ts`**

Replace the `AuthRouteConfig` interface with:
```ts
interface AuthRouteConfig {
  botToken: string
  jwtSecret: string
  adminEmail: string
  adminPasswordHash: string
  adminUserId: string
}
```

Add this route inside `authRoutes`, after the existing `app.post("/telegram", ...)` handler and before `app.get("/me", ...)`:

```ts
app.post("/password", async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return c.json({ error: "bad payload" }, 400)
  }
  const emailMatch = body.email === cfg.adminEmail
  const passwordMatch = await Bun.password.verify(body.password, cfg.adminPasswordHash)
  if (!emailMatch || !passwordMatch) {
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

- [ ] **Step 4: Run all integration auth tests**

```bash
bun test tests/integration/auth.test.ts
```

Expected: All tests pass (Telegram tests still green, new password tests green).

- [ ] **Step 5: Run the full test suite to check for regressions**

```bash
bun test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/routes/auth.ts tests/integration/auth.test.ts
git commit -m "feat: add POST /auth/password route with env-var credentials"
```

---

## Task 4: Wire up new env vars in `src/index.ts`

**Files:**
- Modify: `src/index.ts`

No new tests needed — integration tests already cover this path.

- [ ] **Step 1: Update the `authRoutes` call in `src/index.ts`**

Replace:
```ts
app.route("/api/auth", authRoutes({ botToken: env.BOT_TOKEN, jwtSecret: env.JWT_SECRET }))
```
With:
```ts
app.route(
  "/api/auth",
  authRoutes({
    botToken: env.BOT_TOKEN,
    jwtSecret: env.JWT_SECRET,
    adminEmail: env.ADMIN_EMAIL,
    adminPasswordHash: env.ADMIN_PASSWORD_HASH,
    adminUserId: env.ADMIN_USER_ID,
  }),
)
```

- [ ] **Step 2: Run all tests one more time**

```bash
bun test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire ADMIN_* env vars into authRoutes in index.ts"
```

---

## Task 5: Add `hash-password` setup script

**Files:**
- Create: `src/scripts/hash-password.ts`
- Modify: `package.json`

This is a one-time tool for generating the `ADMIN_PASSWORD_HASH` value. No automated tests — it's a CLI script.

- [ ] **Step 1: Create `src/scripts/hash-password.ts`**

```ts
const password = prompt("Password: ")
if (!password) {
  console.error("No password provided.")
  process.exit(1)
}
const hash = await Bun.password.hash(password)
console.log(`\nADMIN_PASSWORD_HASH=${hash}`)
```

- [ ] **Step 2: Add script to `package.json`**

Inside `"scripts"`, add:
```json
"hash-password": "bun run src/scripts/hash-password.ts"
```

- [ ] **Step 3: Smoke-test the script manually**

```bash
echo "mysecret" | bun run hash-password
```

Expected: prints a line like `ADMIN_PASSWORD_HASH=$argon2id$...`

- [ ] **Step 4: Commit**

```bash
git add src/scripts/hash-password.ts package.json
git commit -m "feat: add hash-password setup script"
```

---

## Setup Checklist (run after deploying)

1. `bun run hash-password` → enter your password → copy the printed `ADMIN_PASSWORD_HASH=...` line
2. Add to `.env`:
   ```
   ADMIN_EMAIL=your@email.com
   ADMIN_PASSWORD_HASH=<paste from above>
   ADMIN_USER_ID=<your MongoDB _id hex — find it with: db.users.findOne({}, {_id:1})>
   ```
3. Restart the server: `bun run start`
4. Test: `curl -X POST http://localhost:8080/api/auth/password -H 'Content-Type: application/json' -d '{"email":"your@email.com","password":"yourpassword"}'`
   Expected: `{"ok":true}` with a `set-cookie: session=...` header
