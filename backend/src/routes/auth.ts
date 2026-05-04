import { Hono } from "hono"
import { setCookie, deleteCookie } from "hono/cookie"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { verifyTelegramLogin } from "~/lib/telegram"
import { signSession } from "~/lib/jwt"
import { collections } from "~/lib/db"
import { requireAuth } from "~/middleware/auth"

const TelegramLoginSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
})

interface AuthRouteConfig {
  botToken: string
  jwtSecret: string
  adminEmail: string
  adminPasswordHash: string
  adminUserId: string
}

export function authRoutes(cfg: AuthRouteConfig) {
  const app = new Hono()

  app.post("/telegram", async (c) => {
    const body = await c.req.json()
    const parsed = TelegramLoginSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: "bad payload" }, 400)

    try {
      verifyTelegramLogin(parsed.data, cfg.botToken)
    } catch {
      return c.json({ error: "invalid signature" }, 401)
    }

    const user = await collections.users().findOne({ telegram_id: parsed.data.id })
    if (!user || !user.approved) return c.json({ error: "access denied" }, 403)

    await collections.users().updateOne(
      { _id: user._id },
      { $set: { last_login_at: new Date() } },
    )

    const token = await signSession(
      { user_id: user._id.toHexString(), telegram_id: user.telegram_id },
      cfg.jwtSecret,
    )

    setCookie(c, "session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    return c.json({
      user: {
        id: user._id.toHexString(),
        telegram_id: user.telegram_id,
        display_name: user.display_name,
        telegram_username: user.telegram_username,
      },
    })
  })

  app.post("/password", async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
      return c.json({ error: "bad payload" }, 400)
    }
    const emailMatch = body.email === cfg.adminEmail
    const passwordMatch = await Bun.password.verify(body.password, cfg.adminPasswordHash)
    if (!emailMatch || !passwordMatch) {
      return c.json({ error: "invalid credentials" }, 401)
    }
    const token = await signSession({ user_id: cfg.adminUserId }, cfg.jwtSecret)
    setCookie(c, "session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
    return c.json({ ok: true })
  })

  app.get("/me", requireAuth, async (c) => {
    const session = c.get("session")
    const user = await collections.users().findOne({ _id: new ObjectId(session.user_id) })
    if (!user) return c.json({ error: "not found" }, 404)
    return c.json({
      user: {
        id: user._id.toHexString(),
        telegram_id: user.telegram_id,
        display_name: user.display_name,
        telegram_username: user.telegram_username,
      },
    })
  })

  app.post("/logout", (c) => {
    deleteCookie(c, "session", { path: "/" })
    return c.json({ ok: true })
  })

  return app
}
