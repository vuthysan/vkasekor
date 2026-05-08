process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

import { describe, expect, it, beforeAll, afterAll, beforeEach, mock } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { ledgerRoutes } from "~/routes/ledger"
import { signSession } from "~/lib/jwt"

const JWT_SECRET = "x".repeat(32)
const FX_RATE = 4100

async function authToken() {
  const _id = new ObjectId()
  await collections.users().insertOne({
    _id,
    telegram_id: 1,
    telegram_username: "u",
    display_name: "U",
    approved: true,
    created_at: new Date(),
    last_login_at: new Date(),
  })
  return signSession({ user_id: _id.toHexString(), telegram_id: 1 }, JWT_SECRET)
}

function buildApp() {
  const app = new Hono()
  app.route(
    "/api/ledger",
    ledgerRoutes({ botToken: "1:T", chatId: "-100", defaultFxRateKhrPerUsd: FX_RATE }),
  )
  return app
}

async function seedAsset(opts?: { quantity_initial?: number; quantity_current?: number }) {
  const _id = new ObjectId()
  const initial = opts?.quantity_initial ?? 100
  const current = opts?.quantity_current ?? initial
  await collections.assets().insertOne({
    _id,
    type: "chicken",
    breed: "broiler",
    quantity_initial: initial,
    quantity_current: current,
    arrival_date: new Date(),
    expected_harvest_date: new Date(),
    status: "active",
    notes: "",
    created_by: new ObjectId(),
    created_at: new Date(),
    updated_at: new Date(),
  })
  return _id
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => {
  await clearAllCollections()
  // No outbound Telegram from these tests, but the route depends on fetch existing.
  globalThis.fetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 }),
  ) as any
})

describe("POST /api/ledger — currency handling", () => {
  it("stores a KHR expense with both currencies denormalized", async () => {
    const assetId = await seedAsset()
    const token = await authToken()
    const res = await buildApp().request("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({
        asset_id: assetId.toHexString(),
        type: "expense",
        currency: "KHR",
        amount: 410_000,
        note_kh: "ចំណាយចំណី",
      }),
    })
    expect(res.status).toBe(201)
    const stored = await collections.ledger().findOne({ asset_id: assetId })
    expect(stored?.currency).toBe("KHR")
    expect(stored?.amount).toBe(410_000)
    expect(stored?.amount_khr).toBe(410_000)
    expect(stored?.amount_usd).toBeCloseTo(100, 5)
    expect(stored?.fx_rate_khr_per_usd).toBe(FX_RATE)
  })

  it("stores a USD revenue with both currencies denormalized", async () => {
    const assetId = await seedAsset()
    const token = await authToken()
    await buildApp().request("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({
        asset_id: assetId.toHexString(),
        type: "revenue",
        currency: "USD",
        amount: 50,
      }),
    })
    const stored = await collections.ledger().findOne({ asset_id: assetId })
    expect(stored?.currency).toBe("USD")
    expect(stored?.amount).toBe(50)
    expect(stored?.amount_usd).toBe(50)
    expect(stored?.amount_khr).toBe(50 * FX_RATE)
  })

  it("accepts the legacy {amount_usd} shape", async () => {
    const assetId = await seedAsset()
    const token = await authToken()
    await buildApp().request("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({
        asset_id: assetId.toHexString(),
        type: "expense",
        amount_usd: 25,
      }),
    })
    const stored = await collections.ledger().findOne({ asset_id: assetId })
    expect(stored?.currency).toBe("USD")
    expect(stored?.amount_usd).toBe(25)
    expect(stored?.amount_khr).toBe(25 * FX_RATE)
  })
})

describe("GET /api/ledger/:asset_id — per-batch summary", () => {
  it("aggregates KHR and USD entries into both currencies", async () => {
    const assetId = await seedAsset({ quantity_initial: 100, quantity_current: 90 })
    const token = await authToken()

    // KHR expense + USD expense
    await collections.ledger().insertMany([
      {
        _id: new ObjectId(),
        asset_id: assetId,
        type: "expense",
        currency: "KHR",
        amount: 410_000,
        amount_khr: 410_000,
        amount_usd: 100,
        fx_rate_khr_per_usd: FX_RATE,
        recorded_at: new Date(),
        created_by: new ObjectId(),
      },
      {
        _id: new ObjectId(),
        asset_id: assetId,
        type: "expense",
        currency: "USD",
        amount: 50,
        amount_khr: 50 * FX_RATE,
        amount_usd: 50,
        fx_rate_khr_per_usd: FX_RATE,
        recorded_at: new Date(),
        created_by: new ObjectId(),
      },
      {
        _id: new ObjectId(),
        asset_id: assetId,
        type: "revenue",
        currency: "KHR",
        amount: 1_000_000,
        amount_khr: 1_000_000,
        amount_usd: 1_000_000 / FX_RATE,
        fx_rate_khr_per_usd: FX_RATE,
        recorded_at: new Date(),
        created_by: new ObjectId(),
      },
    ])

    const res = await buildApp().request(`/api/ledger/${assetId.toHexString()}`, {
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.summary.total_expense_khr).toBe(410_000 + 50 * FX_RATE)
    expect(body.summary.total_expense_usd).toBeCloseTo(100 + 50, 5)
    expect(body.summary.total_revenue_khr).toBe(1_000_000)
    expect(body.summary.profit_loss_khr).toBe(1_000_000 - (410_000 + 50 * FX_RATE))
  })

  it("computes survival rate, cost-per-head, and margin %", async () => {
    const assetId = await seedAsset({ quantity_initial: 100, quantity_current: 80 })
    const token = await authToken()

    await collections.ledger().insertMany([
      {
        _id: new ObjectId(),
        asset_id: assetId,
        type: "expense",
        currency: "KHR",
        amount: 800_000,
        amount_khr: 800_000,
        amount_usd: 800_000 / FX_RATE,
        fx_rate_khr_per_usd: FX_RATE,
        recorded_at: new Date(),
        created_by: new ObjectId(),
      },
      {
        _id: new ObjectId(),
        asset_id: assetId,
        type: "revenue",
        currency: "KHR",
        amount: 1_000_000,
        amount_khr: 1_000_000,
        amount_usd: 1_000_000 / FX_RATE,
        fx_rate_khr_per_usd: FX_RATE,
        recorded_at: new Date(),
        created_by: new ObjectId(),
      },
    ])

    const res = await buildApp().request(`/api/ledger/${assetId.toHexString()}`, {
      headers: { Cookie: `session=${token}` },
    })
    const body = await res.json()

    expect(body.summary.survival_rate).toBe(0.8) // 80/100
    expect(body.summary.cost_per_surviving_khr).toBe(800_000 / 80) // 10_000 KHR/head
    // margin = profit / max(revenue, expense) = 200_000 / 1_000_000 = 0.2
    expect(body.summary.margin_pct).toBeCloseTo(0.2, 5)
    expect(body.summary.quantity_initial).toBe(100)
    expect(body.summary.quantity_current).toBe(80)
  })

  it("falls back gracefully on legacy USD-only entries (no currency field)", async () => {
    const assetId = await seedAsset({ quantity_initial: 50, quantity_current: 50 })
    const token = await authToken()

    // Pre-currency entry: only amount_usd, no currency/amount_khr/fx_rate_khr_per_usd.
    await collections.ledger().insertOne({
      _id: new ObjectId(),
      asset_id: assetId,
      type: "expense",
      amount_usd: 30,
      recorded_at: new Date(),
      created_by: new ObjectId(),
    })

    const res = await buildApp().request(`/api/ledger/${assetId.toHexString()}`, {
      headers: { Cookie: `session=${token}` },
    })
    const body = await res.json()
    expect(body.summary.total_expense_usd).toBe(30)
    // KHR should be derived using the configured fallback rate (4100).
    expect(body.summary.total_expense_khr).toBe(30 * FX_RATE)
  })

  it("returns 404 for a non-existent asset", async () => {
    const token = await authToken()
    const res = await buildApp().request(
      `/api/ledger/${new ObjectId().toHexString()}`,
      { headers: { Cookie: `session=${token}` } },
    )
    expect(res.status).toBe(404)
  })
})
