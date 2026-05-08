process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { alertsRoutes } from "~/routes/alerts"
import { signSession } from "~/lib/jwt"

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

async function seedPendingAlert() {
  const _id = new ObjectId()
  await collections.alerts().insertOne({
    _id,
    asset_id: new ObjectId(),
    rule_id: new ObjectId(),
    scheduled_for: new Date(),
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
  return _id
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => clearAllCollections())

describe("PATCH /api/alerts/:id/ack", () => {
  it("marks an alert as done with optional note", async () => {
    const id = await seedPendingAlert()
    const token = await authToken()
    const res = await buildApp().request(`/api/alerts/${id.toHexString()}/ack`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ status: "done", note_kh: "ធ្វើរួចហើយ" }),
    })
    expect(res.status).toBe(200)
    const after = await collections.alerts().findOne({ _id: id })
    expect(after?.ack_status).toBe("done")
    expect(after?.ack_via).toBe("web")
    expect(after?.ack_note_kh).toBe("ធ្វើរួចហើយ")
  })

  it("marks an alert as blocked (escalation)", async () => {
    const id = await seedPendingAlert()
    const token = await authToken()
    const res = await buildApp().request(`/api/alerts/${id.toHexString()}/ack`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ status: "blocked" }),
    })
    expect(res.status).toBe(200)
    const after = await collections.alerts().findOne({ _id: id })
    expect(after?.ack_status).toBe("blocked")
  })

  it("rejects an invalid status enum", async () => {
    const id = await seedPendingAlert()
    const token = await authToken()
    const res = await buildApp().request(`/api/alerts/${id.toHexString()}/ack`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ status: "weird" }),
    })
    expect(res.status).toBe(400)
  })

  it("returns 404 for an unknown id", async () => {
    const token = await authToken()
    const res = await buildApp().request(
      `/api/alerts/${new ObjectId().toHexString()}/ack`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
        body: JSON.stringify({ status: "done" }),
      },
    )
    expect(res.status).toBe(404)
  })

  it("returns 401 without a session", async () => {
    const id = await seedPendingAlert()
    const res = await buildApp().request(`/api/alerts/${id.toHexString()}/ack`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    })
    expect(res.status).toBe(401)
  })
})

describe("PATCH /api/alerts/:id/done (legacy alias)", () => {
  it("still works and writes ack_status: done", async () => {
    const id = await seedPendingAlert()
    const token = await authToken()
    const res = await buildApp().request(`/api/alerts/${id.toHexString()}/done`, {
      method: "PATCH",
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(200)
    const after = await collections.alerts().findOne({ _id: id })
    expect(after?.ack_status).toBe("done")
    expect(after?.ack_via).toBe("web")
  })
})
