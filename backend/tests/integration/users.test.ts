process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

import { describe, expect, it, beforeAll, afterAll, beforeEach } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { adminUsersRoutes } from "~/routes/users"
import { signSession } from "~/lib/jwt"

const JWT_SECRET = "x".repeat(32)

async function seedUser() {
  const _id = new ObjectId()
  await collections.users().insertOne({
    _id,
    telegram_id: 100,
    telegram_username: "owner",
    display_name: "Owner",
    approved: true,
    created_at: new Date(),
    last_login_at: new Date(),
  })
  const token = await signSession({ user_id: _id.toHexString(), telegram_id: 100 }, JWT_SECRET)
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

describe("users management routes", () => {
  it("approved user can list users", async () => {
    const { token } = await seedUser()
    const res = await buildApp().request("/api/admin/users", { headers: { Cookie: `session=${token}` } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.users).toHaveLength(1)
  })

  it("unauthenticated request is rejected", async () => {
    const res = await buildApp().request("/api/admin/users")
    expect(res.status).toBe(401)
  })

  it("approved user can add a new user", async () => {
    const { token } = await seedUser()
    const res = await buildApp().request("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ telegram_id: 555, display_name: "Brother", approved: true }),
    })
    expect(res.status).toBe(201)
  })

  it("duplicate telegram_id returns 409", async () => {
    const { token } = await seedUser()
    const body = JSON.stringify({ telegram_id: 100, display_name: "Dup" })
    const res = await buildApp().request("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body,
    })
    expect(res.status).toBe(409)
  })

  it("cannot remove self", async () => {
    const { token, userId } = await seedUser()
    const res = await buildApp().request(`/api/admin/users/${userId.toHexString()}`, {
      method: "DELETE",
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(400)
  })
})
