import { Hono } from "hono"
import { collections } from "~/lib/db"
import { requireAuth } from "~/middleware/auth"
import type { AssetType } from "~/types"

interface RulesRouteConfig {
  jwtSecret: string
}

export function rulesRoutes(_cfg: RulesRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth)

  app.get("/", async (c) => {
    const assetType = c.req.query("asset_type") as AssetType | undefined
    const filter = assetType ? { asset_type: assetType } : {}
    const rules = await collections.rules().find(filter).sort({ day_offset: 1 }).toArray()
    return c.json({ rules })
  })

  return app
}
