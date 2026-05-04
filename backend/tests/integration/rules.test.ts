process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { rulesRoutes } from "~/routes/rules"
import { signSession } from "~/lib/jwt"

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
  app.route("/api/rules", rulesRoutes({ jwtSecret: JWT_SECRET }))
  return app
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => clearAllCollections())

describe("GET /api/rules", () => {
  it("returns rules sorted by day_offset", async () => {
    await collections.rules().insertMany([
      {
        _id: new ObjectId(),
        asset_type: "chicken",
        day_offset: 14,
        category: "vaccine",
        severity: "critical",
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
    const token = await authToken()
    const res = await buildApp().request("/api/rules", { headers: { Cookie: `session=${token}` } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rules).toHaveLength(2)
    expect(body.rules[0].day_offset).toBe(7)
    expect(body.rules[1].day_offset).toBe(14)
  })

  it("filters by asset_type when query provided", async () => {
    await collections.rules().insertOne({
      _id: new ObjectId(),
      asset_type: "chicken",
      day_offset: 7,
      category: "vaccine",
      severity: "critical",
      title_kh: "x",
      title_en: "x",
      instructions_kh: "x",
      instructions_en: "x",
      source_page: 1,
    })
    const token = await authToken()
    const res = await buildApp().request("/api/rules?asset_type=chicken", {
      headers: { Cookie: `session=${token}` },
    })
    const body = await res.json()
    expect(body.rules).toHaveLength(1)
  })

  it("requires auth", async () => {
    const res = await buildApp().request("/api/rules")
    expect(res.status).toBe(401)
  })
})
