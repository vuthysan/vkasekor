# Kasekor Helper — Frontend Design (V1)

**Status:** Approved (2026-05-04)
**Scope:** Next.js dashboard for managing chicken batches and viewing daily alerts

---

## 1. Goal

A mobile-first web app that lets approved family members log in via Telegram, register chicken batches, and see today's actionable alerts. The UI is entirely in Khmer. It calls the existing Hono backend (port 8080 in dev).

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS |
| Component library | HeroUI |
| Language | TypeScript |
| Auth | HTTP-only cookie set by backend — frontend never touches JWT |
| API calls | `lib/api-client.ts` fetch wrapper (`credentials: "include"`, redirects on 401) |

Backend base URL configured via `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8080`).

---

## 3. Visual Design

- **Theme:** Light — white background, green brand accent (`#16a34a`), card shadows
- **Navigation:** Bottom tab bar on mobile (< 768 px), top nav on desktop (≥ 768 px)
- **Language:** Khmer only for all labels, titles, and buttons
- **Numerals:** Khmer numerals (០–៩) for ages, quantities, and dates — consistent with Telegram alert format

---

## 4. Navigation

Four tabs, always visible:

| Tab (Khmer) | Route | Purpose |
|---|---|---|
| ទំព័រដើម | `/` | Today's alerts |
| ហ្វូងមាន់ | `/batches` | Active batch list |
| ប្រវត្តិ | `/alerts` | Full alert history |
| អ្នកប្រើ | `/users` | User management |

Sub-pages (not in tab bar, reached by navigation):
- `/batches/new` — new batch form (via FAB on `/batches`)
- `/batches/[id]` — batch detail, timeline, alert history

---

## 5. Auth Flow

1. User visits any protected route → redirected to `/login` (if no valid cookie).
2. `/login` renders the Telegram Login Widget (script tag with `data-bot-name`).
3. On Telegram confirm, widget calls `onauth` callback with signed payload.
4. Frontend POSTs payload to `POST /api/auth/telegram`.
5. Backend verifies HMAC, checks `approved: true`, sets HTTP-only cookie, returns `{ user }`.
6. Frontend stores display name in React context and redirects to `/`.
7. On 401 from any API call → `api-client.ts` clears local state and pushes to `/login`.
8. Logout: POST `/api/auth/logout` → cookie cleared → redirect to `/login`.

If user is not approved (403 from backend): show "សូមទាក់ទងអ្នកគ្រប់គ្រង ដើម្បីចូល" (Contact admin to be added).

---

## 6. Pages

### 6.1 Login — `/login`

- Public route (no auth required).
- Centred card, app logo, Telegram Login Widget button.
- Error state below button for 401 (bad signature) and 403 (not approved).

### 6.2 Home — `/`

- Header: today's date formatted in Khmer (e.g. "ថ្ងៃទី ០៤ ឧសភា ២០២៦").
- Fetches `GET /api/alerts?scheduled_for=today` (alerts where `scheduled_for` = today's ICT start-of-day). Backend alert route must support this query param.
- Alert cards sorted by severity: `critical` first, then `important`, then `info`.
- Each card shows:
  - Severity badge: 🚨 សំខាន់ / ⚠️ យកចិត្តទុកដាក់ / ℹ️ ព័ត៌មាន
  - Rule title in Khmer
  - Batch ID chip + day number (Khmer numeral)
  - Delivery status chip: បានផ្ញើ (green) / កំពុងរង់ចាំ (yellow) / បរាជ័យ (red)
- Empty state: chicken emoji + "គ្មានការជូនដំណឹងថ្ងៃនេះ"

### 6.3 Batches — `/batches`

- Fetches `GET /api/assets?status=active`.
- Batch cards showing: breed (Khmer label), age in days (Khmer numerals), current/initial quantity, expected harvest date.
- Status chip on each card: active = green.
- Tapping a card navigates to `/batches/[id]`.
- Green floating action button (bottom-right, `+`) links to `/batches/new`.
- Empty state: "មិនទាន់មានហ្វូងមាន់" + button to add first batch.

### 6.4 New Batch — `/batches/new`

Form fields (all labels in Khmer):

| Field | Khmer label | Input type | Notes |
|---|---|---|---|
| Type | ប្រភេទ | Locked to "មាន់" | V1 only chickens |
| Breed | ពូជ | Dropdown | ប្រ៉ូអ៊ីលែ / ស្រទាប់ / មូលដ្ឋាន |
| Quantity | ចំនួន | Number input | Positive integer |
| Arrival date | កាលបរិច្ឆេទ | Date picker | Defaults to today; past dates allowed (triggers backfill) |
| Notes | កំណត់ចំណាំ | Textarea | Optional |

- Client-side validation via HeroUI form rules before submit.
- Backend is authoritative (Zod); server errors shown inline.
- On success: redirect to `/batches`.
- Cancel button returns to `/batches`.

### 6.5 Batch Detail — `/batches/[id]`

**Read-only header:**
- Breed, batch ID, status chip, arrival date, expected harvest date.
- Age in days (Khmer numeral), current quantity / initial quantity.

**Lifecycle timeline:**
- Horizontal scrollable strip.
- Each rule milestone is a dot + day number.
- Colour coding: past (grey), today (green filled), future (grey outline).
- Tapping a milestone shows the rule title.

**Action buttons:**
- "កែប្រែ" (Edit) — opens a HeroUI modal with only `quantity_current` and `notes` fields. `arrival_date` is read-only in the modal. PATCHes `/api/assets/:id`.
- "ដកចេញ" (Archive) — confirm dialog, then DELETE `/api/assets/:id` → redirect to `/batches`.

**Alert history:**
- List of all alerts for this batch (`GET /api/alerts?asset_id=:id`).
- Columns: date, rule title, delivery status, error (if failed).

### 6.6 Alert History — `/alerts`

- Fetches `GET /api/alerts` (all alerts, last 30 days — no pagination in V1).
- Optional filter: batch selector dropdown.
- Sorted by `scheduled_for` descending.
- Same alert card design as home screen, with date shown.

### 6.7 Users — `/users`

- Fetches `GET /api/admin/users`.
- Table rows: display name, Telegram username, last login date, approved chip.
- "បន្ថែមអ្នកប្រើ" button opens modal:
  - Telegram ID (number input)
  - Display name (text input)
  - Approved toggle (default off)
  - POSTs to `POST /api/admin/users`
- Remove button on each row (disabled for own account). DELETEs `/api/admin/users/:id`.

---

## 7. File Structure

```
frontend/
├── app/
│   ├── layout.tsx                  # root layout, HeroUI provider, auth context
│   ├── login/
│   │   └── page.tsx
│   ├── (app)/                      # protected layout group
│   │   ├── layout.tsx              # auth guard + bottom nav / top nav
│   │   ├── page.tsx                # / — today's alerts
│   │   ├── batches/
│   │   │   ├── page.tsx            # /batches
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # /batches/new
│   │   │   └── [id]/
│   │   │       └── page.tsx        # /batches/[id]
│   │   ├── alerts/
│   │   │   └── page.tsx            # /alerts
│   │   └── users/
│   │       └── page.tsx            # /users
├── components/
│   ├── nav/
│   │   ├── BottomNav.tsx           # mobile bottom tab bar
│   │   └── TopNav.tsx              # desktop top nav
│   ├── alerts/
│   │   └── AlertCard.tsx           # single alert card with severity badge
│   ├── batches/
│   │   ├── BatchCard.tsx           # batch summary card
│   │   ├── BatchForm.tsx           # new batch form
│   │   ├── BatchEditModal.tsx      # edit quantity + notes
│   │   └── LifecycleTimeline.tsx   # horizontal rule milestone strip
│   ├── users/
│   │   ├── UserTable.tsx           # user list
│   │   └── AddUserModal.tsx        # add user form modal
│   └── TelegramLoginButton.tsx     # Login Widget wrapper
├── lib/
│   ├── api-client.ts               # fetch wrapper (credentials, 401 redirect)
│   └── khmer.ts                    # toKhmerNumerals, formatKhmerDate helpers
├── context/
│   └── auth.tsx                    # AuthContext: user info + logout helper
├── tailwind.config.ts              # HeroUI plugin registered
├── next.config.ts
├── .env.local.example
└── package.json
```

---

## 8. Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

---

## 9. Error Handling

| Scenario | Handling |
|---|---|
| 401 from any API call | `api-client.ts` redirects to `/login` |
| 403 on login (not approved) | Show Khmer message on login page |
| Network error on form submit | Inline error banner in Khmer |
| Empty states | Each list page has a Khmer empty-state message |
| Invalid batch ID in URL | `notFound()` from Next.js |

---

## 10. Out of Scope (V1)

- Push notifications or PWA install prompt
- Offline support
- Multi-language toggle
- Analytics or charts
- Rules management UI (rules are seeded directly in DB)
- Pagination (last 30 days / 50 records is sufficient for V1 family use)
