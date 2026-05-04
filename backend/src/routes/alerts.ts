import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth } from "~/middleware/auth"
import { startOfDayInPhnomPenh } from "~/lib/lifecycle"

interface AlertsRouteConfig {
  jwtSecret: string
}

export function alertsRoutes(_cfg: AlertsRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth)

  app.get("/", async (c) => {
    const assetIdParam = c.req.query("asset_id")
    const daysParam = c.req.query("days")
    const filter: Record<string, unknown> = {}

    if (assetIdParam) {
      if (!ObjectId.isValid(assetIdParam)) return c.json({ error: "invalid asset_id" }, 400)
      filter.asset_id = new ObjectId(assetIdParam)
    } else if (daysParam) {
      const days = parseInt(daysParam, 10)
      if (isNaN(days) || days < 1 || days > 90) return c.json({ error: "days must be 1–90" }, 400)
      const today = startOfDayInPhnomPenh(new Date())
      const cutoff = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
      filter.scheduled_for = { $gte: cutoff }
    } else {
      filter.scheduled_for = startOfDayInPhnomPenh(new Date())
    }

    const alerts = await collections.alerts().find(filter).sort({ scheduled_for: -1 }).limit(200).toArray()
    return c.json({ alerts })
  })

  return app
}
