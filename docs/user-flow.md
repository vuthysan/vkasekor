# User Flow — Kasekor Helper

## Authentication Flow

```mermaid
flowchart TD
    A([User visits website]) --> B[Landing page / Login screen]
    B --> C[Click "Login with Telegram"]
    C --> D[Telegram Login Widget popup]
    D --> E{User authorises?}
    E -- No --> B
    E -- Yes --> F[Browser receives signed payload]
    F --> G[POST /api/auth/login with payload]
    G --> H{Backend verifies HMAC signature}
    H -- Invalid / expired --> I[401 — show error message]
    I --> B
    H -- Valid --> J[Look up User in DB]
    J --> K{Account approved?}
    K -- No --> L[403 — Access denied]
    L --> B
    K -- Yes --> M[Update last_login, issue JWT in HTTP-only cookie]
    M --> N([Redirect to Dashboard])
```

---

## Dashboard — Batch Overview

```mermaid
flowchart TD
    L([Dashboard]) --> M[GET /api/assets — fetch all batches]
    M --> N{Any active batches?}
    N -- No --> O[Show empty state + Register button]
    N -- Yes --> P[List cards: Batch ID · breed · age · status]
    P --> Q{User action}
    Q -- View detail --> R[GET /api/assets/:id]
    R --> S[Batch detail page: timeline, alert history]
    Q -- Register new batch --> T[New Batch form]
    Q -- Logout --> U[Clear cookie → Login screen]
```

---

## Register New Batch

```mermaid
flowchart TD
    T([New Batch form]) --> V[Fill: breed · quantity · arrival date · notes]
    V --> W[Submit → POST /api/assets]
    W --> X{Validation}
    X -- Invalid fields --> Y[Show inline errors]
    Y --> V
    X -- Valid --> Z{arrival_date in the past?}
    Z -- Yes --> AA[Trigger backfill: generate catch-up alerts for each missed day]
    Z -- No / today --> AB[Batch created, status = active]
    AA --> AB
    AB --> AC([Dashboard — new card visible])
```

---

## Daily Alert Engine (automated, no UI)

```mermaid
flowchart TD
    CRON([Cron fires at 07:00 ICT]) --> BA[Read last_cron_run from DB]
    BA --> BB[Enumerate missed days from lastRun+1 → today]
    BB --> BC[Fetch all active assets + all chicken rules]
    BC --> BD{For each day × asset}
    BD --> BE[Compute age = daysBetween arrival_date, processingDay]
    BE --> BF[Match rules where rule.day_offset == age]
    BF --> BG{Rule found?}
    BG -- No --> BH[Next asset / day]
    BG -- Yes --> BI[INSERT alert record — idempotent via unique index]
    BI --> BJ{Duplicate key 11000?}
    BJ -- Yes / already sent --> BH
    BJ -- No --> BK[Format Khmer message]
    BK --> BL[POST Telegram sendMessage]
    BL --> BM{Telegram response ok?}
    BM -- Yes --> BN[Update alert: status=sent, message_id]
    BM -- No / network error --> BO[Update alert: status=failed, error text]
    BN --> BH
    BO --> BH
    BH --> BP{age >= 60 and asset active?}
    BP -- Yes --> BQ[Set asset status = harvested]
    BP -- No --> BD
    BQ --> BD
    BD -- All done --> BR[Update last_cron_run = today]
```

---

## Edit Batch

```mermaid
flowchart TD
    S([Batch detail page]) --> EA{User action}
    EA -- Edit quantity / notes --> EB[PATCH /api/assets/:id]
    EB --> EC{Found?}
    EC -- No --> ED[404 — show error]
    EC -- Yes --> EE[Update quantity_current and/or notes]
    EE --> EF([Updated detail page])
    EA -- Archive batch --> EI[DELETE /api/assets/:id → status = archived]
    EI --> EJ([Dashboard — card removed from active list])
```

---

## Access Control

```mermaid
flowchart LR
    A[Telegram Login] --> B{Account in DB\nand approved = true?}
    B -- No --> C[Access denied]
    B -- Yes --> D[Full access: register · view · edit · archive batches]
```
