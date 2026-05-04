import { Hono } from "hono"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth, requireRole } from "~/middleware/auth"

const CreateSchema = z.object({
  telegram_id: z.number().int(),
  telegram_username: z.string().optional().default(""),
  display_name: z.string().min(1),
  role: z.enum(["admin", "member"]),
})

interface UsersRouteConfig {
  jwtSecret: string
}

export function adminUsersRoutes(_cfg: UsersRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth, requireRole("admin"))

  app.get("/", async (c) => {
    const users = await collections.users().find({}).sort({ created_at: -1 }).toArray()
    return c.json({ users })
  })

  app.post("/", async (c) => {
    const body = await c.req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const now = new Date()
    try {
      const result = await collections.users().insertOne({
        _id: new ObjectId(),
        telegram_id: parsed.data.telegram_id,
        telegram_username: parsed.data.telegram_username,
        display_name: parsed.data.display_name,
        role: parsed.data.role,
        created_at: now,
        last_login_at: now,
      })
      return c.json({ id: result.insertedId.toHexString() }, 201)
    } catch (err: any) {
      if (err?.code === 11000) return c.json({ error: "telegram_id already whitelisted" }, 409)
      throw err
    }
  })

  app.delete("/:id", async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const session = c.get("session")
    if (id === session.user_id) return c.json({ error: "cannot remove self" }, 400)
    const result = await collections.users().deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return c.json({ error: "not found" }, 404)
    return c.json({ ok: true })
  })

  return app
}
