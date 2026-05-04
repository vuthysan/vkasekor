# SmartFarm Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Hono + Bun + MongoDB backend that powers SmartFarm V1 — a daily Telegram alerting system for chicken-batch lifecycle management, with REST API endpoints for the Next.js frontend.

**Architecture:** Single Hono server hosting (1) REST API for the frontend, (2) a daily cron worker that matches active assets against MAFF rules and sends Khmer Telegram messages, and (3) Telegram Login Widget hash verification for auth. All three share one MongoDB connection. JWT (HTTP-only cookie) for session.

**Tech Stack:** Bun runtime, Hono web framework, MongoDB (official Node driver), Zod for validation, `node-cron` for scheduling, `mongodb-memory-server` for integration tests.

**Source spec:** `docs/superpowers/specs/2026-05-04-smartfarm-design.md`

---

## File Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── src/
│   ├── index.ts                       # Hono entry + cron registration + DB connect
│   ├── types.ts                       # Shared TS types matching the data model
│   ├── env.ts                         # Validated env loader (Zod)
│   ├── lib/
│   │   ├── db.ts                      # MongoClient singleton + collections accessor
│   │   ├── lifecycle.ts               # Day math (Asia/Phnom_Penh)
│   │   ├── khmer-formatter.ts         # Render alert message in Khmer
│   │   ├── khmer-numerals.ts          # 0-9 → ០-៩
│   │   ├── telegram.ts                # Login Widget verify + sendMessage
│   │   ├── rule-matcher.ts            # Find rules matching an asset's age
│   │   └── jwt.ts                     # Sign/verify JWT
│   ├── middleware/
│   │   └── auth.ts                    # Hono middleware: read cookie, attach user
│   ├── routes/
│   │   ├── auth.ts                    # POST /api/auth/telegram, POST /api/auth/logout
│   │   ├── assets.ts                  # CRUD /api/assets
│   │   ├── users.ts                   # CRUD /api/admin/users (admin role only)
│   │   └── alerts.ts                  # GET /api/alerts (read-only)
│   ├── cron/
│   │   └── daily-check.ts             # 07:00 ICT job
│   ├── seeds/
│   │   └── maff-chicken-rules.ts      # Encoded rules from MAFF PDF
│   └── scripts/
│       ├── setup-indexes.ts           # Create MongoDB indexes
│       └── seed-rules.ts              # Run rule seed
└── tests/
    ├── lib/
    │   ├── lifecycle.test.ts
    │   ├── khmer-numerals.test.ts
    │   ├── khmer-formatter.test.ts
    │   ├── telegram.test.ts
    │   ├── rule-matcher.test.ts
    │   └── jwt.test.ts
    └── integration/
        ├── helpers.ts                 # Spin up in-memory Mongo + Hono app
        ├── auth.test.ts
        ├── assets.test.ts
        ├── users.test.ts
        ├── alerts.test.ts
        └── daily-check.test.ts
```

Each file has one clear responsibility. The `lib/` folder contains pure-function units that the routes and cron compose. Tests live alongside in mirroring paths. The integration test helper centralizes the in-memory Mongo + Hono app setup so each integration test stays focused on behavior.

---

## Task 1: Project initialization

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.gitignore`
- Create: `backend/.env.example`
- Create: `backend/src/index.ts`

- [ ] **Step 1: Initialize Bun project**

```bash
mkdir -p /Users/sanvuthy/my-projects/kasekor-helper/backend
cd /Users/sanvuthy/my-projects/kasekor-helper/backend
bun init -y
```

- [ ] **Step 2: Replace `package.json` with the project's actual deps**

```json
{
  "name": "smartfarm-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "setup-indexes": "bun run src/scripts/setup-indexes.ts",
    "seed": "bun run src/scripts/seed-rules.ts"
  },
  "dependencies": {
    "hono": "^4.6.0",
    "mongodb": "^6.10.0",
    "zod": "^3.23.8",
    "jose": "^5.9.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node-cron": "^3.0.11",
    "mongodb-memory-server": "^10.1.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 3: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["bun-types"],
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules
.env
.env.local
bun.lockb
.DS_Store
*.log
dist
coverage
```

- [ ] **Step 5: Create `.env.example`**

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/smartfarm

# Telegram
BOT_TOKEN=
TELEGRAM_GROUP_ID=

# Auth
JWT_SECRET=

# Server
PORT=8080
TZ=Asia/Phnom_Penh
NODE_ENV=development
```

- [ ] **Step 6: Replace `src/index.ts` with health-only stub**

```ts
import { Hono } from "hono"

const app = new Hono()

app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }))

const port = Number(process.env.PORT ?? 8080)

export default {
  port,
  fetch: app.fetch,
}
```

- [ ] **Step 7: Install dependencies**

```bash
bun install
```

Expected output: lockfile generated, no errors.

- [ ] **Step 8: Smoke test**

```bash
bun run src/index.ts &
sleep 1
curl -s http://localhost:8080/health
kill %1
```

Expected: `{"ok":true,"ts":"..."}`.

- [ ] **Step 9: Commit**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper
git init
git add backend/package.json backend/tsconfig.json backend/.gitignore backend/.env.example backend/src/index.ts
git commit -m "feat(backend): scaffold Hono + Bun project with health endpoint"
```

---

## Task 2: Env loader

**Files:**
- Create: `backend/src/env.ts`
- Create: `backend/tests/lib/env.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/env.test.ts
import { describe, expect, it } from "bun:test"
import { loadEnv } from "~/env"

describe("loadEnv", () => {
  it("returns parsed env when all required vars present", () => {
    const env = loadEnv({
      MONGODB_URI: "mongodb://x/y",
      BOT_TOKEN: "abc",
      TELEGRAM_GROUP_ID: "-100123",
      JWT_SECRET: "s".repeat(32),
      PORT: "8080",
      NODE_ENV: "test",
    })
    expect(env.MONGODB_URI).toBe("mongodb://x/y")
    expect(env.PORT).toBe(8080)
  })

  it("throws when JWT_SECRET is shorter than 32 chars", () => {
    expect(() =>
      loadEnv({
        MONGODB_URI: "mongodb://x/y",
        BOT_TOKEN: "abc",
        TELEGRAM_GROUP_ID: "-100123",
        JWT_SECRET: "short",
        PORT: "8080",
        NODE_ENV: "test",
      }),
    ).toThrow()
  })

  it("throws when BOT_TOKEN is missing", () => {
    expect(() =>
      loadEnv({
        MONGODB_URI: "mongodb://x/y",
        TELEGRAM_GROUP_ID: "-100123",
        JWT_SECRET: "s".repeat(32),
        PORT: "8080",
        NODE_ENV: "test",
      } as any),
    ).toThrow()
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
bun test tests/lib/env.test.ts
```

Expected: FAIL — module `~/env` not found.

- [ ] **Step 3: Implement `src/env.ts`**

```ts
import { z } from "zod"

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  BOT_TOKEN: z.string().min(1),
  TELEGRAM_GROUP_ID: z.string().regex(/^-?\d+$/, "must be integer chat id"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

export type Env = z.infer<typeof EnvSchema>

export function loadEnv(source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): Env {
  return EnvSchema.parse(source)
}

export const env = loadEnv()
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
bun test tests/lib/env.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/env.ts backend/tests/lib/env.test.ts
git commit -m "feat(backend): add validated env loader"
```

---

## Task 3: Type definitions

**Files:**
- Create: `backend/src/types.ts`

- [ ] **Step 1: Create `src/types.ts`**

```ts
import type { ObjectId } from "mongodb"

export type Role = "admin" | "member"

export interface User {
  _id: ObjectId
  telegram_id: number
  telegram_username: string
  display_name: string
  role: Role
  created_at: Date
  last_login_at: Date
}

export type AssetType = "chicken"
export type Breed = "broiler" | "layer" | "local"
export type AssetStatus = "active" | "harvested" | "archived"

export interface Asset {
  _id: ObjectId
  type: AssetType
  breed: Breed
  quantity_initial: number
  quantity_current: number
  arrival_date: Date
  expected_harvest_date: Date
  status: AssetStatus
  notes: string
  created_by: ObjectId
  created_at: Date
  updated_at: Date
}

export type RuleCategory = "vaccine" | "feed" | "health" | "housing" | "harvest"
export type Severity = "critical" | "important" | "info"

export interface Rule {
  _id: ObjectId
  asset_type: AssetType
  day_offset: number
  category: RuleCategory
  severity: Severity
  title_kh: string
  title_en: string
  instructions_kh: string
  instructions_en: string
  source_page: number
}

export type DeliveryStatus = "pending" | "sent" | "failed"

export interface Alert {
  _id: ObjectId
  asset_id: ObjectId
  rule_id: ObjectId
  scheduled_for: Date
  sent_at: Date | null
  delivery_status: DeliveryStatus
  telegram_message_id: number | null
  error: string | null
  attempt_count: number
}

export interface SystemRecord {
  _id: ObjectId
  key: "last_cron_run"
  value: Date
}

export interface SessionPayload {
  user_id: string
  telegram_id: number
  role: Role
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd /Users/sanvuthy/my-projects/kasekor-helper/backend
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/types.ts
git commit -m "feat(backend): define data-model types"
```

---

## Task 4: MongoDB connection module

**Files:**
- Create: `backend/src/lib/db.ts`

- [ ] **Step 1: Implement `src/lib/db.ts`**

```ts
import { MongoClient, Db, Collection } from "mongodb"
import type { User, Asset, Rule, Alert, SystemRecord } from "~/types"

let client: MongoClient | null = null
let db: Db | null = null

export async function connectDb(uri: string, dbName?: string): Promise<Db> {
  if (db) return db
  client = new MongoClient(uri)
  await client.connect()
  db = client.db(dbName)
  return db
}

export async function disconnectDb(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

export function getDb(): Db {
  if (!db) throw new Error("DB not connected — call connectDb first")
  return db
}

export const collections = {
  users: () => getDb().collection<User>("users"),
  assets: () => getDb().collection<Asset>("assets"),
  rules: () => getDb().collection<Rule>("rules"),
  alerts: () => getDb().collection<Alert>("alerts"),
  system: () => getDb().collection<SystemRecord>("system"),
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/lib/db.ts
git commit -m "feat(backend): add MongoDB connection module"
```

---

## Task 5: Index setup script

**Files:**
- Create: `backend/src/scripts/setup-indexes.ts`

- [ ] **Step 1: Implement the script**

```ts
import { connectDb, collections, disconnectDb } from "~/lib/db"
import { env } from "~/env"

async function setupIndexes() {
  await connectDb(env.MONGODB_URI)

  await collections.users().createIndex({ telegram_id: 1 }, { unique: true })

  await collections.assets().createIndex({ status: 1 })
  await collections.assets().createIndex({ type: 1, status: 1 })

  await collections.rules().createIndex({ asset_type: 1, day_offset: 1 })

  await collections.alerts().createIndex(
    { asset_id: 1, rule_id: 1, scheduled_for: 1 },
    { unique: true },
  )
  await collections.alerts().createIndex({ delivery_status: 1, scheduled_for: 1 })

  await collections.system().createIndex({ key: 1 }, { unique: true })

  console.log("indexes created")
  await disconnectDb()
}

setupIndexes().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/scripts/setup-indexes.ts
git commit -m "feat(backend): add index setup script"
```

---

## Task 6: Lifecycle utilities (Asia/Phnom_Penh day math)

**Files:**
- Create: `backend/src/lib/lifecycle.ts`
- Create: `backend/tests/lib/lifecycle.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/lifecycle.test.ts
import { describe, expect, it } from "bun:test"
import { startOfDayInPhnomPenh, daysBetween, addDays } from "~/lib/lifecycle"

describe("startOfDayInPhnomPenh", () => {
  it("returns 00:00:00 ICT (UTC+7) for a given UTC instant", () => {
    // 2026-05-04 03:30 UTC = 2026-05-04 10:30 ICT → start of day = 2026-05-03 17:00 UTC
    const input = new Date("2026-05-04T03:30:00Z")
    const result = startOfDayInPhnomPenh(input)
    expect(result.toISOString()).toBe("2026-05-03T17:00:00.000Z")
  })

  it("handles instants late in the UTC day that fall on next ICT day", () => {
    // 2026-05-04 18:00 UTC = 2026-05-05 01:00 ICT → start of day = 2026-05-04 17:00 UTC
    const input = new Date("2026-05-04T18:00:00Z")
    const result = startOfDayInPhnomPenh(input)
    expect(result.toISOString()).toBe("2026-05-04T17:00:00.000Z")
  })
})

describe("daysBetween", () => {
  it("returns 0 for same ICT day", () => {
    const a = new Date("2026-05-04T00:00:00Z")
    const b = new Date("2026-05-04T23:00:00Z")
    expect(daysBetween(a, b)).toBe(0)
  })

  it("returns 7 for one week apart", () => {
    const a = startOfDayInPhnomPenh(new Date("2026-05-01T08:00:00Z"))
    const b = startOfDayInPhnomPenh(new Date("2026-05-08T08:00:00Z"))
    expect(daysBetween(a, b)).toBe(7)
  })

  it("returns negative when b is before a", () => {
    const a = startOfDayInPhnomPenh(new Date("2026-05-08T08:00:00Z"))
    const b = startOfDayInPhnomPenh(new Date("2026-05-01T08:00:00Z"))
    expect(daysBetween(a, b)).toBe(-7)
  })
})

describe("addDays", () => {
  it("adds N days preserving ICT start-of-day", () => {
    const start = startOfDayInPhnomPenh(new Date("2026-05-01T08:00:00Z"))
    const result = addDays(start, 60)
    expect(daysBetween(start, result)).toBe(60)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/lib/lifecycle.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/lifecycle.ts`**

```ts
const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

export function startOfDayInPhnomPenh(date: Date): Date {
  const ictMs = date.getTime() + ICT_OFFSET_MS
  const ictDate = new Date(ictMs)
  ictDate.setUTCHours(0, 0, 0, 0)
  return new Date(ictDate.getTime() - ICT_OFFSET_MS)
}

export function daysBetween(a: Date, b: Date): number {
  const aDay = startOfDayInPhnomPenh(a).getTime()
  const bDay = startOfDayInPhnomPenh(b).getTime()
  return Math.round((bDay - aDay) / (24 * 60 * 60 * 1000))
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export function enumerateDaysFrom(from: Date, to: Date): Date[] {
  const start = startOfDayInPhnomPenh(from)
  const end = startOfDayInPhnomPenh(to)
  const days: Date[] = []
  for (let d = start; d.getTime() <= end.getTime(); d = addDays(d, 1)) {
    days.push(d)
  }
  return days
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/lib/lifecycle.test.ts
```

Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/lifecycle.ts backend/tests/lib/lifecycle.test.ts
git commit -m "feat(backend): add ICT day-math utilities"
```

---

## Task 7: Khmer numerals helper

**Files:**
- Create: `backend/src/lib/khmer-numerals.ts`
- Create: `backend/tests/lib/khmer-numerals.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test"
import { toKhmerNumerals } from "~/lib/khmer-numerals"

describe("toKhmerNumerals", () => {
  it("converts 0-9 individually", () => {
    expect(toKhmerNumerals(0)).toBe("០")
    expect(toKhmerNumerals(7)).toBe("៧")
    expect(toKhmerNumerals(9)).toBe("៩")
  })

  it("converts multi-digit numbers", () => {
    expect(toKhmerNumerals(50)).toBe("៥០")
    expect(toKhmerNumerals(2026)).toBe("២០២៦")
  })

  it("accepts a string of digits", () => {
    expect(toKhmerNumerals("14")).toBe("១៤")
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/lib/khmer-numerals.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/khmer-numerals.ts`**

```ts
const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"]

export function toKhmerNumerals(input: number | string): string {
  return String(input).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)])
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/lib/khmer-numerals.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/khmer-numerals.ts backend/tests/lib/khmer-numerals.test.ts
git commit -m "feat(backend): add Khmer numerals helper"
```

---

## Task 8: Khmer message formatter

**Files:**
- Create: `backend/src/lib/khmer-formatter.ts`
- Create: `backend/tests/lib/khmer-formatter.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test"
import { ObjectId } from "mongodb"
import { formatAlertMessage } from "~/lib/khmer-formatter"
import type { Asset, Rule } from "~/types"

const asset: Asset = {
  _id: new ObjectId(),
  type: "chicken",
  breed: "broiler",
  quantity_initial: 50,
  quantity_current: 50,
  arrival_date: new Date("2026-04-27T17:00:00Z"),
  expected_harvest_date: new Date("2026-06-26T17:00:00Z"),
  status: "active",
  notes: "",
  created_by: new ObjectId(),
  created_at: new Date(),
  updated_at: new Date(),
}

const rule: Rule = {
  _id: new ObjectId(),
  asset_type: "chicken",
  day_offset: 7,
  category: "vaccine",
  severity: "critical",
  title_kh: "ចាក់វ៉ាក់សាំង Newcastle",
  title_en: "Newcastle vaccine",
  instructions_kh: "ត្រៀមវ៉ាក់សាំង Newcastle\nចាក់ដោយដក់ចូលក្នុងភ្នែក",
  instructions_en: "...",
  source_page: 12,
}

describe("formatAlertMessage", () => {
  it("renders day, batch, severity, quantity in Khmer numerals", () => {
    const out = formatAlertMessage({ asset, rule, batchLabel: "A1", catchUp: false })
    expect(out).toContain("ថ្ងៃទី ៧")
    expect(out).toContain("Batch #A1")
    expect(out).toContain("🚨 សំខាន់")
    expect(out).toContain("ចាក់វ៉ាក់សាំង Newcastle")
    expect(out).toContain("ចំនួនមាន់: ៥០ ក្បាល")
    expect(out).toContain("អាយុ: ៧ ថ្ងៃ")
    expect(out).toContain("MAFF ទំព័រ ១២")
    expect(out).not.toContain("ត្រួតឡើងវិញ")
  })

  it("adds catch-up prefix when flag is true", () => {
    const out = formatAlertMessage({ asset, rule, batchLabel: "A1", catchUp: true })
    expect(out).toContain("[ត្រួតឡើងវិញ]")
  })

  it("uses important badge for important severity", () => {
    const importantRule = { ...rule, severity: "important" as const }
    const out = formatAlertMessage({ asset, rule: importantRule, batchLabel: "A1", catchUp: false })
    expect(out).toContain("⚠️ យកចិត្តទុកដាក់")
  })

  it("uses info badge for info severity", () => {
    const infoRule = { ...rule, severity: "info" as const }
    const out = formatAlertMessage({ asset, rule: infoRule, batchLabel: "A1", catchUp: false })
    expect(out).toContain("ℹ️ ព័ត៌មាន")
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/lib/khmer-formatter.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/khmer-formatter.ts`**

```ts
import type { Asset, Rule, Severity } from "~/types"
import { toKhmerNumerals } from "~/lib/khmer-numerals"
import { daysBetween } from "~/lib/lifecycle"

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "🚨 សំខាន់",
  important: "⚠️ យកចិត្តទុកដាក់",
  info: "ℹ️ ព័ត៌មាន",
}

interface FormatArgs {
  asset: Asset
  rule: Rule
  batchLabel: string
  catchUp: boolean
}

export function formatAlertMessage({ asset, rule, batchLabel, catchUp }: FormatArgs): string {
  const ageDays = daysBetween(asset.arrival_date, new Date())
  const dayKh = toKhmerNumerals(rule.day_offset)
  const qtyKh = toKhmerNumerals(asset.quantity_current)
  const ageKh = toKhmerNumerals(Math.max(ageDays, rule.day_offset))
  const pageKh = toKhmerNumerals(rule.source_page)
  const badge = SEVERITY_BADGE[rule.severity]
  const prefix = catchUp ? "[ត្រួតឡើងវិញ] " : ""
  const instructions = rule.instructions_kh
    .split("\n")
    .map((line) => `• ${line}`)
    .join("\n")

  return [
    `${prefix}🐔 ថ្ងៃទី ${dayKh} — Batch #${batchLabel}`,
    "━━━━━━━━━━━━━━━━━━━━━",
    `[${badge}] ${rule.title_kh}`,
    "",
    `ចំនួនមាន់: ${qtyKh} ក្បាល`,
    `អាយុ: ${ageKh} ថ្ងៃ`,
    "",
    "📋 របៀបធ្វើ:",
    instructions,
    "",
    `📖 ប្រភព: MAFF ទំព័រ ${pageKh}`,
  ].join("\n")
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/lib/khmer-formatter.test.ts
```

Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/khmer-formatter.ts backend/tests/lib/khmer-formatter.test.ts
git commit -m "feat(backend): render alert messages in Khmer"
```

---

## Task 9: Telegram client (auth verify + sendMessage)

**Files:**
- Create: `backend/src/lib/telegram.ts`
- Create: `backend/tests/lib/telegram.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, beforeEach, mock } from "bun:test"
import { createHash, createHmac } from "node:crypto"
import { verifyTelegramLogin, sendTelegramMessage } from "~/lib/telegram"

const BOT_TOKEN = "123:ABCDEF"

function signTelegramPayload(fields: Record<string, string | number>) {
  const dataString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n")
  const secret = createHash("sha256").update(BOT_TOKEN).digest()
  return createHmac("sha256", secret).update(dataString).digest("hex")
}

describe("verifyTelegramLogin", () => {
  const baseFields = {
    id: 12345,
    first_name: "Test",
    username: "testuser",
    auth_date: Math.floor(Date.now() / 1000),
  }

  it("returns the payload when hash and timestamp are valid", () => {
    const hash = signTelegramPayload(baseFields)
    const result = verifyTelegramLogin({ ...baseFields, hash }, BOT_TOKEN)
    expect(result.id).toBe(12345)
  })

  it("throws on invalid hash", () => {
    expect(() =>
      verifyTelegramLogin({ ...baseFields, hash: "0".repeat(64) }, BOT_TOKEN),
    ).toThrow("invalid signature")
  })

  it("throws when auth_date is older than 24h", () => {
    const stale = { ...baseFields, auth_date: Math.floor(Date.now() / 1000) - 25 * 3600 }
    const hash = signTelegramPayload(stale)
    expect(() => verifyTelegramLogin({ ...stale, hash }, BOT_TOKEN)).toThrow("expired")
  })
})

describe("sendTelegramMessage", () => {
  beforeEach(() => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: true, result: { message_id: 9999 } }), { status: 200 }),
    ) as any
  })

  it("posts to sendMessage endpoint and returns parsed body", async () => {
    const result = await sendTelegramMessage({
      botToken: BOT_TOKEN,
      chatId: "-100123",
      text: "hi",
    })
    expect(result.ok).toBe(true)
    expect(result.result?.message_id).toBe(9999)
  })

  it("returns ok:false when API returns error", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: false, description: "blocked" }), { status: 400 }),
    ) as any
    const result = await sendTelegramMessage({ botToken: BOT_TOKEN, chatId: "-100123", text: "hi" })
    expect(result.ok).toBe(false)
    expect(result.description).toBe("blocked")
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/lib/telegram.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/telegram.ts`**

```ts
import { createHash, createHmac, timingSafeEqual } from "node:crypto"

export interface TelegramLoginPayload {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

const TWENTY_FOUR_HOURS_S = 24 * 60 * 60

export function verifyTelegramLogin(
  payload: TelegramLoginPayload,
  botToken: string,
  now: () => number = () => Math.floor(Date.now() / 1000),
): TelegramLoginPayload {
  const { hash, ...fields } = payload
  const dataString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${(fields as any)[k]}`)
    .join("\n")
  const secret = createHash("sha256").update(botToken).digest()
  const expected = createHmac("sha256", secret).update(dataString).digest("hex")
  const expectedBuf = Buffer.from(expected, "hex")
  const givenBuf = Buffer.from(hash, "hex")
  if (expectedBuf.length !== givenBuf.length || !timingSafeEqual(expectedBuf, givenBuf)) {
    throw new Error("invalid signature")
  }
  if (now() - payload.auth_date > TWENTY_FOUR_HOURS_S) {
    throw new Error("expired")
  }
  return payload
}

export interface SendMessageArgs {
  botToken: string
  chatId: string
  text: string
  parseMode?: "HTML" | "MarkdownV2"
}

export interface TelegramSendResult {
  ok: boolean
  result?: { message_id: number }
  description?: string
  error_code?: number
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  text,
  parseMode = "HTML",
}: SendMessageArgs): Promise<TelegramSendResult> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_notification: false,
    }),
  })
  return (await res.json()) as TelegramSendResult
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/lib/telegram.test.ts
```

Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/telegram.ts backend/tests/lib/telegram.test.ts
git commit -m "feat(backend): add Telegram auth + send client"
```

---

## Task 10: JWT module

**Files:**
- Create: `backend/src/lib/jwt.ts`
- Create: `backend/tests/lib/jwt.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test"
import { signSession, verifySession } from "~/lib/jwt"

const SECRET = "x".repeat(32)

describe("signSession / verifySession", () => {
  it("round-trips the payload", async () => {
    const token = await signSession({ user_id: "abc", telegram_id: 1, role: "admin" }, SECRET)
    const decoded = await verifySession(token, SECRET)
    expect(decoded.user_id).toBe("abc")
    expect(decoded.telegram_id).toBe(1)
    expect(decoded.role).toBe("admin")
  })

  it("rejects tampered tokens", async () => {
    const token = await signSession({ user_id: "abc", telegram_id: 1, role: "member" }, SECRET)
    const tampered = token.slice(0, -2) + "xx"
    await expect(verifySession(tampered, SECRET)).rejects.toThrow()
  })

  it("rejects tokens signed with a different secret", async () => {
    const token = await signSession({ user_id: "abc", telegram_id: 1, role: "member" }, SECRET)
    await expect(verifySession(token, "y".repeat(32))).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/lib/jwt.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/jwt.ts`**

```ts
import { SignJWT, jwtVerify } from "jose"
import type { SessionPayload } from "~/types"

const ALG = "HS256"
const EXPIRY = "7d"

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(key(secret))
}

export async function verifySession(token: string, secret: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, key(secret), { algorithms: [ALG] })
  if (
    typeof payload.user_id !== "string" ||
    typeof payload.telegram_id !== "number" ||
    (payload.role !== "admin" && payload.role !== "member")
  ) {
    throw new Error("invalid session payload")
  }
  return { user_id: payload.user_id, telegram_id: payload.telegram_id, role: payload.role }
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/lib/jwt.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/jwt.ts backend/tests/lib/jwt.test.ts
git commit -m "feat(backend): add JWT session sign/verify"
```

---

## Task 11: Rule matcher

**Files:**
- Create: `backend/src/lib/rule-matcher.ts`
- Create: `backend/tests/lib/rule-matcher.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "bun:test"
import { ObjectId } from "mongodb"
import { matchingRulesForAge } from "~/lib/rule-matcher"
import type { Rule } from "~/types"

function rule(day: number, category: Rule["category"] = "vaccine"): Rule {
  return {
    _id: new ObjectId(),
    asset_type: "chicken",
    day_offset: day,
    category,
    severity: "critical",
    title_kh: "x",
    title_en: "x",
    instructions_kh: "x",
    instructions_en: "x",
    source_page: 1,
  }
}

describe("matchingRulesForAge", () => {
  const rules: Rule[] = [rule(0), rule(7), rule(14, "feed"), rule(14, "vaccine"), rule(60, "harvest")]

  it("returns rules matching exact day_offset", () => {
    const out = matchingRulesForAge(rules, "chicken", 7)
    expect(out).toHaveLength(1)
    expect(out[0].day_offset).toBe(7)
  })

  it("returns multiple rules when several match the same day", () => {
    const out = matchingRulesForAge(rules, "chicken", 14)
    expect(out).toHaveLength(2)
  })

  it("returns empty array when no rule matches", () => {
    expect(matchingRulesForAge(rules, "chicken", 5)).toEqual([])
  })

  it("filters by asset type", () => {
    expect(matchingRulesForAge(rules, "cow" as any, 7)).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/lib/rule-matcher.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/rule-matcher.ts`**

```ts
import type { Rule, AssetType } from "~/types"

export function matchingRulesForAge(rules: Rule[], assetType: AssetType, ageDays: number): Rule[] {
  return rules.filter((r) => r.asset_type === assetType && r.day_offset === ageDays)
}
```

- [ ] **Step 4: Run tests**

```bash
bun test tests/lib/rule-matcher.test.ts
```

Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/rule-matcher.ts backend/tests/lib/rule-matcher.test.ts
git commit -m "feat(backend): add rule matcher"
```

---

## Task 12: MAFF rule seed (placeholder content until PDF arrives)

**Files:**
- Create: `backend/src/seeds/maff-chicken-rules.ts`
- Create: `backend/src/scripts/seed-rules.ts`

> The user will provide the official MAFF chicken raising guide PDF. Until then, this seed contains a small set of plausible commercial-broiler entries marked clearly as `PLACEHOLDER` so they get replaced wholesale once the PDF is available. The schema and seeding mechanics are real; the rule content is not yet authoritative.

- [ ] **Step 1: Implement `src/seeds/maff-chicken-rules.ts`**

```ts
import type { Rule } from "~/types"

export const MAFF_CHICKEN_RULES_PLACEHOLDER: Omit<Rule, "_id">[] = [
  {
    asset_type: "chicken",
    day_offset: 0,
    category: "housing",
    severity: "critical",
    title_kh: "ត្រៀមកន្លែងសម្រាប់កូនមាន់",
    title_en: "Prepare brooder area",
    instructions_kh: "កំដៅ ៣៣°C\nក្រាស់ស្បូវ\nទឹកស្អាត និងចំណីចាប់ផ្តើម",
    instructions_en: "Heat 33°C, dry bedding, clean water + starter feed",
    source_page: 0,
  },
  {
    asset_type: "chicken",
    day_offset: 7,
    category: "vaccine",
    severity: "critical",
    title_kh: "ចាក់វ៉ាក់សាំង Newcastle (ND-IB) ដង​ទី១",
    title_en: "Newcastle + IB vaccine, dose 1",
    instructions_kh: "ប្រើ B1 strain\nដក់ចូលក្នុងភ្នែក ឬច្រមុះ\nធ្វើនៅពេលព្រឹក/ល្ងាច",
    instructions_en: "B1 strain via eye/nose drops, cool hours only",
    source_page: 0,
  },
  {
    asset_type: "chicken",
    day_offset: 14,
    category: "vaccine",
    severity: "critical",
    title_kh: "ចាក់វ៉ាក់សាំង Gumboro ដង​ទី១",
    title_en: "Gumboro vaccine, dose 1",
    instructions_kh: "លាយក្នុងទឹកផឹក\nឲ្យមាន់ឃ្លានបន្តិចមុនផឹក",
    instructions_en: "Mix in drinking water; brief water restriction before",
    source_page: 0,
  },
  {
    asset_type: "chicken",
    day_offset: 21,
    category: "feed",
    severity: "important",
    title_kh: "ផ្លាស់ប្តូរទៅចំណី Grower",
    title_en: "Switch to grower feed",
    instructions_kh: "លាយ ៥០/៥០ ៣ ថ្ងៃ\nបន្ទាប់មកប្តូរពេញ",
    instructions_en: "Mix 50/50 for 3 days, then full switch",
    source_page: 0,
  },
  {
    asset_type: "chicken",
    day_offset: 28,
    category: "vaccine",
    severity: "critical",
    title_kh: "ចាក់វ៉ាក់សាំង Newcastle ដង​ទី២",
    title_en: "Newcastle vaccine, booster",
    instructions_kh: "ដក់ចូលក្នុងភ្នែក ឬច្រមុះ\nគ្រប់ក្បាល",
    instructions_en: "Eye/nose drops; every bird",
    source_page: 0,
  },
  {
    asset_type: "chicken",
    day_offset: 42,
    category: "feed",
    severity: "important",
    title_kh: "ផ្លាស់ប្តូរទៅចំណី Finisher",
    title_en: "Switch to finisher feed",
    instructions_kh: "លាយ ៥០/៥០ ៣ ថ្ងៃ",
    instructions_en: "Transition over 3 days",
    source_page: 0,
  },
  {
    asset_type: "chicken",
    day_offset: 60,
    category: "harvest",
    severity: "info",
    title_kh: "ដល់ពេលចាប់លក់",
    title_en: "Harvest day",
    instructions_kh: "ឈប់ឲ្យចំណី ៦-៨ ម៉ោង មុនចាប់\nទឹកនៅតែឲ្យ",
    instructions_en: "Withhold feed 6–8h before, keep water",
    source_page: 0,
  },
]
```

- [ ] **Step 2: Implement `src/scripts/seed-rules.ts`**

```ts
import { connectDb, collections, disconnectDb } from "~/lib/db"
import { env } from "~/env"
import { MAFF_CHICKEN_RULES_PLACEHOLDER } from "~/seeds/maff-chicken-rules"

async function seed() {
  await connectDb(env.MONGODB_URI)

  await collections.rules().deleteMany({ asset_type: "chicken" })
  const docs = MAFF_CHICKEN_RULES_PLACEHOLDER.map((r) => ({ ...r }))
  if (docs.length > 0) await collections.rules().insertMany(docs as any)

  console.log(`seeded ${docs.length} chicken rules (PLACEHOLDER content)`)
  await disconnectDb()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/seeds/maff-chicken-rules.ts backend/src/scripts/seed-rules.ts
git commit -m "feat(backend): add chicken rule seed (placeholder)"
```

---

## Task 13: Integration test helper (in-memory Mongo + Hono app)

**Files:**
- Create: `backend/tests/integration/helpers.ts`

- [ ] **Step 1: Implement the helper**

```ts
import { MongoMemoryServer } from "mongodb-memory-server"
import { MongoClient } from "mongodb"
import { connectDb, disconnectDb, collections } from "~/lib/db"

let mongo: MongoMemoryServer | null = null
let client: MongoClient | null = null

export async function setupTestDb(): Promise<void> {
  mongo = await MongoMemoryServer.create()
  await connectDb(mongo.getUri(), "smartfarm-test")

  await collections.users().createIndex({ telegram_id: 1 }, { unique: true })
  await collections.assets().createIndex({ status: 1 })
  await collections.rules().createIndex({ asset_type: 1, day_offset: 1 })
  await collections
    .alerts()
    .createIndex({ asset_id: 1, rule_id: 1, scheduled_for: 1 }, { unique: true })
  await collections.system().createIndex({ key: 1 }, { unique: true })
}

export async function teardownTestDb(): Promise<void> {
  await disconnectDb()
  if (client) await client.close()
  if (mongo) await mongo.stop()
  mongo = null
  client = null
}

export async function clearAllCollections(): Promise<void> {
  await collections.users().deleteMany({})
  await collections.assets().deleteMany({})
  await collections.rules().deleteMany({})
  await collections.alerts().deleteMany({})
  await collections.system().deleteMany({})
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/tests/integration/helpers.ts
git commit -m "test(backend): add integration test fixture helper"
```

---

## Task 14: Auth middleware

**Files:**
- Create: `backend/src/middleware/auth.ts`

- [ ] **Step 1: Implement the middleware**

```ts
import type { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { verifySession } from "~/lib/jwt"
import { env } from "~/env"
import type { SessionPayload, Role } from "~/types"

declare module "hono" {
  interface ContextVariableMap {
    session: SessionPayload
  }
}

export async function requireAuth(c: Context, next: Next) {
  const token = getCookie(c, "session")
  if (!token) return c.json({ error: "unauthenticated" }, 401)
  try {
    const session = await verifySession(token, env.JWT_SECRET)
    c.set("session", session)
    await next()
  } catch {
    return c.json({ error: "unauthenticated" }, 401)
  }
}

export function requireRole(role: Role) {
  return async (c: Context, next: Next) => {
    const session = c.get("session")
    if (!session || session.role !== role) {
      return c.json({ error: "forbidden" }, 403)
    }
    await next()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/middleware/auth.ts
git commit -m "feat(backend): add auth middleware"
```

---

## Task 15: Auth routes (Telegram login + logout)

**Files:**
- Create: `backend/src/routes/auth.ts`
- Create: `backend/tests/integration/auth.test.ts`

- [ ] **Step 1: Write the integration test**

```ts
import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test"
import { createHash, createHmac } from "node:crypto"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { authRoutes } from "~/routes/auth"

const BOT_TOKEN = "1:TEST"
const JWT_SECRET = "x".repeat(32)

function sign(fields: Record<string, string | number>) {
  const data = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n")
  const secret = createHash("sha256").update(BOT_TOKEN).digest()
  return createHmac("sha256", secret).update(data).digest("hex")
}

function buildApp() {
  const app = new Hono()
  app.route("/api/auth", authRoutes({ botToken: BOT_TOKEN, jwtSecret: JWT_SECRET }))
  return app
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => clearAllCollections())

describe("POST /api/auth/telegram", () => {
  it("issues a session for a whitelisted user", async () => {
    await collections.users().insertOne({
      _id: new ObjectId(),
      telegram_id: 42,
      telegram_username: "abc",
      display_name: "Test",
      role: "admin",
      created_at: new Date(),
      last_login_at: new Date(),
    })

    const fields = { id: 42, first_name: "Test", username: "abc", auth_date: Math.floor(Date.now() / 1000) }
    const hash = sign(fields)
    const res = await buildApp().request("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, hash }),
    })

    expect(res.status).toBe(200)
    const setCookie = res.headers.get("set-cookie") ?? ""
    expect(setCookie).toContain("session=")
    expect(setCookie).toContain("HttpOnly")
  })

  it("rejects when telegram_id is not whitelisted", async () => {
    const fields = { id: 999, first_name: "Stranger", auth_date: Math.floor(Date.now() / 1000) }
    const hash = sign(fields)
    const res = await buildApp().request("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, hash }),
    })
    expect(res.status).toBe(403)
  })

  it("rejects bad hash", async () => {
    const res = await buildApp().request("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 42,
        first_name: "Test",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "0".repeat(64),
      }),
    })
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/integration/auth.test.ts
```

Expected: FAIL — module `~/routes/auth` not found.

- [ ] **Step 3: Implement `src/routes/auth.ts`**

```ts
import { Hono } from "hono"
import { setCookie, deleteCookie } from "hono/cookie"
import { z } from "zod"
import { verifyTelegramLogin } from "~/lib/telegram"
import { signSession } from "~/lib/jwt"
import { collections } from "~/lib/db"

const TelegramLoginSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
})

interface AuthRouteConfig {
  botToken: string
  jwtSecret: string
}

export function authRoutes(cfg: AuthRouteConfig) {
  const app = new Hono()

  app.post("/telegram", async (c) => {
    const body = await c.req.json()
    const parsed = TelegramLoginSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: "bad payload" }, 400)

    try {
      verifyTelegramLogin(parsed.data, cfg.botToken)
    } catch {
      return c.json({ error: "invalid signature" }, 401)
    }

    const user = await collections.users().findOne({ telegram_id: parsed.data.id })
    if (!user) return c.json({ error: "not whitelisted" }, 403)

    await collections.users().updateOne(
      { _id: user._id },
      { $set: { last_login_at: new Date() } },
    )

    const token = await signSession(
      { user_id: user._id.toHexString(), telegram_id: user.telegram_id, role: user.role },
      cfg.jwtSecret,
    )

    setCookie(c, "session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    return c.json({
      user: {
        id: user._id.toHexString(),
        telegram_id: user.telegram_id,
        display_name: user.display_name,
        role: user.role,
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

- [ ] **Step 4: Run integration tests**

```bash
bun test tests/integration/auth.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/auth.ts backend/tests/integration/auth.test.ts
git commit -m "feat(backend): add Telegram login + logout routes"
```

---

## Task 16: Assets CRUD routes

**Files:**
- Create: `backend/src/routes/assets.ts`
- Create: `backend/tests/integration/assets.test.ts`

- [ ] **Step 1: Write the integration test**

```ts
import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { assetsRoutes } from "~/routes/assets"
import { signSession } from "~/lib/jwt"

const JWT_SECRET = "x".repeat(32)

async function seedUser(role: "admin" | "member" = "member") {
  const _id = new ObjectId()
  await collections.users().insertOne({
    _id,
    telegram_id: 1,
    telegram_username: "u",
    display_name: "U",
    role,
    created_at: new Date(),
    last_login_at: new Date(),
  })
  const token = await signSession(
    { user_id: _id.toHexString(), telegram_id: 1, role },
    JWT_SECRET,
  )
  return { userId: _id, token }
}

function buildApp() {
  const app = new Hono()
  app.route("/api/assets", assetsRoutes({ jwtSecret: JWT_SECRET }))
  return app
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => clearAllCollections())

describe("assets CRUD", () => {
  it("POST creates a batch and computes expected_harvest_date", async () => {
    const { token } = await seedUser()
    const res = await buildApp().request("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({
        type: "chicken",
        breed: "broiler",
        quantity_initial: 50,
        arrival_date: "2026-05-04",
        notes: "first batch",
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.asset.quantity_current).toBe(50)
    expect(body.asset.status).toBe("active")
    expect(body.asset.expected_harvest_date).toBeTruthy()
  })

  it("GET / lists active batches", async () => {
    const { token, userId } = await seedUser()
    await collections.assets().insertOne({
      _id: new ObjectId(),
      type: "chicken",
      breed: "broiler",
      quantity_initial: 50,
      quantity_current: 48,
      arrival_date: new Date(),
      expected_harvest_date: new Date(),
      status: "active",
      notes: "",
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    })
    const res = await buildApp().request("/api/assets?status=active", {
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.assets).toHaveLength(1)
  })

  it("PATCH updates only quantity_current and notes", async () => {
    const { token, userId } = await seedUser()
    const _id = new ObjectId()
    const arrival = new Date("2026-05-01T00:00:00Z")
    await collections.assets().insertOne({
      _id,
      type: "chicken",
      breed: "broiler",
      quantity_initial: 50,
      quantity_current: 50,
      arrival_date: arrival,
      expected_harvest_date: new Date("2026-06-30T00:00:00Z"),
      status: "active",
      notes: "",
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    })
    const res = await buildApp().request(`/api/assets/${_id.toHexString()}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({
        quantity_current: 47,
        notes: "lost 3",
        arrival_date: "2030-01-01",
      }),
    })
    expect(res.status).toBe(200)
    const after = await collections.assets().findOne({ _id })
    expect(after?.quantity_current).toBe(47)
    expect(after?.notes).toBe("lost 3")
    expect(after?.arrival_date.getTime()).toBe(arrival.getTime())
  })

  it("DELETE archives a batch (admin only)", async () => {
    const { token, userId } = await seedUser("admin")
    const _id = new ObjectId()
    await collections.assets().insertOne({
      _id,
      type: "chicken",
      breed: "broiler",
      quantity_initial: 50,
      quantity_current: 50,
      arrival_date: new Date(),
      expected_harvest_date: new Date(),
      status: "active",
      notes: "",
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    })
    const res = await buildApp().request(`/api/assets/${_id.toHexString()}`, {
      method: "DELETE",
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(200)
    const after = await collections.assets().findOne({ _id })
    expect(after?.status).toBe("archived")
  })

  it("DELETE rejects member role", async () => {
    const { token } = await seedUser("member")
    const res = await buildApp().request(`/api/assets/${new ObjectId().toHexString()}`, {
      method: "DELETE",
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(403)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/integration/assets.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/routes/assets.ts`**

```ts
import { Hono } from "hono"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth, requireRole } from "~/middleware/auth"
import { addDays, startOfDayInPhnomPenh } from "~/lib/lifecycle"
import type { Asset } from "~/types"

const CreateSchema = z.object({
  type: z.literal("chicken"),
  breed: z.enum(["broiler", "layer", "local"]),
  quantity_initial: z.number().int().positive(),
  arrival_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional().default(""),
})

const PatchSchema = z.object({
  quantity_current: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
})

interface AssetsRouteConfig {
  jwtSecret: string
}

export function assetsRoutes(_cfg: AssetsRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth)

  app.post("/", async (c) => {
    const body = await c.req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const session = c.get("session")
    const arrival = startOfDayInPhnomPenh(new Date(`${parsed.data.arrival_date}T00:00:00Z`))
    const expected_harvest = addDays(arrival, 60)
    const now = new Date()
    const asset: Asset = {
      _id: new ObjectId(),
      type: parsed.data.type,
      breed: parsed.data.breed,
      quantity_initial: parsed.data.quantity_initial,
      quantity_current: parsed.data.quantity_initial,
      arrival_date: arrival,
      expected_harvest_date: expected_harvest,
      status: "active",
      notes: parsed.data.notes,
      created_by: new ObjectId(session.user_id),
      created_at: now,
      updated_at: now,
    }
    await collections.assets().insertOne(asset)
    return c.json({ asset }, 201)
  })

  app.get("/", async (c) => {
    const status = c.req.query("status")
    const filter = status ? { status: status as Asset["status"] } : {}
    const assets = await collections.assets().find(filter).sort({ arrival_date: -1 }).toArray()
    return c.json({ assets })
  })

  app.get("/:id", async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const asset = await collections.assets().findOne({ _id: new ObjectId(id) })
    if (!asset) return c.json({ error: "not found" }, 404)
    return c.json({ asset })
  })

  app.patch("/:id", async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const body = await c.req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const update: Record<string, unknown> = { updated_at: new Date() }
    if (parsed.data.quantity_current !== undefined) update.quantity_current = parsed.data.quantity_current
    if (parsed.data.notes !== undefined) update.notes = parsed.data.notes
    const result = await collections
      .assets()
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: "after" })
    if (!result) return c.json({ error: "not found" }, 404)
    return c.json({ asset: result })
  })

  app.delete("/:id", requireRole("admin"), async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const result = await collections
      .assets()
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: "archived", updated_at: new Date() } },
        { returnDocument: "after" },
      )
    if (!result) return c.json({ error: "not found" }, 404)
    return c.json({ asset: result })
  })

  return app
}
```

- [ ] **Step 4: Run integration tests**

```bash
bun test tests/integration/assets.test.ts
```

Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/assets.ts backend/tests/integration/assets.test.ts
git commit -m "feat(backend): add assets CRUD routes"
```

---

## Task 17: Admin users routes

**Files:**
- Create: `backend/src/routes/users.ts`
- Create: `backend/tests/integration/users.test.ts`

- [ ] **Step 1: Write the integration test**

```ts
import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { adminUsersRoutes } from "~/routes/users"
import { signSession } from "~/lib/jwt"

const JWT_SECRET = "x".repeat(32)

async function seedUser(role: "admin" | "member") {
  const _id = new ObjectId()
  const telegram_id = role === "admin" ? 100 : 200
  await collections.users().insertOne({
    _id,
    telegram_id,
    telegram_username: role,
    display_name: role,
    role,
    created_at: new Date(),
    last_login_at: new Date(),
  })
  const token = await signSession({ user_id: _id.toHexString(), telegram_id, role }, JWT_SECRET)
  return { token, userId: _id }
}

function buildApp() {
  const app = new Hono()
  app.route("/api/admin/users", adminUsersRoutes({ jwtSecret: JWT_SECRET }))
  return app
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => clearAllCollections())

describe("admin users routes", () => {
  it("admin can list users", async () => {
    const { token } = await seedUser("admin")
    const res = await buildApp().request("/api/admin/users", { headers: { Cookie: `session=${token}` } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.users).toHaveLength(1)
  })

  it("member is forbidden from listing users", async () => {
    const { token } = await seedUser("member")
    const res = await buildApp().request("/api/admin/users", { headers: { Cookie: `session=${token}` } })
    expect(res.status).toBe(403)
  })

  it("admin can create user", async () => {
    const { token } = await seedUser("admin")
    const res = await buildApp().request("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ telegram_id: 555, display_name: "Brother", role: "member" }),
    })
    expect(res.status).toBe(201)
  })

  it("admin cannot remove self", async () => {
    const { token, userId } = await seedUser("admin")
    const res = await buildApp().request(`/api/admin/users/${userId.toHexString()}`, {
      method: "DELETE",
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/integration/users.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/routes/users.ts`**

```ts
import { Hono } from "hono"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth, requireRole } from "~/middleware/auth"

const CreateSchema = z.object({
  telegram_id: z.number().int(),
  telegram_username: z.string().optional().default(""),
  display_name: z.string().min(1),
  role: z.enum(["admin", "member"]),
})

interface UsersRouteConfig {
  jwtSecret: string
}

export function adminUsersRoutes(_cfg: UsersRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth, requireRole("admin"))

  app.get("/", async (c) => {
    const users = await collections.users().find({}).sort({ created_at: -1 }).toArray()
    return c.json({ users })
  })

  app.post("/", async (c) => {
    const body = await c.req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const now = new Date()
    try {
      const result = await collections.users().insertOne({
        _id: new ObjectId(),
        telegram_id: parsed.data.telegram_id,
        telegram_username: parsed.data.telegram_username,
        display_name: parsed.data.display_name,
        role: parsed.data.role,
        created_at: now,
        last_login_at: now,
      })
      return c.json({ id: result.insertedId.toHexString() }, 201)
    } catch (err: any) {
      if (err?.code === 11000) return c.json({ error: "telegram_id already whitelisted" }, 409)
      throw err
    }
  })

  app.delete("/:id", async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const session = c.get("session")
    if (id === session.user_id) return c.json({ error: "cannot remove self" }, 400)
    const result = await collections.users().deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return c.json({ error: "not found" }, 404)
    return c.json({ ok: true })
  })

  return app
}
```

- [ ] **Step 4: Run integration tests**

```bash
bun test tests/integration/users.test.ts
```

Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/users.ts backend/tests/integration/users.test.ts
git commit -m "feat(backend): add admin users routes"
```

---

## Task 18: Alerts read routes

**Files:**
- Create: `backend/src/routes/alerts.ts`
- Create: `backend/tests/integration/alerts.test.ts`

- [ ] **Step 1: Write the integration test**

```ts
import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { alertsRoutes } from "~/routes/alerts"
import { signSession } from "~/lib/jwt"
import { startOfDayInPhnomPenh } from "~/lib/lifecycle"

const JWT_SECRET = "x".repeat(32)

async function authToken() {
  const _id = new ObjectId()
  await collections.users().insertOne({
    _id,
    telegram_id: 1,
    telegram_username: "u",
    display_name: "U",
    role: "member",
    created_at: new Date(),
    last_login_at: new Date(),
  })
  return signSession({ user_id: _id.toHexString(), telegram_id: 1, role: "member" }, JWT_SECRET)
}

function buildApp() {
  const app = new Hono()
  app.route("/api/alerts", alertsRoutes({ jwtSecret: JWT_SECRET }))
  return app
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => clearAllCollections())

describe("GET /api/alerts", () => {
  it("returns today's alerts when no asset_id filter is given", async () => {
    const today = startOfDayInPhnomPenh(new Date())
    await collections.alerts().insertOne({
      _id: new ObjectId(),
      asset_id: new ObjectId(),
      rule_id: new ObjectId(),
      scheduled_for: today,
      sent_at: new Date(),
      delivery_status: "sent",
      telegram_message_id: 1,
      error: null,
      attempt_count: 1,
    })
    const token = await authToken()
    const res = await buildApp().request("/api/alerts", { headers: { Cookie: `session=${token}` } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.alerts).toHaveLength(1)
  })

  it("filters by asset_id when provided", async () => {
    const assetA = new ObjectId()
    const assetB = new ObjectId()
    const today = startOfDayInPhnomPenh(new Date())
    await collections.alerts().insertMany([
      {
        _id: new ObjectId(),
        asset_id: assetA,
        rule_id: new ObjectId(),
        scheduled_for: today,
        sent_at: new Date(),
        delivery_status: "sent",
        telegram_message_id: 1,
        error: null,
        attempt_count: 1,
      },
      {
        _id: new ObjectId(),
        asset_id: assetB,
        rule_id: new ObjectId(),
        scheduled_for: today,
        sent_at: new Date(),
        delivery_status: "sent",
        telegram_message_id: 2,
        error: null,
        attempt_count: 1,
      },
    ])
    const token = await authToken()
    const res = await buildApp().request(`/api/alerts?asset_id=${assetA.toHexString()}`, {
      headers: { Cookie: `session=${token}` },
    })
    const body = await res.json()
    expect(body.alerts).toHaveLength(1)
    expect(body.alerts[0].asset_id).toBe(assetA.toHexString())
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/integration/alerts.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/routes/alerts.ts`**

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
    const filter: Record<string, unknown> = {}
    if (assetIdParam) {
      if (!ObjectId.isValid(assetIdParam)) return c.json({ error: "invalid asset_id" }, 400)
      filter.asset_id = new ObjectId(assetIdParam)
    } else {
      filter.scheduled_for = startOfDayInPhnomPenh(new Date())
    }
    const alerts = await collections.alerts().find(filter).sort({ scheduled_for: -1 }).limit(200).toArray()
    return c.json({ alerts })
  })

  return app
}
```

- [ ] **Step 4: Run integration tests**

```bash
bun test tests/integration/alerts.test.ts
```

Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/alerts.ts backend/tests/integration/alerts.test.ts
git commit -m "feat(backend): add alerts read route"
```

---

## Task 19: Daily-check cron worker

**Files:**
- Create: `backend/src/cron/daily-check.ts`
- Create: `backend/tests/integration/daily-check.test.ts`

- [ ] **Step 1: Write the integration test**

```ts
import { describe, expect, it, beforeAll, afterAll, beforeEach, mock } from "bun:test"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { runDailyCheck } from "~/cron/daily-check"
import { startOfDayInPhnomPenh, addDays } from "~/lib/lifecycle"

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => {
  await clearAllCollections()
  globalThis.fetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 }),
  ) as any
})

async function seedRules() {
  await collections.rules().insertMany([
    {
      _id: new ObjectId(),
      asset_type: "chicken",
      day_offset: 7,
      category: "vaccine",
      severity: "critical",
      title_kh: "ND",
      title_en: "ND",
      instructions_kh: "x",
      instructions_en: "x",
      source_page: 1,
    },
    {
      _id: new ObjectId(),
      asset_type: "chicken",
      day_offset: 14,
      category: "feed",
      severity: "important",
      title_kh: "Switch",
      title_en: "Switch",
      instructions_kh: "x",
      instructions_en: "x",
      source_page: 1,
    },
  ])
}

async function seedAsset(arrivalDaysAgo: number) {
  const _id = new ObjectId()
  const arrival = startOfDayInPhnomPenh(addDays(new Date(), -arrivalDaysAgo))
  await collections.assets().insertOne({
    _id,
    type: "chicken",
    breed: "broiler",
    quantity_initial: 50,
    quantity_current: 50,
    arrival_date: arrival,
    expected_harvest_date: addDays(arrival, 60),
    status: "active",
    notes: "",
    created_by: new ObjectId(),
    created_at: new Date(),
    updated_at: new Date(),
  })
  return _id
}

describe("runDailyCheck", () => {
  it("sends one alert for an asset that hits day 7 today", async () => {
    await seedRules()
    await seedAsset(7)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts).toHaveLength(1)
    expect(alerts[0].delivery_status).toBe("sent")
  })

  it("is idempotent — running twice on same day sends only once", async () => {
    await seedRules()
    await seedAsset(7)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts).toHaveLength(1)
  })

  it("sends two separate alerts when two rules match the same day", async () => {
    await collections.rules().insertMany([
      {
        _id: new ObjectId(),
        asset_type: "chicken",
        day_offset: 14,
        category: "feed",
        severity: "important",
        title_kh: "A",
        title_en: "A",
        instructions_kh: "x",
        instructions_en: "x",
        source_page: 1,
      },
      {
        _id: new ObjectId(),
        asset_type: "chicken",
        day_offset: 14,
        category: "vaccine",
        severity: "critical",
        title_kh: "B",
        title_en: "B",
        instructions_kh: "x",
        instructions_en: "x",
        source_page: 1,
      },
    ])
    await seedAsset(14)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts).toHaveLength(2)
  })

  it("auto-harvests assets at day 60", async () => {
    await seedRules()
    const id = await seedAsset(60)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const after = await collections.assets().findOne({ _id: id })
    expect(after?.status).toBe("harvested")
  })

  it("marks alert failed when telegram returns ok:false", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: false, description: "blocked" }), { status: 400 }),
    ) as any
    await seedRules()
    await seedAsset(7)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts[0].delivery_status).toBe("failed")
    expect(alerts[0].error).toContain("blocked")
  })

  it("processes catch-up days when last_cron_run is older than today", async () => {
    await seedRules()
    const id = await seedAsset(7)
    // Make it look like cron last ran 1 day ago — so today + yesterday should be processed.
    const yesterday = startOfDayInPhnomPenh(addDays(new Date(), -1))
    await collections.system().insertOne({
      _id: new ObjectId(),
      key: "last_cron_run",
      value: addDays(yesterday, -1),
    })
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    // Asset is at day 7 today; yesterday it was at day 6. Only day 7 should match.
    const alerts = await collections.alerts().find({ asset_id: id }).toArray()
    expect(alerts).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/integration/daily-check.test.ts
```

Expected: FAIL — module `~/cron/daily-check` not found.

- [ ] **Step 3: Implement `src/cron/daily-check.ts`**

```ts
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { startOfDayInPhnomPenh, daysBetween, enumerateDaysFrom, addDays } from "~/lib/lifecycle"
import { matchingRulesForAge } from "~/lib/rule-matcher"
import { formatAlertMessage } from "~/lib/khmer-formatter"
import { sendTelegramMessage } from "~/lib/telegram"
import type { Asset, Rule } from "~/types"

interface RunArgs {
  botToken: string
  chatId: string
}

const HARVEST_DAY = 60

function batchLabel(asset: Asset): string {
  return asset._id.toHexString().slice(-6).toUpperCase()
}

async function processOneRule(asset: Asset, rule: Rule, processingDay: Date, isCatchUp: boolean, args: RunArgs) {
  const alertId = new ObjectId()
  try {
    await collections.alerts().insertOne({
      _id: alertId,
      asset_id: asset._id,
      rule_id: rule._id,
      scheduled_for: processingDay,
      sent_at: null,
      delivery_status: "pending",
      telegram_message_id: null,
      error: null,
      attempt_count: 0,
    })
  } catch (err: any) {
    if (err?.code === 11000) return // already processed
    throw err
  }

  const text = formatAlertMessage({ asset, rule, batchLabel: batchLabel(asset), catchUp: isCatchUp })
  const result = await sendTelegramMessage({ botToken: args.botToken, chatId: args.chatId, text })

  await collections.alerts().updateOne(
    { _id: alertId },
    {
      $set: {
        sent_at: new Date(),
        delivery_status: result.ok ? "sent" : "failed",
        telegram_message_id: result.result?.message_id ?? null,
        error: result.ok ? null : result.description ?? "unknown",
      },
      $inc: { attempt_count: 1 },
    },
  )
}

export async function runDailyCheck(args: RunArgs): Promise<void> {
  const today = startOfDayInPhnomPenh(new Date())
  const lastRecord = await collections.system().findOne({ key: "last_cron_run" })
  const startDay = lastRecord ? addDays(lastRecord.value, 1) : today
  const daysToProcess = enumerateDaysFrom(startDay <= today ? startDay : today, today)

  const allRules = await collections.rules().find({ asset_type: "chicken" }).toArray()
  const activeAssets = await collections.assets().find({ status: "active" }).toArray()

  for (const processingDay of daysToProcess) {
    const isCatchUp = processingDay.getTime() < today.getTime()
    for (const asset of activeAssets) {
      const age = daysBetween(asset.arrival_date, processingDay)
      if (age < 0) continue
      const rules = matchingRulesForAge(allRules, asset.type, age)
      for (const rule of rules) {
        await processOneRule(asset, rule, processingDay, isCatchUp, args)
      }
      if (age >= HARVEST_DAY && asset.status === "active") {
        await collections.assets().updateOne(
          { _id: asset._id },
          { $set: { status: "harvested", updated_at: new Date() } },
        )
      }
    }
  }

  await collections.system().updateOne(
    { key: "last_cron_run" },
    { $set: { key: "last_cron_run", value: today } },
    { upsert: true },
  )
}
```

- [ ] **Step 4: Run integration tests**

```bash
bun test tests/integration/daily-check.test.ts
```

Expected: 6 passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/cron/daily-check.ts backend/tests/integration/daily-check.test.ts
git commit -m "feat(backend): add daily-check cron worker"
```

---

## Task 20: Backfill alerts on past arrival_date registration

**Files:**
- Modify: `backend/src/routes/assets.ts`
- Modify: `backend/tests/integration/assets.test.ts`

- [ ] **Step 1: Add backfill test to `tests/integration/assets.test.ts`**

```ts
// Append inside the existing describe("assets CRUD") block:

it("backfills alerts for past arrival_date", async () => {
  const { token } = await seedUser()
  await collections.rules().insertMany([
    {
      _id: new ObjectId(),
      asset_type: "chicken",
      day_offset: 0,
      category: "housing",
      severity: "info",
      title_kh: "x",
      title_en: "x",
      instructions_kh: "x",
      instructions_en: "x",
      source_page: 1,
    },
    {
      _id: new ObjectId(),
      asset_type: "chicken",
      day_offset: 7,
      category: "vaccine",
      severity: "critical",
      title_kh: "y",
      title_en: "y",
      instructions_kh: "y",
      instructions_en: "y",
      source_page: 1,
    },
  ])
  globalThis.fetch = (() => async () =>
    new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 }))() as any

  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  const isoDate = eightDaysAgo.toISOString().slice(0, 10)
  const res = await buildApp().request("/api/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
    body: JSON.stringify({
      type: "chicken",
      breed: "broiler",
      quantity_initial: 50,
      arrival_date: isoDate,
      notes: "",
    }),
  })
  expect(res.status).toBe(201)
  const alerts = await collections.alerts().find({}).toArray()
  // Day 0 and day 7 rules apply (asset is now ~8 days old)
  expect(alerts.length).toBeGreaterThanOrEqual(2)
})
```

Update the `buildApp` factory in this test file to inject Telegram config:

```ts
function buildApp() {
  const app = new Hono()
  app.route("/api/assets", assetsRoutes({ jwtSecret: JWT_SECRET, botToken: "1:T", chatId: "-100" }))
  return app
}
```

- [ ] **Step 2: Run to verify failure**

```bash
bun test tests/integration/assets.test.ts
```

Expected: FAIL on backfill test (and any tests that referenced the old buildApp signature — update `assetsRoutes(...)` calls to pass `botToken` and `chatId`).

- [ ] **Step 3: Update `src/routes/assets.ts` to accept Telegram config and run backfill on POST**

Replace the `AssetsRouteConfig` and `app.post("/")` handler with:

```ts
import { runBackfillForAsset } from "~/cron/daily-check"

interface AssetsRouteConfig {
  jwtSecret: string
  botToken: string
  chatId: string
}

export function assetsRoutes(cfg: AssetsRouteConfig) {
  // ... unchanged setup ...

  app.post("/", async (c) => {
    const body = await c.req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const session = c.get("session")
    const arrival = startOfDayInPhnomPenh(new Date(`${parsed.data.arrival_date}T00:00:00Z`))
    const expected_harvest = addDays(arrival, 60)
    const now = new Date()
    const asset: Asset = {
      _id: new ObjectId(),
      type: parsed.data.type,
      breed: parsed.data.breed,
      quantity_initial: parsed.data.quantity_initial,
      quantity_current: parsed.data.quantity_initial,
      arrival_date: arrival,
      expected_harvest_date: expected_harvest,
      status: "active",
      notes: parsed.data.notes,
      created_by: new ObjectId(session.user_id),
      created_at: now,
      updated_at: now,
    }
    await collections.assets().insertOne(asset)

    // Backfill: if arrival is in the past, fire alerts for every applicable past day.
    const today = startOfDayInPhnomPenh(now)
    if (arrival.getTime() < today.getTime()) {
      await runBackfillForAsset({
        asset,
        botToken: cfg.botToken,
        chatId: cfg.chatId,
        today,
      })
    }

    return c.json({ asset }, 201)
  })

  // ... rest unchanged ...
}
```

- [ ] **Step 4: Add `runBackfillForAsset` to `src/cron/daily-check.ts`**

Append to the file:

```ts
interface BackfillArgs {
  asset: Asset
  botToken: string
  chatId: string
  today: Date
}

export async function runBackfillForAsset({ asset, botToken, chatId, today }: BackfillArgs): Promise<void> {
  const allRules = await collections.rules().find({ asset_type: asset.type }).toArray()
  const ageToday = daysBetween(asset.arrival_date, today)
  for (let day = 0; day <= ageToday; day++) {
    const rules = matchingRulesForAge(allRules, asset.type, day)
    for (const rule of rules) {
      await processOneRule(asset, rule, today, /* isCatchUp */ true, { botToken, chatId })
    }
  }
}
```

Note: `processOneRule` is currently file-private — change its declaration from `async function processOneRule` to `export async function processOneRule` so backfill can reuse it.

- [ ] **Step 5: Run all tests**

```bash
bun test
```

Expected: all unit + integration tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/assets.ts backend/src/cron/daily-check.ts backend/tests/integration/assets.test.ts
git commit -m "feat(backend): backfill alerts on past arrival_date"
```

---

## Task 21: Server entrypoint wiring (routes + cron registration)

**Files:**
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Replace `src/index.ts` with full wiring**

```ts
import { Hono } from "hono"
import { cors } from "hono/cors"
import cron from "node-cron"
import { env } from "~/env"
import { connectDb } from "~/lib/db"
import { authRoutes } from "~/routes/auth"
import { assetsRoutes } from "~/routes/assets"
import { adminUsersRoutes } from "~/routes/users"
import { alertsRoutes } from "~/routes/alerts"
import { runDailyCheck } from "~/cron/daily-check"

await connectDb(env.MONGODB_URI)

const app = new Hono()

app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    credentials: true,
  }),
)

app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.route("/api/auth", authRoutes({ botToken: env.BOT_TOKEN, jwtSecret: env.JWT_SECRET }))
app.route(
  "/api/assets",
  assetsRoutes({ jwtSecret: env.JWT_SECRET, botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID }),
)
app.route("/api/admin/users", adminUsersRoutes({ jwtSecret: env.JWT_SECRET }))
app.route("/api/alerts", alertsRoutes({ jwtSecret: env.JWT_SECRET }))

// Dev-only endpoint to trigger the cron immediately for manual testing.
if (env.NODE_ENV !== "production") {
  app.post("/dev/trigger-cron", async (c) => {
    await runDailyCheck({ botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID })
    return c.json({ ok: true })
  })
}

// Cron: daily at 07:00 Asia/Phnom_Penh (server TZ assumed to be set via env.TZ).
cron.schedule(
  "0 7 * * *",
  async () => {
    console.log("[cron-start]", new Date().toISOString())
    try {
      await runDailyCheck({ botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID })
      console.log("[cron-end]", new Date().toISOString())
    } catch (err) {
      console.error("[cron-error]", err)
    }
  },
  { timezone: "Asia/Phnom_Penh" },
)

// On startup, run catch-up if cron didn't fire yesterday.
runDailyCheck({ botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID }).catch((err) =>
  console.error("[startup-catchup-error]", err),
)

console.log(`[start] http://localhost:${env.PORT}`)

export default {
  port: env.PORT,
  fetch: app.fetch,
}
```

- [ ] **Step 2: Run all tests to confirm nothing regressed**

```bash
bun test
```

Expected: all tests passing.

- [ ] **Step 3: Commit**

```bash
git add backend/src/index.ts
git commit -m "feat(backend): wire routes, cron, and startup catch-up"
```

---

## Task 22: Manual end-to-end smoke test runbook

**Files:** none (instructions only — execute manually before declaring V1 backend done)

- [ ] **Step 1: Set up MongoDB**

```bash
docker run -d --name smartfarm-mongo -p 27017:27017 mongo:7
```

- [ ] **Step 2: Configure `.env` from `.env.example`**

Fill in:
- `BOT_TOKEN` from `@BotFather`
- `TELEGRAM_GROUP_ID` from `@RawDataBot` after adding the bot to your test group
- `JWT_SECRET=$(openssl rand -hex 32)`

- [ ] **Step 3: Create indexes and seed rules**

```bash
cd backend
bun run setup-indexes
bun run seed
```

Expected: `indexes created`, `seeded 7 chicken rules (PLACEHOLDER content)`.

- [ ] **Step 4: Insert your own admin user manually**

```bash
mongosh "$MONGODB_URI" --eval 'db.users.insertOne({ telegram_id: <YOUR_TELEGRAM_ID>, telegram_username: "you", display_name: "You", role: "admin", created_at: new Date(), last_login_at: new Date() })'
```

Replace `<YOUR_TELEGRAM_ID>` with your numeric Telegram user ID (from `@userinfobot`).

- [ ] **Step 5: Start the server**

```bash
bun run dev
```

Expected: `[start] http://localhost:8080`.

- [ ] **Step 6: Register a backdated batch via curl (skipping login for the smoke test — sign a token manually)**

```bash
TOKEN=$(bun run -e 'import { signSession } from "./src/lib/jwt"; console.log(await signSession({ user_id: "<YOUR_USER_OID>", telegram_id: <YOUR_TG_ID>, role: "admin" }, process.env.JWT_SECRET))')
curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$TOKEN" \
  -d '{"type":"chicken","breed":"broiler","quantity_initial":50,"arrival_date":"<TODAY MINUS 7 DAYS>","notes":"smoke test"}'
```

Expected: `201` response AND a Khmer Telegram message in your test group, prefixed with `[ត្រួតឡើងវិញ]`, for day 0 and day 7.

- [ ] **Step 7: Trigger the cron manually**

```bash
curl -X POST http://localhost:8080/dev/trigger-cron
```

Expected: `{ "ok": true }`. No new messages (idempotency: today's day-7 alert was already sent during backfill).

- [ ] **Step 8: Inspect alert log in Mongo**

```bash
mongosh "$MONGODB_URI" --eval 'db.alerts.find().pretty()'
```

Expected: rows with `delivery_status: "sent"` and a real `telegram_message_id`.

If all the above produce expected results, the V1 backend is functionally complete.

---

## Self-Review Checklist (run after writing the plan)

**Spec coverage:**
- §3 Architecture — Tasks 1, 4, 21 ✓
- §4.1 users — Tasks 3, 5, 17 ✓
- §4.2 assets — Tasks 3, 5, 16, 20 ✓
- §4.3 rules — Tasks 3, 5, 12 ✓
- §4.4 alerts — Tasks 3, 5, 18 ✓
- §4.5 system — Tasks 3, 5, 19 ✓
- §5.1 Daily cron — Task 19 ✓
- §5.2 Backfill — Task 20 ✓
- §5.3/5.4 Multiple rules / batches — Task 19 (test "two separate alerts") ✓
- §5.5 Khmer message format — Tasks 7, 8 ✓
- §6 Website — out of scope for this plan (frontend plan to follow)
- §7.1–7.3 Telegram setup + verify + send — Task 9 ✓
- §7.4 Env vars — Tasks 1, 2 ✓
- §8 Error handling — Task 19 (idempotency, failure marking) ✓
- §9 Testing strategy — TDD throughout ✓
- §10 Project structure — Task 1 (backend/) ✓

**No placeholders:** All test bodies have real assertions; all implementations have real code. No "implement later." Two notes:
- Task 12 calls the rule content "PLACEHOLDER" because the user will provide the MAFF PDF; the seed *script* is real, and the data swap is one file change.
- Task 22 is intentionally a manual runbook; the steps are concrete commands.

**Type consistency:** `processOneRule`, `runDailyCheck`, `runBackfillForAsset` exported and used in Task 20 — names match. `assetsRoutes` config gains `botToken`/`chatId` in Task 20 and that change is reflected in Task 21's wiring.

**Frontend will be a separate plan** (`2026-05-04-smartfarm-frontend.md`) once this backend is functional — the frontend can be developed against the running backend and is independently testable.
