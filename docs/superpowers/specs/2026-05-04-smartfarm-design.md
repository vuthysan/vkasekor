# SmartFarm Logic Engine — Design (V1)

**Status:** Approved (2026-05-04)
**Author:** brainstorming session with user
**Scope:** V1 — chicken lifecycle alerts only (cattle and lemon trees deferred to V2)

---

## 1. Goal

Translate the MAFF (Cambodia) Chicken Raising Guide into an automated alerting system that helps a non-technical family operator manage chicken batches through daily, actionable Telegram messages in Khmer.

The system has two surfaces:
- A **website** (multi-user, behind login) for registering and managing chicken batches.
- A **Telegram group** (single shared family group) that receives outbound alerts only.

V1 is deliberately one-way: alerts go *out* to Telegram; the bot does not read or respond to messages in the group.

---

## 2. V1 Scope (confirmed decisions)

| Decision | Choice |
|---|---|
| Asset type | Chickens only |
| Frontend | Next.js (App Router) + TailwindCSS + HeroUI |
| Backend | Hono + Bun (separate repo / deploy from frontend) |
| Database | MongoDB |
| Auth | Telegram Login Widget, with a `users` whitelist |
| Alert direction | One-way: server → Telegram group |
| Cron fire time | 07:00 Asia/Phnom_Penh, daily |
| Rules source | MAFF Chicken Raising Guide PDF (user-provided) |
| Roles | `admin` (CRUD users + batches) and `member` (CRUD batches only) |
| Deployment | Deferred — out of scope for this spec |

### Explicitly out of scope for V1

- "Done" buttons / inline callback queries on alerts.
- Predictive feed inventory math.
- Multi-language toggle (Khmer is the only display language; English fields exist only for admin readability).
- SMS or email fallback.
- Per-user alert routing.
- Cattle and lemon tree lifecycles.
- Bot-managed user invitations (admins add users via the admin web page).
- Rules admin UI (rules are seeded once from the MAFF PDF; edits go through the database directly).
- Analytics, charts, reports.
- `/status` or any other inbound bot command.

---

## 3. Architecture

```
┌─────────────────────────────┐         ┌────────────────────────────┐
│   Next.js + HeroUI          │         │   Hono + Bun (API)         │
│   ─────────────────────     │         │   ──────────────────       │
│   • /login                  │ ──HTTPS─▶  • /api/auth/telegram      │
│   • / (dashboard)           │         │   • /api/assets (CRUD)     │
│   • /batches/new            │         │   • /api/rules (read)      │
│   • /batches/[id]           │         │   • /api/alerts (read)     │
│   • /admin/users            │         │   • /api/admin/users       │
└─────────────────────────────┘         │                            │
                                        │   ┌───────────────────┐    │
                                        │   │  Cron worker      │    │
                                        │   │  daily 07:00 ICT  │    │
                                        │   │  → compute age    │    │
                                        │   │  → match rules    │    │
                                        │   │  → send alerts    │    │
                                        │   └───────────────────┘    │
                                        └─────────┬──────────────────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐    ┌────────────────────┐
                                        │   MongoDB        │    │  Telegram Bot API   │
                                        │   • users        │    │   sendMessage       │
                                        │   • assets       │    │   → family group    │
                                        │   • rules        │    └────────────────────┘
                                        │   • alerts       │
                                        └──────────────────┘
```

**Three logical concerns inside the Hono backend, sharing one MongoDB connection:**

1. **REST API** — what the Next.js frontend calls.
2. **Cron worker** — wakes at 07:00 Asia/Phnom_Penh, scans active assets, sends matching alerts.
3. **Telegram auth verifier** — validates Login Widget hash signatures from the frontend.

---

## 4. Data Model (MongoDB)

### 4.1 `users`
Whitelisted family members allowed to log in.

```ts
{
  _id: ObjectId,
  telegram_id: number,            // verified via Login Widget
  telegram_username: string,
  display_name: string,           // "Mom", "Dad", "Brother"
  role: "admin" | "member",
  created_at: Date,
  last_login_at: Date,
}
```

Index: `{ telegram_id: 1 }` unique.

### 4.2 `assets`
One document per registered batch.

```ts
{
  _id: ObjectId,
  type: "chicken",                // V1: only chicken
  breed: "broiler" | "layer" | "local",
  quantity_initial: number,
  quantity_current: number,       // editable; reflects deaths/sales
  arrival_date: Date,             // immutable; Day 0 anchor
  expected_harvest_date: Date,    // arrival_date + 60 (computed at insert time)
  status: "active" | "harvested" | "archived",
  notes: string,
  created_by: ObjectId,           // → users._id
  created_at: Date,
  updated_at: Date,
}
```

Indexes: `{ status: 1 }`, `{ type: 1, status: 1 }`.

`arrival_date` is **immutable after creation** — editing it would invalidate every alert already sent for that batch. The `/batches/[id]` edit dialog only exposes `quantity_current` and `notes`.

### 4.3 `rules`
The MAFF Logic Skill — encoded once from the PDF, rarely edited.

```ts
{
  _id: ObjectId,
  asset_type: "chicken",
  day_offset: number,             // days from arrival_date (0..60+)
  category: "vaccine" | "feed" | "health" | "housing" | "harvest",
  severity: "critical" | "important" | "info",
  title_kh: string,
  title_en: string,
  instructions_kh: string,        // multi-line, action-oriented
  instructions_en: string,
  source_page: number,            // page in MAFF PDF, for traceability
}
```

Indexes: `{ asset_type: 1, day_offset: 1 }`.

### 4.4 `alerts`
Log of every alert send attempt.

```ts
{
  _id: ObjectId,
  asset_id: ObjectId,             // → assets._id
  rule_id: ObjectId,              // → rules._id
  scheduled_for: Date,            // start-of-day in Asia/Phnom_Penh
  sent_at: Date | null,
  delivery_status: "pending" | "sent" | "failed",
  telegram_message_id: number | null,
  error: string | null,
  attempt_count: number,          // 1..3
}
```

Index: `{ asset_id: 1, rule_id: 1, scheduled_for: 1 }` **unique** — guarantees idempotency. Even if the cron fires twice on the same day, no duplicate Telegram message is sent.

Also: `{ delivery_status: 1, scheduled_for: 1 }` for the retry sweep.

### 4.5 `system`
Single-row metadata used by the cron worker.

```ts
{
  _id: ObjectId,
  key: "last_cron_run",
  value: Date,                    // start-of-day in Asia/Phnom_Penh of the last successful run
}
```

Index: `{ key: 1 }` unique.

---

## 5. The Logic Engine

### 5.1 Daily cron (`daily-check`)

Fires at 07:00 Asia/Phnom_Penh. Pseudocode:

```
function dailyCheck():
    today = startOfDay(now, "Asia/Phnom_Penh")

    # 1. Catch-up: if last successful run was >24h ago, also process missed days.
    lastRun = db.system.findOne({ key: "last_cron_run" })
    daysToProcess = enumerateDaysFrom(lastRun.value || today, today)

    for processingDay in daysToProcess:
        activeAssets = db.assets.find({ status: "active" })

        for asset in activeAssets:
            ageInDays = daysBetween(asset.arrival_date, processingDay)
            if ageInDays < 0: continue   # not yet arrived

            matchingRules = db.rules.find({
                asset_type: asset.type,
                day_offset: ageInDays
            })

            for rule in matchingRules:
                # Idempotency: unique index on (asset, rule, day) prevents duplicates.
                try:
                    alertDoc = db.alerts.insertOne({
                        asset_id: asset._id,
                        rule_id: rule._id,
                        scheduled_for: processingDay,
                        delivery_status: "pending",
                        attempt_count: 0,
                    })
                except DuplicateKey:
                    continue   # already processed this day

                isCatchUp = (processingDay < today)
                message = formatKhmerMessage(asset, rule, { catchUp: isCatchUp })
                result = telegram.sendMessage(GROUP_ID, message)

                db.alerts.updateOne({ _id: alertDoc._id }, {
                    $set: {
                        sent_at: now(),
                        delivery_status: result.ok ? "sent" : "failed",
                        telegram_message_id: result.message_id,
                        error: result.error,
                    },
                    $inc: { attempt_count: 1 },
                })

            # Auto-harvest at day 60.
            if ageInDays >= 60:
                db.assets.updateOne({ _id: asset._id }, { $set: { status: "harvested" } })

    # 2. Retry sweep: any failed alerts from the last 3 days, attempt_count < 3.
    retryFailedAlerts(maxAttempts: 3, windowDays: 3)

    db.system.updateOne({ key: "last_cron_run" }, { $set: { value: today } }, { upsert: true })
```

### 5.2 Backfill on past arrival dates

When a user registers a batch with `arrival_date` in the past (e.g., chicks arrived 5 days ago), the `POST /api/assets` handler immediately enqueues a backfill. For each `day_offset` from `0` through the current age, every matching rule produces one `alerts` row with `scheduled_for` set to today's start-of-day. Each is sent as a separate Telegram message, prefixed with `[ត្រួតឡើងវិញ]` (catch-up). One message per rule keeps the format consistent with normal alerts; the prefix makes clear these are historical, not net-new.

### 5.3 Multiple rules on the same day

If day 14 has both a vaccine rule and a feed-switch rule, **two separate Telegram messages** are sent — easier for the operator to action one at a time.

### 5.4 Multiple batches matching the same rule

One Telegram message **per batch**. Don't merge — the operator must be able to distinguish which batch needs action.

### 5.5 Khmer message format

```
🐔 ថ្ងៃទី ៧ — Batch #A1
━━━━━━━━━━━━━━━━━━━━━
[🚨 សំខាន់] ចាក់វ៉ាក់សាំង Newcastle

ចំនួនមាន់: ៥០ ក្បាល
អាយុ: ៧ ថ្ងៃ

📋 របៀបធ្វើ:
• ត្រៀមវ៉ាក់សាំង Newcastle (B1 strain)
• ចាក់ដោយដក់ចូលក្នុងភ្នែកម្ខាង ឬច្រមុះ
• ធ្វើនៅពេលព្រឹក ឬល្ងាច (មិនត្រូវពេលថ្ងៃក្តៅ)

📖 ប្រភព: MAFF ទំព័រ ១២
```

- Khmer numerals (០–៩) for the day number, age, and quantity.
- Severity badge: `🚨 សំខាន់` (critical), `⚠️ យកចិត្តទុកដាក់` (important), `ℹ️ ព័ត៌មាន` (info).
- Source page reference for traceability.
- Catch-up alerts are prefixed with `[ត្រួតឡើងវិញ]`.

---

## 6. Website (Next.js + HeroUI)

### 6.1 Pages

| Path | Purpose | Auth |
|---|---|---|
| `/login` | Telegram Login Widget | public |
| `/` | Dashboard: active batches + today's alerts | logged-in |
| `/batches/new` | Register a new batch | logged-in |
| `/batches/[id]` | Batch detail, lifecycle timeline, alert history, edit | logged-in |
| `/admin/users` | Manage whitelisted users | admin only |

### 6.2 Login flow

1. User visits `/login` → Telegram Login Widget renders.
2. User clicks → opens Telegram, confirms.
3. Frontend receives `{ id, first_name, username, photo_url, auth_date, hash }`.
4. Frontend POSTs to `/api/auth/telegram`.
5. Backend verifies hash (HMAC-SHA256 with key = `SHA256(BOT_TOKEN)`), checks `auth_date < 24h`, looks up `telegram_id` in the whitelist.
6. Backend issues JWT (HMAC-SHA256, 7-day expiry), sets HTTP-only `Secure` `SameSite=Lax` cookie.
7. Frontend redirects to `/`.

If `telegram_id` is not whitelisted → frontend shows "Contact admin to be added."

### 6.3 Dashboard layout

- **Left:** active batches table — columns: Batch ID, Breed, Age (days), Quantity (current/initial), Next alert (day + title), Actions.
- **Right:** today's alerts — list with delivery status badges (`Sent ✓`, `Pending`, `Failed`).

### 6.4 Register batch form

Fields:
- Type — dropdown (V1: only "Chicken")
- Breed — dropdown (Broiler / Layer / Local)
- Quantity — number input
- Arrival date — date picker, defaults to today, **allows past dates** (triggers backfill)
- Notes — textarea (optional)

Validation: HeroUI form rules client-side, Zod schema server-side. Server is authoritative.

### 6.5 Batch detail page

- Read-only header: type, breed, age, arrival_date, expected_harvest_date, status.
- **Lifecycle timeline:** horizontal strip of every rule for this asset type, marked past / today / future, with sent/pending state.
- **Edit dialog** (member or admin): only `quantity_current` and `notes`. `arrival_date` is locked.
- **Archive button** (admin only): sets `status = "archived"`.
- **Alert history table:** all alerts for this batch with timestamp, status, error if any.

### 6.6 Admin users page

- Table: telegram_id, display_name, role, last_login_at.
- "Add user" form: telegram_id (number), display_name (string), role (admin/member).
- Remove user button (cannot remove self).

---

## 7. Telegram Integration

A single bot serves both auth (inbound from web) and alerts (outbound to group).

### 7.1 One-time setup

1. Create bot via `@BotFather` → obtain `BOT_TOKEN`.
2. Set bot domain via BotFather `/setdomain` (must match the website's HTTPS domain, required for Login Widget).
3. Add bot to the family Telegram group; obtain group `chat_id` (negative integer).

### 7.2 Login Widget verification

Per Telegram's official spec — no third-party library needed.

```ts
// POST /api/auth/telegram
function verifyTelegramAuth(payload) {
  const { hash, ...fields } = payload
  const dataString = Object.keys(fields).sort()
    .map(k => `${k}=${fields[k]}`).join("\n")
  const secretKey = sha256(BOT_TOKEN)
  const expectedHash = hmacSha256(secretKey, dataString)
  if (expectedHash !== hash) throw new Error("invalid signature")
  if (now() - payload.auth_date * 1000 > 24 * 60 * 60 * 1000) throw new Error("expired")
  return payload
}
```

### 7.3 Outbound send

```ts
async function sendAlert(text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_GROUP_ID,
      text,
      parse_mode: "HTML",
      disable_notification: false,
    }),
  })
  return res.json()
}
```

### 7.4 Environment variables

```
BOT_TOKEN=<from BotFather>
TELEGRAM_GROUP_ID=<-100xxxxxxxxxx>
JWT_SECRET=<generated>
MONGODB_URI=<connection string>
TZ=Asia/Phnom_Penh
```

---

## 8. Error Handling & Observability

### 8.1 Failure modes

| Failure | Handling |
|---|---|
| Telegram 4xx (bad token, blocked, rate limit) | Mark `failed`, log error, retry on next cron with exponential backoff (up to 3 attempts over 3 days). |
| Telegram timeout / 5xx | Same as above. |
| MongoDB connection drops | Process exits non-zero; supervisor restarts. Idempotency index prevents double-send on restart. |
| Cron didn't fire (server down) | On startup, compare `last_cron_run` to today. If older than 24h, run catch-up immediately. |
| Malformed batch submission | Frontend validation (HeroUI rules) + backend Zod schema. Backend is authoritative. |
| Unknown user attempts login | Frontend message "Contact admin to be added." No DB write. |

**Idempotency guarantee:** the unique compound index on `alerts.{asset_id, rule_id, scheduled_for}` ensures duplicate cron runs do not re-send.

### 8.2 Logging (V1)

- Per-alert log line: `[2026-05-10T07:00:01Z] sent rule=newcastle batch=A1 msg_id=4521`
- Cron run boundaries: `[cron-start ts=... assets=3 rules_matched=2]` / `[cron-end duration=1.2s sent=2 failed=0]`
- Errors via `console.error` with stack.
- Plain `console.log` to stdout — no structured logging library in V1.

---

## 9. Testing Strategy

### 9.1 Unit tests (Bun test runner)

- `lib/lifecycle.ts` — `daysBetween`, age computation, Asia/Phnom_Penh timezone correctness.
- `lib/rule-matcher.ts` — given an asset and current date, returns the correct matching rules.
- `lib/khmer-formatter.ts` — given asset + rule, renders the expected Khmer message string.
- `lib/telegram-auth.ts` — verify Login Widget hash with a fixture from Telegram's docs.

### 9.2 Integration tests

- `daily-check` end-to-end with `mongodb-memory-server` and a mocked `fetch` for Telegram. Assert correct alerts written; idempotency holds when run twice.
- Auth flow with a fake Telegram payload signed with a test bot token.

### 9.3 Manual test

Real bot in a private test group, register a batch with `arrival_date = today − 7 days`, trigger cron via a `dev`-only endpoint, watch the message arrive.

---

## 10. Project Structure

```
kasekor-helper/
├── frontend/                          # Next.js + HeroUI
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx               # /
│   │   │   ├── batches/new/page.tsx
│   │   │   ├── batches/[id]/page.tsx
│   │   │   └── admin/users/page.tsx
│   │   ├── layout.tsx
│   │   └── api/                       # thin proxy to Hono if cookie handling requires it
│   ├── components/
│   │   ├── BatchList.tsx
│   │   ├── BatchForm.tsx
│   │   ├── LifecycleTimeline.tsx
│   │   └── TelegramLoginButton.tsx
│   ├── lib/api-client.ts
│   ├── tailwind.config.ts             # with HeroUI plugin
│   └── package.json
│
├── backend/                           # Hono + Bun
│   ├── src/
│   │   ├── index.ts                   # Hono app entry
│   │   ├── routes/
│   │   │   ├── auth.ts                # /api/auth/telegram
│   │   │   ├── assets.ts              # /api/assets CRUD
│   │   │   ├── rules.ts               # /api/rules (read)
│   │   │   ├── alerts.ts              # /api/alerts (read history)
│   │   │   └── users.ts               # /api/admin/users
│   │   ├── lib/
│   │   │   ├── db.ts                  # MongoDB client
│   │   │   ├── lifecycle.ts           # age math, timezone
│   │   │   ├── rule-matcher.ts        # the engine
│   │   │   ├── khmer-formatter.ts     # message rendering
│   │   │   ├── telegram.ts            # send + auth verify
│   │   │   └── jwt.ts
│   │   ├── cron/
│   │   │   └── daily-check.ts         # 07:00 ICT job
│   │   ├── seeds/
│   │   │   └── maff-chicken-rules.ts  # encoded from PDF
│   │   └── types.ts
│   ├── tests/
│   └── package.json
│
└── docs/
    ├── superpowers/specs/
    │   └── 2026-05-04-smartfarm-design.md   # this document
    └── MAFF-chicken-guide.pdf                # source material (user-provided)
```

---

## 11. Build Sequence (high level)

1. **Backend skeleton** — Hono + Bun + MongoDB connection, health endpoint.
2. **Data model + indexes** — collections, unique compound index on `alerts`.
3. **Telegram lib** — auth verify + send, with unit tests.
4. **MAFF rules seed** — encode PDF rules into `seeds/maff-chicken-rules.ts`, run once.
5. **API routes** — `/api/auth/telegram`, `/api/assets` CRUD, `/api/admin/users`.
6. **Cron worker** — `daily-check`, including catch-up and retry sweep, with integration test.
7. **Frontend skeleton** — Next.js + Tailwind + HeroUI provider.
8. **Login page** — Telegram Login Widget wired to `/api/auth/telegram`.
9. **Dashboard, batch form, batch detail, admin users** — pages and components.
10. **Manual end-to-end** — register a backdated batch, watch Telegram fire.

Detailed implementation plan to follow via the writing-plans workflow.
