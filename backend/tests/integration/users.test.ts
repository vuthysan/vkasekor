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

async function seedUser(role: "admin" | "member") {
  const _id = new ObjectId()
  const telegram_id = role === "admin" ? 100 : 200
  await collections.users().insertOne({
    _id,
    telegram_id,
    telegram_username: role,
    display_name: role,
    role,
    created_at: new Date(),
    last_login_at: new Date(),
  })
  const token = await signSession({ user_id: _id.toHexString(), telegram_id, role }, JWT_SECRET)
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

describe("admin users routes", () => {
  it("admin can list users", async () => {
    const { token } = await seedUser("admin")
    const res = await buildApp().request("/api/admin/users", { headers: { Cookie: `session=${token}` } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.users).toHaveLength(1)
  })

  it("member is forbidden from listing users", async () => {
    const { token } = await seedUser("member")
    const res = await buildApp().request("/api/admin/users", { headers: { Cookie: `session=${token}` } })
    expect(res.status).toBe(403)
  })

  it("admin can create user", async () => {
    const { token } = await seedUser("admin")
    const res = await buildApp().request("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ telegram_id: 555, display_name: "Brother", role: "member" }),
    })
    expect(res.status).toBe(201)
  })

  it("admin cannot remove self", async () => {
    const { token, userId } = await seedUser("admin")
    const res = await buildApp().request(`/api/admin/users/${userId.toHexString()}`, {
      method: "DELETE",
      headers: { Cookie: `session=${token}` },
    })
    expect(res.status).toBe(400)
  })
})
