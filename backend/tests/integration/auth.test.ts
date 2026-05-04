process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

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
  it("issues a session for an approved user", async () => {
    await collections.users().insertOne({
      _id: new ObjectId(),
      telegram_id: 42,
      telegram_username: "abc",
      display_name: "Test",
      approved: true,
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
