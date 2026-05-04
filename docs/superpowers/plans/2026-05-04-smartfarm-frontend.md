# SmartFarm Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js 14 + HeroUI mobile-first dashboard that lets approved family members log in via Telegram, register chicken batches, and view daily alerts — all in Khmer.

**Architecture:** Next.js App Router frontend in `frontend/` calls the Hono backend at `NEXT_PUBLIC_API_URL`. Auth state is held in a React context populated by a `GET /api/auth/me` call on every protected page load; the HTTP-only session cookie is managed entirely by the backend. Navigation is a bottom tab bar on mobile, top nav on desktop ≥768px.

**Tech Stack:** Next.js 14 (App Router), TailwindCSS, HeroUI (`@heroui/react`), TypeScript, Bun

---

## File Map

**Backend changes (Tasks 1):**
- `backend/src/routes/auth.ts` — add `GET /me` endpoint
- `backend/src/routes/alerts.ts` — add `?days=N` query param
- `backend/tests/integration/auth.test.ts` — add `GET /me` test
- `backend/tests/integration/alerts.test.ts` — add `?days=N` test

**Frontend (Tasks 2–15):**
```
frontend/
├── app/
│   ├── layout.tsx                   # root HTML shell + HeroUI provider
│   ├── login/page.tsx               # public Telegram login page
│   └── (app)/
│       ├── layout.tsx               # auth guard + nav shell
│       ├── page.tsx                 # / — today's alerts
│       ├── batches/
│       │   ├── page.tsx             # /batches — batch list
│       │   ├── new/page.tsx         # /batches/new — register form
│       │   └── [id]/page.tsx        # /batches/:id — detail + timeline
│       ├── alerts/page.tsx          # /alerts — alert history
│       └── users/page.tsx           # /users — user management
├── components/
│   ├── nav/BottomNav.tsx
│   ├── nav/TopNav.tsx
│   ├── alerts/AlertCard.tsx
│   ├── batches/BatchCard.tsx
│   ├── batches/BatchForm.tsx
│   ├── batches/BatchEditModal.tsx
│   ├── batches/LifecycleTimeline.tsx
│   ├── users/UserTable.tsx
│   ├── users/AddUserModal.tsx
│   └── TelegramLoginButton.tsx
├── context/auth.tsx
├── lib/
│   ├── api-client.ts
│   ├── types.ts
│   ├── khmer.ts
│   └── dates.ts
├── tests/
│   ├── khmer.test.ts
│   └── dates.test.ts
├── tailwind.config.ts
├── next.config.ts
├── .env.local.example
└── package.json
```

---

## Task 1: Backend — add `GET /api/auth/me` and alerts `?days` filter

**Files:**
- Modify: `backend/src/routes/auth.ts`
- Modify: `backend/src/routes/alerts.ts`
- Modify: `backend/tests/integration/auth.test.ts`
- Modify: `backend/tests/integration/alerts.test.ts`

The frontend needs two backend changes before it can work:
1. `GET /api/auth/me` — lets the frontend re-hydrate user info on page reload (cookie is HTTP-only so JS can't read it directly).
2. `GET /api/alerts?days=30` — lets the `/alerts` history page fetch the last N days instead of only today.

- [ ] **Step 1: Add `GET /me` to `backend/src/routes/auth.ts`**

Add `ObjectId` import and `requireAuth` import, then insert the new handler before `app.post("/logout", ...)`:

```ts
import { Hono } from "hono"
import { setCookie, deleteCookie } from "hono/cookie"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { verifyTelegramLogin } from "~/lib/telegram"
import { signSession } from "~/lib/jwt"
import { collections } from "~/lib/db"
import { requireAuth } from "~/middleware/auth"

// ... (AuthRouteConfig and TelegramLoginSchema unchanged) ...

export function authRoutes(cfg: AuthRouteConfig) {
  const app = new Hono()

  app.post("/telegram", async (c) => {
    // ... unchanged ...
  })

  app.get("/me", requireAuth, async (c) => {
    const session = c.get("session")
    const user = await collections.users().findOne({ _id: new ObjectId(session.user_id) })
    if (!user) return c.json({ error: "not found" }, 404)
    return c.json({
      user: {
        id: user._id.toHexString(),
        telegram_id: user.telegram_id,
        display_name: user.display_name,
        telegram_username: user.telegram_username,
      },
    })
  })

  app.post("/logout", (c) => {
    deleteCookie(c, "session", { path: "/" })
    return c.json({ ok: true })
  })

  return app
}
```

- [ ] **Step 2: Add `?days=N` to `backend/src/routes/alerts.ts`**

```ts
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth } from "~/middleware/auth"
import { startOfDayInPhnomPenh } from "~/lib/lifecycle"

interface AlertsRouteConfig {
  jwtSecret: string
}

export function alertsRoutes(_cfg: AlertsRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth)

  app.get("/", async (c) => {
    const assetIdParam = c.req.query("asset_id")
    const daysParam = c.req.query("days")
    const filter: Record<string, unknown> = {}

    if (assetIdParam) {
      if (!ObjectId.isValid(assetIdParam)) return c.json({ error: "invalid asset_id" }, 400)
      filter.asset_id = new ObjectId(assetIdParam)
    } else if (daysParam) {
      const days = parseInt(daysParam, 10)
      if (isNaN(days) || days < 1 || days > 90) return c.json({ error: "days must be 1–90" }, 400)
      const today = startOfDayInPhnomPenh(new Date())
      const cutoff = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
      filter.scheduled_for = { $gte: cutoff }
    } else {
      filter.scheduled_for = startOfDayInPhnomPenh(new Date())
    }

    const alerts = await collections.alerts().find(filter).sort({ scheduled_for: -1 }).limit(200).toArray()
    return c.json({ alerts })
  })

  return app
}
```

- [ ] **Step 3: Add `GET /me` test to `backend/tests/integration/auth.test.ts`**

Append inside `describe("POST /api/auth/telegram", ...)` or add a new `describe` block:

```ts
describe("GET /api/auth/me", () => {
  it("returns user info for a valid session", async () => {
    const _id = new ObjectId()
    await collections.users().insertOne({
      _id,
      telegram_id: 99,
      telegram_username: "me_user",
      display_name: "Me",
      approved: true,
      created_at: new Date(),
      last_login_at: new Date(),
    })
    const token = await signSession({ user_id: _id.toHexString(), telegram_id: 99 }, JWT_SECRET)
    const res = await buildApp().request("/api/auth/me", {
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.display_name).toBe("Me")
    expect(body.user.telegram_username).toBe("me_user")
  })

  it("returns 401 without a session", async () => {
    const res = await buildApp().request("/api/auth/me")
    expect(res.status).toBe(401)
  })
})
```

Add the `signSession` import at top of `auth.test.ts`:
```ts
import { signSession } from "~/lib/jwt"
```

- [ ] **Step 4: Add `?days` test to `backend/tests/integration/alerts.test.ts`**

Append inside the existing `describe("GET /api/alerts", ...)`:

```ts
it("returns alerts from the last N days when ?days= is given", async () => {
  const yesterday = new Date(startOfDayInPhnomPenh(new Date()).getTime() - 24 * 60 * 60 * 1000)
  await collections.alerts().insertOne({
    _id: new ObjectId(),
    asset_id: new ObjectId(),
    rule_id: new ObjectId(),
    scheduled_for: yesterday,
    sent_at: new Date(),
    delivery_status: "sent",
    telegram_message_id: 5,
    error: null,
    attempt_count: 1,
  })
  const token = await authToken()
  const res = await buildApp().request("/api/alerts?days=2", {
    headers: { Cookie: `session=${token}` },
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.alerts.length).toBeGreaterThanOrEqual(1)
})

it("rejects days out of range", async () => {
  const token = await authToken()
  const res = await buildApp().request("/api/alerts?days=200", {
    headers: { Cookie: `session=${token}` },
  })
  expect(res.status).toBe(400)
})
```

- [ ] **Step 5: Run backend tests**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/backend && bun test
```

Expected: all tests pass (previously 56, now ≥58).

- [ ] **Step 6: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add backend/src/routes/auth.ts backend/src/routes/alerts.ts \
  backend/tests/integration/auth.test.ts backend/tests/integration/alerts.test.ts
git commit -m "feat: add GET /api/auth/me and alerts ?days filter for frontend"
```

---

## Task 2: Frontend scaffold — Next.js + TailwindCSS + HeroUI

**Files:**
- Create: `frontend/` (entire directory)
- Create: `frontend/package.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/next.config.ts`
- Create: `frontend/.env.local.example`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
bunx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --no-eslint \
  --import-alias "~/*" \
  --use-bun
```

When prompted, accept defaults. This creates `frontend/` with Next.js 14, TailwindCSS, and TypeScript configured.

- [ ] **Step 2: Install HeroUI and framer-motion**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend
bun add @heroui/react framer-motion
```

- [ ] **Step 3: Replace `frontend/tailwind.config.ts`**

```ts
import { heroui } from "@heroui/react"
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#16a34a",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
export default config
```

- [ ] **Step 4: Replace `frontend/next.config.ts`**

```ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Telegram user photos are served from t.me
  images: {
    domains: ["t.me"],
  },
}

export default nextConfig
```

- [ ] **Step 5: Create `frontend/.env.local.example`**

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

- [ ] **Step 6: Copy to `.env.local` and fill in values**

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local` with your actual bot username. `NEXT_PUBLIC_API_URL` stays as `http://localhost:8080` for local dev. Also update `backend/.env`: set `FRONTEND_ORIGIN=http://localhost:3000`.

- [ ] **Step 7: Delete the default Next.js boilerplate**

Delete `frontend/app/page.tsx`, `frontend/app/globals.css` content (keep the file, clear it), and `frontend/public/` SVG files:

```bash
rm -f frontend/public/next.svg frontend/public/vercel.svg
```

- [ ] **Step 8: Verify the project builds**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bun run build
```

Expected: build completes (may warn about empty page.tsx — that's fine).

- [ ] **Step 9: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/
git commit -m "feat: scaffold Next.js 14 + HeroUI frontend"
```

---

## Task 3: Khmer & date utilities + tests

**Files:**
- Create: `frontend/lib/khmer.ts`
- Create: `frontend/lib/dates.ts`
- Create: `frontend/tests/khmer.test.ts`
- Create: `frontend/tests/dates.test.ts`

- [ ] **Step 1: Create `frontend/lib/khmer.ts`**

```ts
const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"]

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
]

export function toKhmerNumerals(n: number): string {
  return String(Math.floor(n))
    .split("")
    .map((ch) => (ch >= "0" && ch <= "9" ? KHMER_DIGITS[Number(ch)] : ch))
    .join("")
}

export function formatKhmerDate(dateStr: string): string {
  // Dates from the API are ISO strings stored at ICT midnight (UTC−7h offset).
  // Add 7h to recover the ICT calendar date.
  const d = new Date(new Date(dateStr).getTime() + 7 * 60 * 60 * 1000)
  const day = d.getUTCDate()
  const month = d.getUTCMonth()
  const year = d.getUTCFullYear()
  return `ថ្ងៃទី ${toKhmerNumerals(day)} ${KHMER_MONTHS[month]} ${toKhmerNumerals(year)}`
}
```

- [ ] **Step 2: Write failing tests — `frontend/tests/khmer.test.ts`**

```ts
import { describe, expect, it } from "bun:test"
import { toKhmerNumerals, formatKhmerDate } from "~/lib/khmer"

describe("toKhmerNumerals", () => {
  it("converts single digit", () => {
    expect(toKhmerNumerals(0)).toBe("០")
    expect(toKhmerNumerals(5)).toBe("៥")
    expect(toKhmerNumerals(9)).toBe("៩")
  })

  it("converts multi-digit numbers", () => {
    expect(toKhmerNumerals(12)).toBe("១២")
    expect(toKhmerNumerals(60)).toBe("៦០")
    expect(toKhmerNumerals(100)).toBe("១០០")
  })

  it("truncates decimals", () => {
    expect(toKhmerNumerals(7.9)).toBe("៧")
  })
})

describe("formatKhmerDate", () => {
  it("formats a May date correctly", () => {
    // 2026-05-03T17:00:00Z = 2026-05-04 00:00:00 ICT (the way arrival dates are stored)
    const result = formatKhmerDate("2026-05-03T17:00:00.000Z")
    expect(result).toBe("ថ្ងៃទី ០៤ ឧសភា ២០២៦")
  })

  it("formats a January date correctly", () => {
    // 2026-01-14T17:00:00Z = 2026-01-15 00:00:00 ICT
    const result = formatKhmerDate("2026-01-14T17:00:00.000Z")
    expect(result).toBe("ថ្ងៃទី ១៥ មករា ២០២៦")
  })
})
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bun test tests/khmer.test.ts
```

Expected: FAIL (module not found — `lib/khmer.ts` exists but path alias `~/*` not wired up for bun test yet).

- [ ] **Step 4: Wire path alias for bun test in `frontend/tsconfig.json`**

The `create-next-app` command creates `tsconfig.json` with `"paths": { "~/*": [".//*"] }`. Check it:

```bash
cat frontend/tsconfig.json | grep -A3 paths
```

If the alias is already present, bun test will resolve it. If not, add:

```json
"paths": {
  "~/*": ["./*"]
}
```

- [ ] **Step 5: Create `frontend/lib/dates.ts`**

```ts
const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

function ictStartOfDay(d: Date): Date {
  const shifted = new Date(d.getTime() + ICT_OFFSET_MS)
  shifted.setUTCHours(0, 0, 0, 0)
  return new Date(shifted.getTime() - ICT_OFFSET_MS)
}

export function daysOld(arrivalDateStr: string): number {
  const arrival = ictStartOfDay(new Date(arrivalDateStr))
  const today = ictStartOfDay(new Date())
  return Math.round((today.getTime() - arrival.getTime()) / (24 * 60 * 60 * 1000))
}
```

- [ ] **Step 6: Create `frontend/tests/dates.test.ts`**

```ts
import { describe, expect, it } from "bun:test"
import { daysOld } from "~/lib/dates"

describe("daysOld", () => {
  it("returns 0 for today's ICT midnight", () => {
    // Construct today's ICT midnight as it would be stored by the backend
    const now = new Date()
    const ictMidnight = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    ictMidnight.setUTCHours(0, 0, 0, 0)
    const storedDate = new Date(ictMidnight.getTime() - 7 * 60 * 60 * 1000)
    expect(daysOld(storedDate.toISOString())).toBe(0)
  })

  it("returns 7 for a date 7 days ago", () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const ictMidnight = new Date(sevenDaysAgo.getTime() + 7 * 60 * 60 * 1000)
    ictMidnight.setUTCHours(0, 0, 0, 0)
    const storedDate = new Date(ictMidnight.getTime() - 7 * 60 * 60 * 1000)
    expect(daysOld(storedDate.toISOString())).toBe(7)
  })
})
```

- [ ] **Step 7: Run all frontend tests**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bun test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/lib/khmer.ts frontend/lib/dates.ts \
  frontend/tests/khmer.test.ts frontend/tests/dates.test.ts
git commit -m "feat: khmer numeral/date utilities and date helpers with tests"
```

---

## Task 4: API types + fetch client

**Files:**
- Create: `frontend/lib/types.ts`
- Create: `frontend/lib/api-client.ts`

The `api-client.ts` wraps `fetch` with `credentials: "include"` so the session cookie is sent automatically. On 401 it redirects to `/login`. All API response shapes are typed in `types.ts`.

- [ ] **Step 1: Create `frontend/lib/types.ts`**

```ts
export interface AuthUser {
  id: string
  telegram_id: number
  display_name: string
  telegram_username: string
}

export type Breed = "broiler" | "layer" | "local"
export type AssetStatus = "active" | "harvested" | "archived"
export type Severity = "critical" | "important" | "info"
export type DeliveryStatus = "pending" | "sent" | "failed"

export interface Asset {
  _id: string
  type: string
  breed: Breed
  quantity_initial: number
  quantity_current: number
  arrival_date: string
  expected_harvest_date: string
  status: AssetStatus
  notes: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Rule {
  _id: string
  asset_type: string
  day_offset: number
  category: string
  severity: Severity
  title_kh: string
  title_en: string
  instructions_kh: string
  instructions_en: string
  source_page: number
}

export interface Alert {
  _id: string
  asset_id: string
  rule_id: string
  scheduled_for: string
  sent_at: string | null
  delivery_status: DeliveryStatus
  telegram_message_id: number | null
  error: string | null
  attempt_count: number
}

export interface ManagedUser {
  _id: string
  telegram_id: number
  telegram_username: string
  display_name: string
  approved: boolean
  created_at: string
  last_login_at: string
}
```

- [ ] **Step 2: Create `frontend/lib/api-client.ts`**

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login"
    throw new Error("unauthenticated")
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  auth: {
    me: () => request<{ user: import("~/lib/types").AuthUser }>("/api/auth/me"),
    loginTelegram: (payload: object) =>
      request<{ user: import("~/lib/types").AuthUser }>("/api/auth/telegram", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  },

  assets: {
    list: (status?: string) =>
      request<{ assets: import("~/lib/types").Asset[] }>(
        status ? `/api/assets?status=${status}` : "/api/assets",
      ),
    get: (id: string) => request<{ asset: import("~/lib/types").Asset }>(`/api/assets/${id}`),
    create: (body: object) =>
      request<{ asset: import("~/lib/types").Asset }>("/api/assets", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    patch: (id: string, body: object) =>
      request<{ asset: import("~/lib/types").Asset }>(`/api/assets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    archive: (id: string) =>
      request<{ asset: import("~/lib/types").Asset }>(`/api/assets/${id}`, {
        method: "DELETE",
      }),
  },

  alerts: {
    today: () => request<{ alerts: import("~/lib/types").Alert[] }>("/api/alerts"),
    forAsset: (assetId: string) =>
      request<{ alerts: import("~/lib/types").Alert[] }>(`/api/alerts?asset_id=${assetId}`),
    history: (days = 30) =>
      request<{ alerts: import("~/lib/types").Alert[] }>(`/api/alerts?days=${days}`),
  },

  rules: {
    list: (assetType = "chicken") =>
      request<{ rules: import("~/lib/types").Rule[] }>(`/api/rules?asset_type=${assetType}`),
  },

  users: {
    list: () => request<{ users: import("~/lib/types").ManagedUser[] }>("/api/admin/users"),
    create: (body: object) =>
      request<{ id: string }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ ok: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" }),
  },
}
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/lib/types.ts frontend/lib/api-client.ts
git commit -m "feat: frontend API types and fetch client"
```

---

## Task 5: Auth context

**Files:**
- Create: `frontend/context/auth.tsx`

The AuthContext holds the logged-in user and a logout helper. It is populated by the protected layout calling `api.auth.me()` on mount.

- [ ] **Step 1: Create `frontend/context/auth.tsx`**

```tsx
"use client"
import { createContext, useContext, useState, useCallback } from "react"
import type { AuthUser } from "~/lib/types"
import { api } from "~/lib/api-client"

interface AuthContextValue {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {})
    setUser(null)
    window.location.href = "/login"
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/context/auth.tsx
git commit -m "feat: auth context with user state and logout"
```

---

## Task 6: Root layout + HeroUI provider

**Files:**
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Write `frontend/app/globals.css`**

Replace the generated content with just the Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2: Write `frontend/app/layout.tsx`**

```tsx
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { HeroUIProvider } from "@heroui/react"
import { AuthProvider } from "~/context/auth"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "កាស្យករ",
  description: "ប្រព័ន្ធគ្រប់គ្រងហ្វូងមាន់",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km">
      <body className={geist.className}>
        <HeroUIProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </HeroUIProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify dev server starts**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bun run dev
```

Expected: server starts at `http://localhost:3000`. Open in browser — blank page (no routes yet) is fine.

- [ ] **Step 4: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/app/layout.tsx frontend/app/globals.css
git commit -m "feat: root layout with HeroUI provider and auth context"
```

---

## Task 7: Login page + TelegramLoginButton

**Files:**
- Create: `frontend/components/TelegramLoginButton.tsx`
- Create: `frontend/app/login/page.tsx`

- [ ] **Step 1: Create `frontend/components/TelegramLoginButton.tsx`**

The Telegram Login Widget must be injected as a real `<script>` tag with `data-*` attributes — `next/script` doesn't pass arbitrary `data-*` through. Use a `useEffect` approach:

```tsx
"use client"
import { useEffect, useRef } from "react"

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void
  }
}

interface Props {
  botUsername: string
  onAuth: (user: TelegramUser) => void
}

export function TelegramLoginButton({ botUsername, onAuth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.onTelegramAuth = onAuth

    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.setAttribute("data-telegram-login", botUsername)
    script.setAttribute("data-size", "large")
    script.setAttribute("data-onauth", "onTelegramAuth(user)")
    script.setAttribute("data-request-access", "write")
    script.async = true

    const container = containerRef.current
    container?.appendChild(script)

    return () => {
      container?.removeChild(script)
    }
  }, [botUsername, onAuth])

  return <div ref={containerRef} />
}
```

- [ ] **Step 2: Create `frontend/app/login/page.tsx`**

```tsx
"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardBody } from "@heroui/react"
import { TelegramLoginButton, type TelegramUser } from "~/components/TelegramLoginButton"
import { api } from "~/lib/api-client"
import { useAuth } from "~/context/auth"

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? ""

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleAuth = useCallback(async (telegramUser: TelegramUser) => {
    setError(null)
    try {
      const { user } = await api.auth.loginTelegram(telegramUser)
      setUser(user)
      router.push("/")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown error"
      if (message.includes("access denied")) {
        setError("សូមទាក់ទងអ្នកគ្រប់គ្រង ដើម្បីចូលប្រើប្រាស់")
      } else {
        setError("មានបញ្ហា សូមព្យាយាមម្ដងទៀត")
      }
    }
  }, [router, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardBody className="flex flex-col items-center gap-6 py-10">
          <div className="text-5xl">🐔</div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">កាស្យករ</h1>
            <p className="text-sm text-gray-500 mt-1">ប្រព័ន្ធគ្រប់គ្រងហ្វូងមាន់</p>
          </div>

          <TelegramLoginButton botUsername={BOT_USERNAME} onAuth={handleAuth} />

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Start the dev server and verify**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bun run dev
```

Open `http://localhost:3000/login`. Expected: card with chicken emoji, app title in Khmer, Telegram login button rendered. (Button may not appear until `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` is set — that's fine.)

- [ ] **Step 4: Type-check**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/components/TelegramLoginButton.tsx frontend/app/login/page.tsx
git commit -m "feat: login page with Telegram Login Widget"
```

---

## Task 8: Protected layout + nav components

**Files:**
- Create: `frontend/app/(app)/layout.tsx`
- Create: `frontend/components/nav/BottomNav.tsx`
- Create: `frontend/components/nav/TopNav.tsx`

The `(app)` route group wraps all authenticated pages. Its layout calls `api.auth.me()` on mount; 401 redirects to `/login`. Navigation is bottom tabs on mobile, top bar on ≥768px.

- [ ] **Step 1: Create `frontend/components/nav/BottomNav.tsx`**

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/", label: "ទំព័រដើម", icon: "🏠" },
  { href: "/batches", label: "ហ្វូងមាន់", icon: "🐔" },
  { href: "/alerts", label: "ប្រវត្តិ", icon: "🔔" },
  { href: "/users", label: "អ្នកប្រើ", icon: "👥" },
]

export function BottomNav() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs ${
                active ? "text-green-600 font-medium" : "text-gray-400"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create `frontend/components/nav/TopNav.tsx`**

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@heroui/react"
import { useAuth } from "~/context/auth"

const TABS = [
  { href: "/", label: "ទំព័រដើម" },
  { href: "/batches", label: "ហ្វូងមាន់" },
  { href: "/alerts", label: "ប្រវត្តិ" },
  { href: "/users", label: "អ្នកប្រើ" },
]

export function TopNav() {
  const path = usePathname()
  const { user, logout } = useAuth()

  return (
    <nav className="hidden md:flex items-center px-6 py-3 bg-white border-b border-gray-200 gap-6">
      <span className="text-green-600 font-bold text-lg mr-4">🐔 កាស្យករ</span>
      {TABS.map((tab) => {
        const active = tab.href === "/" ? path === "/" : path.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-sm ${active ? "text-green-600 font-semibold" : "text-gray-500 hover:text-gray-800"}`}
          >
            {tab.label}
          </Link>
        )
      })}
      <div className="ml-auto flex items-center gap-3">
        {user && <span className="text-sm text-gray-500">{user.display_name}</span>}
        <Button size="sm" variant="flat" onPress={logout}>
          ចេញ
        </Button>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Create `frontend/app/(app)/layout.tsx`**

```tsx
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@heroui/react"
import { useAuth } from "~/context/auth"
import { api } from "~/lib/api-client"
import { BottomNav } from "~/components/nav/BottomNav"
import { TopNav } from "~/components/nav/TopNav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) return
    api.auth.me()
      .then(({ user: u }) => setUser(u))
      .catch(() => router.push("/login"))
  }, [user, setUser, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className="pb-20 md:pb-0 max-w-2xl mx-auto px-4 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Create a placeholder home page `frontend/app/(app)/page.tsx`** (to make the layout render)

```tsx
export default function HomePage() {
  return <div className="py-4 text-gray-500">កំពុងផ្ទុក...</div>
}
```

- [ ] **Step 5: Start dev server and verify protected layout**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bun run dev
```

Open `http://localhost:3000`. Expected: spinner appears while checking auth, then redirects to `/login` (since no real backend session exists in dev without a running backend).

Start the backend in a separate terminal:
```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/backend && bun run dev
```

- [ ] **Step 6: Type-check**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/app/\(app\)/layout.tsx frontend/app/\(app\)/page.tsx \
  frontend/components/nav/BottomNav.tsx frontend/components/nav/TopNav.tsx
git commit -m "feat: protected layout with auth guard and bottom/top nav"
```

---

## Task 9: AlertCard component

**Files:**
- Create: `frontend/components/alerts/AlertCard.tsx`

Reusable card shown on the home page and history page.

- [ ] **Step 1: Create `frontend/components/alerts/AlertCard.tsx`**

```tsx
import { Chip } from "@heroui/react"
import type { Alert, Severity, DeliveryStatus } from "~/lib/types"
import { toKhmerNumerals } from "~/lib/khmer"

const SEVERITY_BADGE: Record<Severity, { label: string; color: "danger" | "warning" | "default" }> = {
  critical: { label: "🚨 សំខាន់", color: "danger" },
  important: { label: "⚠️ យកចិត្តទុកដាក់", color: "warning" },
  info: { label: "ℹ️ ព័ត៌មាន", color: "default" },
}

const STATUS_CHIP: Record<DeliveryStatus, { label: string; color: "success" | "warning" | "danger" }> = {
  sent: { label: "បានផ្ញើ", color: "success" },
  pending: { label: "កំពុងរង់ចាំ", color: "warning" },
  failed: { label: "បរាជ័យ", color: "danger" },
}

interface Props {
  alert: Alert
  titleKh: string
  severity: Severity
  batchLabel: string
  dayOffset: number
  showDate?: boolean
}

export function AlertCard({ alert, titleKh, severity, batchLabel, dayOffset, showDate }: Props) {
  const badge = SEVERITY_BADGE[severity]
  const status = STATUS_CHIP[alert.delivery_status]

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
      severity === "critical" ? "border-red-500" :
      severity === "important" ? "border-yellow-400" : "border-gray-300"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Chip size="sm" color={badge.color} variant="flat" className="mb-2">
            {badge.label}
          </Chip>
          <p className="font-medium text-gray-900 text-sm">{titleKh}</p>
          <p className="text-xs text-gray-500 mt-1">
            Batch #{batchLabel} · ថ្ងៃទី {toKhmerNumerals(dayOffset)}
          </p>
          {showDate && (
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(alert.scheduled_for).toLocaleDateString("km-KH")}
            </p>
          )}
        </div>
        <Chip size="sm" color={status.color} variant="dot">
          {status.label}
        </Chip>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/components/alerts/AlertCard.tsx
git commit -m "feat: AlertCard component with severity and delivery status"
```

---

## Task 10: Home page — today's alerts

**Files:**
- Modify: `frontend/app/(app)/page.tsx`

The home page fetches today's alerts, resolves rule + asset names from the response, and renders them sorted by severity (critical → important → info).

Note: `GET /api/alerts` (no params) returns today's alerts. Each alert has `asset_id` and `rule_id` as ObjectId hex strings. To show the rule title and batch label, the page also fetches the assets and rules lists and joins them client-side (simple — family farm has ≤10 batches).

- [ ] **Step 1: Replace `frontend/app/(app)/page.tsx`**

```tsx
"use client"
import { useEffect, useState } from "react"
import { api } from "~/lib/api-client"
import { AlertCard } from "~/components/alerts/AlertCard"
import { formatKhmerDate } from "~/lib/khmer"
import type { Alert, Asset, Rule, Severity } from "~/lib/types"

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, important: 1, info: 2 }

export default function HomePage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.alerts.today(), api.assets.list(), api.rules.list()])
      .then(([a, b, r]) => {
        setAlerts(a.alerts)
        setAssets(b.assets)
        setRules(r.rules)
      })
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString()
  const sorted = [...alerts].sort(
    (a, b) => {
      const ra = rules.find((r) => r._id === a.rule_id)
      const rb = rules.find((r) => r._id === b.rule_id)
      return (SEVERITY_ORDER[ra?.severity ?? "info"] ?? 2) -
             (SEVERITY_ORDER[rb?.severity ?? "info"] ?? 2)
    },
  )

  if (loading) return <div className="py-8 text-center text-gray-400">កំពុងផ្ទុក...</div>

  return (
    <div>
      <h1 className="text-base font-semibold text-gray-700 mb-4">
        {formatKhmerDate(today)}
      </h1>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
          <span className="text-5xl">🐔</span>
          <p className="text-sm">គ្មានការជូនដំណឹងថ្ងៃនេះ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((alert) => {
            const rule = rules.find((r) => r._id === alert.rule_id)
            const asset = assets.find((a) => a._id === alert.asset_id)
            const batchLabel = asset ? asset._id.slice(-6).toUpperCase() : "??????"
            return (
              <AlertCard
                key={alert._id}
                alert={alert}
                titleKh={rule?.title_kh ?? "—"}
                severity={rule?.severity ?? "info"}
                batchLabel={batchLabel}
                dayOffset={rule?.day_offset ?? 0}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

With backend running and at least one seeded alert for today, open `http://localhost:3000`. Expected: today's date in Khmer as heading, alert cards sorted by severity. Empty state message if no alerts today.

- [ ] **Step 3: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/app/\(app\)/page.tsx
git commit -m "feat: home page showing today's alerts sorted by severity"
```

---

## Task 11: BatchCard + Batches list page

**Files:**
- Create: `frontend/components/batches/BatchCard.tsx`
- Create: `frontend/app/(app)/batches/page.tsx`

- [ ] **Step 1: Create `frontend/components/batches/BatchCard.tsx`**

```tsx
import Link from "next/link"
import { Chip } from "@heroui/react"
import type { Asset } from "~/lib/types"
import { toKhmerNumerals, formatKhmerDate } from "~/lib/khmer"
import { daysOld } from "~/lib/dates"

const BREED_KH: Record<string, string> = {
  broiler: "ប្រ៉ូអ៊ីលែ",
  layer: "ស្រទាប់",
  local: "មូលដ្ឋាន",
}

interface Props {
  asset: Asset
}

export function BatchCard({ asset }: Props) {
  const label = asset._id.slice(-6).toUpperCase()
  const age = daysOld(asset.arrival_date)

  return (
    <Link href={`/batches/${asset._id}`} className="block">
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900">Batch #{label}</span>
          <Chip size="sm" color="success" variant="flat">សកម្ម</Chip>
        </div>
        <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-600">
          <div>
            <span className="text-xs text-gray-400">ពូជ</span>
            <p>{BREED_KH[asset.breed] ?? asset.breed}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">អាយុ</span>
            <p>ថ្ងៃទី {toKhmerNumerals(age)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">ចំនួន</span>
            <p>{toKhmerNumerals(asset.quantity_current)} / {toKhmerNumerals(asset.quantity_initial)} ក្បាល</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">ថ្ងៃប្រមូលផល</span>
            <p className="text-xs">{formatKhmerDate(asset.expected_harvest_date)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create `frontend/app/(app)/batches/page.tsx`**

```tsx
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@heroui/react"
import { api } from "~/lib/api-client"
import { BatchCard } from "~/components/batches/BatchCard"
import type { Asset } from "~/lib/types"

export default function BatchesPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.assets.list("active")
      .then((r) => setAssets(r.assets))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 text-center text-gray-400">កំពុងផ្ទុក...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-semibold text-gray-700">ហ្វូងមាន់</h1>
        <Button as={Link} href="/batches/new" color="success" size="sm">
          + បន្ថែមហ្វូង
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
          <span className="text-5xl">🐔</span>
          <p className="text-sm">មិនទាន់មានហ្វូងមាន់</p>
          <Button as={Link} href="/batches/new" color="success" size="sm" variant="flat">
            ចុះឈ្មោះហ្វូងដំបូង
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {assets.map((a) => <BatchCard key={a._id} asset={a} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/batches`. Expected: list of active batch cards with breed, age, quantity, harvest date. Empty state if no active batches.

- [ ] **Step 4: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/components/batches/BatchCard.tsx frontend/app/\(app\)/batches/page.tsx
git commit -m "feat: batch list page and BatchCard component"
```

---

## Task 12: New batch form

**Files:**
- Create: `frontend/components/batches/BatchForm.tsx`
- Create: `frontend/app/(app)/batches/new/page.tsx`

- [ ] **Step 1: Create `frontend/components/batches/BatchForm.tsx`**

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react"
import { api } from "~/lib/api-client"

const BREEDS = [
  { key: "broiler", label: "ប្រ៉ូអ៊ីលែ" },
  { key: "layer", label: "ស្រទាប់" },
  { key: "local", label: "មូលដ្ឋាន" },
]

export function BatchForm() {
  const router = useRouter()
  const [breed, setBreed] = useState("broiler")
  const [quantity, setQuantity] = useState("")
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 1) {
      setError("ចំនួនត្រូវតែជាលេខធំជាង ០")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.assets.create({
        type: "chicken",
        breed,
        quantity_initial: qty,
        arrival_date: arrivalDate,
        notes,
      })
      router.push("/batches")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "មានបញ្ហា")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        isReadOnly
        label="ប្រភេទ"
        value="មាន់"
        variant="bordered"
      />

      <Select
        label="ពូជ"
        selectedKeys={[breed]}
        onSelectionChange={(keys) => setBreed(Array.from(keys)[0] as string)}
        variant="bordered"
      >
        {BREEDS.map((b) => <SelectItem key={b.key}>{b.label}</SelectItem>)}
      </Select>

      <Input
        label="ចំនួន (ក្បាល)"
        type="number"
        min="1"
        value={quantity}
        onValueChange={setQuantity}
        variant="bordered"
        isRequired
      />

      <Input
        label="កាលបរិច្ឆេទមកដល់"
        type="date"
        value={arrivalDate}
        onValueChange={setArrivalDate}
        variant="bordered"
        isRequired
      />

      <Textarea
        label="កំណត់ចំណាំ"
        value={notes}
        onValueChange={setNotes}
        variant="bordered"
        minRows={2}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="flat"
          className="flex-1"
          onPress={() => router.push("/batches")}
        >
          បោះបង់
        </Button>
        <Button type="submit" color="success" className="flex-1" isLoading={saving}>
          ចុះឈ្មោះ
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create `frontend/app/(app)/batches/new/page.tsx`**

```tsx
import { BatchForm } from "~/components/batches/BatchForm"

export default function NewBatchPage() {
  return (
    <div>
      <h1 className="text-base font-semibold text-gray-700 mb-4">ចុះឈ្មោះហ្វូងថ្មី</h1>
      <BatchForm />
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/batches/new`. Expected: form with breed dropdown, quantity, date picker, notes, cancel + submit buttons. Submit with a past arrival date (e.g. 8 days ago) and watch the backend run a backfill — batch should appear in `/batches`.

- [ ] **Step 4: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/components/batches/BatchForm.tsx frontend/app/\(app\)/batches/new/page.tsx
git commit -m "feat: new batch registration form"
```

---

## Task 13: Batch detail page — timeline + edit modal

**Files:**
- Create: `frontend/components/batches/LifecycleTimeline.tsx`
- Create: `frontend/components/batches/BatchEditModal.tsx`
- Create: `frontend/app/(app)/batches/[id]/page.tsx`

- [ ] **Step 1: Create `frontend/components/batches/LifecycleTimeline.tsx`**

```tsx
import type { Rule } from "~/lib/types"
import { toKhmerNumerals } from "~/lib/khmer"

interface Props {
  rules: Rule[]
  ageToday: number
}

export function LifecycleTimeline({ rules, ageToday }: Props) {
  const sorted = [...rules].sort((a, b) => a.day_offset - b.day_offset)

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex items-end gap-4 pb-3 min-w-max">
        {sorted.map((rule) => {
          const isPast = rule.day_offset < ageToday
          const isToday = rule.day_offset === ageToday
          const isFuture = rule.day_offset > ageToday

          return (
            <div key={rule._id} className="flex flex-col items-center gap-1 w-10">
              <span className="text-xs text-gray-500 text-center leading-tight line-clamp-2">
                {rule.title_kh}
              </span>
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isToday
                    ? "bg-green-500 border-green-500"
                    : isPast
                    ? "bg-gray-300 border-gray-300"
                    : "bg-white border-gray-300"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isToday ? "text-green-600" : isFuture ? "text-gray-400" : "text-gray-400"
                }`}
              >
                {toKhmerNumerals(rule.day_offset)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/components/batches/BatchEditModal.tsx`**

```tsx
"use client"
import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react"
import { api } from "~/lib/api-client"
import type { Asset } from "~/lib/types"

interface Props {
  asset: Asset
  isOpen: boolean
  onClose: () => void
  onSaved: (updated: Asset) => void
}

export function BatchEditModal({ asset, isOpen, onClose, onSaved }: Props) {
  const [quantity, setQuantity] = useState(String(asset.quantity_current))
  const [notes, setNotes] = useState(asset.notes)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 0) {
      setError("ចំនួនត្រូវតែជាលេខ")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { asset: updated } = await api.assets.patch(asset._id, {
        quantity_current: qty,
        notes,
      })
      onSaved(updated)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "មានបញ្ហា")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>កែប្រែព័ត៌មានហ្វូង</ModalHeader>
        <ModalBody className="flex flex-col gap-3">
          <Input
            label="ចំនួនបច្ចុប្បន្ន (ក្បាល)"
            type="number"
            min="0"
            value={quantity}
            onValueChange={setQuantity}
            variant="bordered"
          />
          <Textarea
            label="កំណត់ចំណាំ"
            value={notes}
            onValueChange={setNotes}
            variant="bordered"
            minRows={2}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>បោះបង់</Button>
          <Button color="success" isLoading={saving} onPress={handleSave}>រក្សាទុក</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
```

- [ ] **Step 3: Create `frontend/app/(app)/batches/[id]/page.tsx`**

```tsx
"use client"
import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button, Chip, useDisclosure } from "@heroui/react"
import { api } from "~/lib/api-client"
import { AlertCard } from "~/components/alerts/AlertCard"
import { LifecycleTimeline } from "~/components/batches/LifecycleTimeline"
import { BatchEditModal } from "~/components/batches/BatchEditModal"
import { toKhmerNumerals, formatKhmerDate } from "~/lib/khmer"
import { daysOld } from "~/lib/dates"
import type { Asset, Alert, Rule } from "~/lib/types"

const BREED_KH: Record<string, string> = {
  broiler: "ប្រ៉ូអ៊ីលែ",
  layer: "ស្រទាប់",
  local: "មូលដ្ឋាន",
}

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [asset, setAsset] = useState<Asset | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.assets.get(id),
      api.alerts.forAsset(id),
      api.rules.list("chicken"),
    ])
      .then(([a, al, r]) => {
        setAsset(a.asset)
        setAlerts(al.alerts)
        setRules(r.rules)
      })
      .catch(() => router.push("/batches"))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleArchive() {
    if (!confirm("ចង់ដកហ្វូងនេះចេញមែនទេ?")) return
    setArchiving(true)
    try {
      await api.assets.archive(id)
      router.push("/batches")
    } catch {
      setArchiving(false)
    }
  }

  if (loading || !asset) return <div className="py-8 text-center text-gray-400">កំពុងផ្ទុក...</div>

  const label = asset._id.slice(-6).toUpperCase()
  const age = daysOld(asset.arrival_date)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-gray-900">Batch #{label}</h1>
          <Chip color="success" size="sm" variant="flat">សកម្ម</Chip>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
          <div><p className="text-xs text-gray-400">ពូជ</p><p>{BREED_KH[asset.breed] ?? asset.breed}</p></div>
          <div><p className="text-xs text-gray-400">អាយុ</p><p>ថ្ងៃទី {toKhmerNumerals(age)}</p></div>
          <div><p className="text-xs text-gray-400">ចំនួន</p><p>{toKhmerNumerals(asset.quantity_current)} ក្បាល</p></div>
          <div><p className="text-xs text-gray-400">ថ្ងៃប្រមូលផល</p><p className="text-xs">{formatKhmerDate(asset.expected_harvest_date)}</p></div>
          <div className="col-span-2"><p className="text-xs text-gray-400">ថ្ងៃមកដល់</p><p className="text-xs">{formatKhmerDate(asset.arrival_date)}</p></div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="flat" color="primary" onPress={onOpen} className="flex-1">
            កែប្រែ
          </Button>
          <Button size="sm" variant="flat" color="danger" isLoading={archiving} onPress={handleArchive} className="flex-1">
            ដកចេញ
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">កាលវិភាគ</h2>
        <LifecycleTimeline rules={rules} ageToday={age} />
      </div>

      {/* Alert history */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">ប្រវត្តិការជូនដំណឹង</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400">មិនទាន់មានការជូនដំណឹង</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => {
              const rule = rules.find((r) => r._id === alert.rule_id)
              return (
                <AlertCard
                  key={alert._id}
                  alert={alert}
                  titleKh={rule?.title_kh ?? "—"}
                  severity={rule?.severity ?? "info"}
                  batchLabel={label}
                  dayOffset={rule?.day_offset ?? 0}
                  showDate
                />
              )
            })}
          </div>
        )}
      </div>

      {asset && (
        <BatchEditModal
          asset={asset}
          isOpen={isOpen}
          onClose={onClose}
          onSaved={setAsset}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Open a batch detail page (navigate from `/batches`). Expected: header with breed/age/quantity/dates, horizontal scrollable timeline with rule dots coloured past/today/future, edit button opens modal and saves changes, archive button with confirmation dialog.

- [ ] **Step 5: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/components/batches/LifecycleTimeline.tsx \
  frontend/components/batches/BatchEditModal.tsx \
  frontend/app/\(app\)/batches/\[id\]/page.tsx
git commit -m "feat: batch detail page with lifecycle timeline and edit modal"
```

---

## Task 14: Alert history page

**Files:**
- Create: `frontend/app/(app)/alerts/page.tsx`

- [ ] **Step 1: Create `frontend/app/(app)/alerts/page.tsx`**

```tsx
"use client"
import { useEffect, useState } from "react"
import { Select, SelectItem } from "@heroui/react"
import { api } from "~/lib/api-client"
import { AlertCard } from "~/components/alerts/AlertCard"
import type { Alert, Asset, Rule } from "~/lib/types"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [filterAssetId, setFilterAssetId] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.alerts.history(30), api.assets.list(), api.rules.list()])
      .then(([al, a, r]) => {
        setAlerts(al.alerts)
        setAssets(a.assets)
        setRules(r.rules)
      })
      .finally(() => setLoading(false))
  }, [])

  const displayed =
    filterAssetId === "all" ? alerts : alerts.filter((a) => a.asset_id === filterAssetId)

  if (loading) return <div className="py-8 text-center text-gray-400">កំពុងផ្ទុក...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-semibold text-gray-700">ប្រវត្តិការជូនដំណឹង</h1>
      </div>

      {assets.length > 0 && (
        <Select
          label="ត្រង​តាម​ហ្វូង"
          selectedKeys={[filterAssetId]}
          onSelectionChange={(keys) => setFilterAssetId(Array.from(keys)[0] as string)}
          variant="bordered"
          size="sm"
          className="mb-4"
        >
          {[
            <SelectItem key="all">ហ្វូងទាំងអស់</SelectItem>,
            ...assets.map((a) => (
              <SelectItem key={a._id}>
                Batch #{a._id.slice(-6).toUpperCase()}
              </SelectItem>
            )),
          ]}
        </Select>
      )}

      {displayed.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">គ្មានការជូនដំណឹង</p>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((alert) => {
            const rule = rules.find((r) => r._id === alert.rule_id)
            const asset = assets.find((a) => a._id === alert.asset_id)
            const batchLabel = asset ? asset._id.slice(-6).toUpperCase() : "??????"
            return (
              <AlertCard
                key={alert._id}
                alert={alert}
                titleKh={rule?.title_kh ?? "—"}
                severity={rule?.severity ?? "info"}
                batchLabel={batchLabel}
                dayOffset={rule?.day_offset ?? 0}
                showDate
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/alerts`. Expected: last 30 days of alerts with optional batch filter dropdown.

- [ ] **Step 3: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/app/\(app\)/alerts/page.tsx
git commit -m "feat: alert history page with batch filter"
```

---

## Task 15: Users management page

**Files:**
- Create: `frontend/components/users/UserTable.tsx`
- Create: `frontend/components/users/AddUserModal.tsx`
- Create: `frontend/app/(app)/users/page.tsx`

- [ ] **Step 1: Create `frontend/components/users/AddUserModal.tsx`**

```tsx
"use client"
import { useState } from "react"
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Switch,
} from "@heroui/react"
import { api } from "~/lib/api-client"

interface Props {
  isOpen: boolean
  onClose: () => void
  onAdded: () => void
}

export function AddUserModal({ isOpen, onClose, onAdded }: Props) {
  const [telegramId, setTelegramId] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [approved, setApproved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    const tid = parseInt(telegramId, 10)
    if (isNaN(tid)) { setError("Telegram ID ត្រូវតែជាលេខ"); return }
    if (!displayName.trim()) { setError("ត្រូវការឈ្មោះ"); return }
    setSaving(true)
    setError(null)
    try {
      await api.users.create({ telegram_id: tid, display_name: displayName.trim(), approved })
      setTelegramId("")
      setDisplayName("")
      setApproved(false)
      onAdded()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "មានបញ្ហា")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>បន្ថែមអ្នកប្រើ</ModalHeader>
        <ModalBody className="flex flex-col gap-3">
          <Input
            label="Telegram ID"
            type="number"
            value={telegramId}
            onValueChange={setTelegramId}
            variant="bordered"
            isRequired
          />
          <Input
            label="ឈ្មោះ"
            value={displayName}
            onValueChange={setDisplayName}
            variant="bordered"
            isRequired
          />
          <div className="flex items-center gap-3">
            <Switch isSelected={approved} onValueChange={setApproved} color="success" size="sm" />
            <span className="text-sm text-gray-600">អនុញ្ញាតឱ្យចូលប្រើ</span>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>បោះបង់</Button>
          <Button color="success" isLoading={saving} onPress={handleAdd}>បន្ថែម</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
```

- [ ] **Step 2: Create `frontend/components/users/UserTable.tsx`**

```tsx
import { Button, Chip } from "@heroui/react"
import type { ManagedUser } from "~/lib/types"

interface Props {
  users: ManagedUser[]
  currentUserId: string
  onRemove: (id: string) => void
}

export function UserTable({ users, currentUserId, onRemove }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {users.map((u) => (
        <div key={u._id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{u.display_name}</p>
            <p className="text-xs text-gray-500">@{u.telegram_username || u.telegram_id}</p>
          </div>
          <Chip
            size="sm"
            color={u.approved ? "success" : "default"}
            variant="flat"
          >
            {u.approved ? "អនុញ្ញាត" : "មិនអនុញ្ញាត"}
          </Chip>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isDisabled={u._id === currentUserId}
            onPress={() => onRemove(u._id)}
          >
            លុប
          </Button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `frontend/app/(app)/users/page.tsx`**

```tsx
"use client"
import { useEffect, useState } from "react"
import { Button, useDisclosure } from "@heroui/react"
import { api } from "~/lib/api-client"
import { UserTable } from "~/components/users/UserTable"
import { AddUserModal } from "~/components/users/AddUserModal"
import { useAuth } from "~/context/auth"
import type { ManagedUser } from "~/lib/types"

export default function UsersPage() {
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)

  function refresh() {
    return api.users.list().then((r) => setUsers(r.users))
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function handleRemove(id: string) {
    if (!confirm("ចង់លុបអ្នកប្រើនេះមែនទេ?")) return
    try {
      await api.users.remove(id)
      setUsers((prev) => prev.filter((u) => u._id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "មានបញ្ហា")
    }
  }

  if (loading) return <div className="py-8 text-center text-gray-400">កំពុងផ្ទុក...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-semibold text-gray-700">អ្នកប្រើ</h1>
        <Button color="success" size="sm" onPress={onOpen}>
          + បន្ថែម
        </Button>
      </div>

      <UserTable
        users={users}
        currentUserId={user?.id ?? ""}
        onRemove={handleRemove}
      />

      <AddUserModal isOpen={isOpen} onClose={onClose} onAdded={refresh} />
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000/users`. Expected: list of users with approved status chip and remove button (disabled for own account). "+" button opens modal to add a new user with approved toggle.

- [ ] **Step 5: Full type-check**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/frontend && bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Run frontend utility tests**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git add frontend/components/users/UserTable.tsx \
  frontend/components/users/AddUserModal.tsx \
  frontend/app/\(app\)/users/page.tsx
git commit -m "feat: user management page with add/remove and approved toggle"
```

---

## Done

All 15 tasks complete. The frontend is fully wired to the backend. Manual end-to-end test: log in with a real Telegram account that has `approved: true` in the database, register a batch with a past arrival date, watch the backfill alerts appear, navigate all 4 tabs.
