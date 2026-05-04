import type { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { verifySession } from "~/lib/jwt"
import { env } from "~/env"
import type { SessionPayload, Role } from "~/types"

declare module "hono" {
  interface ContextVariableMap {
    session: SessionPayload
  }
}

export async function requireAuth(c: Context, next: Next) {
  const token = getCookie(c, "session")
  if (!token) return c.json({ error: "unauthenticated" }, 401)
  try {
    const session = await verifySession(token, env.JWT_SECRET)
    c.set("session", session)
    await next()
  } catch {
    return c.json({ error: "unauthenticated" }, 401)
  }
}

export function requireRole(role: Role) {
  return async (c: Context, next: Next) => {
    const session = c.get("session")
    if (!session || session.role !== role) {
      return c.json({ error: "forbidden" }, 403)
    }
    await next()
  }
}
