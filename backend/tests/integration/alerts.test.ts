process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

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
    approved: true,
    created_at: new Date(),
    last_login_at: new Date(),
  })
  return signSession({ user_id: _id.toHexString(), telegram_id: 1 }, JWT_SECRET)
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
      telegram_chat_id: "-100",
      error: null,
      attempt_count: 1,
      ack_status: null,
      ack_at: null,
      ack_note_kh: null,
      ack_photo_file_id: null,
      ack_via: null,
      ack_by_chat_id: null,
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
        telegram_chat_id: "-100",
        error: null,
        attempt_count: 1,
        ack_status: null,
        ack_at: null,
        ack_note_kh: null,
        ack_photo_file_id: null,
        ack_via: null,
        ack_by_chat_id: null,
      },
      {
        _id: new ObjectId(),
        asset_id: assetB,
        rule_id: new ObjectId(),
        scheduled_for: today,
        sent_at: new Date(),
        delivery_status: "sent",
        telegram_message_id: 2,
        telegram_chat_id: "-100",
        error: null,
        attempt_count: 1,
        ack_status: null,
        ack_at: null,
        ack_note_kh: null,
        ack_photo_file_id: null,
        ack_via: null,
        ack_by_chat_id: null,
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
      telegram_chat_id: "-100",
      error: null,
      attempt_count: 1,
      ack_status: null,
      ack_at: null,
      ack_note_kh: null,
      ack_photo_file_id: null,
      ack_via: null,
      ack_by_chat_id: null,
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
})
