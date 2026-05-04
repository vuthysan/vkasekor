process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

import { describe, expect, it, beforeAll, afterAll, beforeEach, mock } from "bun:test"
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
  app.route("/api/assets", assetsRoutes({ jwtSecret: JWT_SECRET, botToken: "1:T", chatId: "-100" }))
  return app
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => {
  await clearAllCollections()
  globalThis.fetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 }),
  ) as any
})

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
})
