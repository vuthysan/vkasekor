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
    const match: Record<string, unknown> = {}

    if (assetIdParam) {
      if (!ObjectId.isValid(assetIdParam)) return c.json({ error: "invalid asset_id" }, 400)
      match.asset_id = new ObjectId(assetIdParam)
    } else if (daysParam) {
      const days = parseInt(daysParam, 10)
      if (isNaN(days) || days < 1 || days > 90) return c.json({ error: "days must be 1–90" }, 400)
      const today = startOfDayInPhnomPenh(new Date())
      const cutoff = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
      match.scheduled_for = { $gte: cutoff }
    } else {
      match.scheduled_for = startOfDayInPhnomPenh(new Date())
    }

    // Aggregate: join rule fields + asset info in one query
    const alerts = await collections.alerts().aggregate([
      { $match: { ...match, farmer_done_at: null } }, // exclude already-done tasks
      { $sort: { scheduled_for: -1 } },
      { $limit: 200 },
      {
        $lookup: {
          from: "rules",
          localField: "rule_id",
          foreignField: "_id",
          as: "_rule",
        },
      },
      {
        $unwind: {
          path: "$_rule",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "assets",
          localField: "asset_id",
          foreignField: "_id",
          as: "_asset",
        },
      },
      {
        $unwind: {
          path: "$_asset",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          asset_id: 1,
          rule_id: 1,
          scheduled_for: 1,
          sent_at: 1,
          delivery_status: 1,
          farmer_done_at: 1,
          // From rule
          asset_type:      "$_rule.asset_type",
          day_offset:      "$_rule.day_offset",
          category:        "$_rule.category",
          severity:        "$_rule.severity",
          title_kh:        "$_rule.title_kh",
          instructions_kh: "$_rule.instructions_kh",
          // From asset
          asset_breed: "$_asset.breed",
          asset_notes: "$_asset.notes",
        },
      },
    ]).toArray()

    return c.json({ alerts })
  })

  // Mark a task as done by the farmer
  app.patch("/:id/done", async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)

    const result = await collections.alerts().updateOne(
      { _id: new ObjectId(id) },
      { $set: { farmer_done_at: new Date() } },
    )

    if (result.matchedCount === 0) return c.json({ error: "not found" }, 404)
    return c.json({ ok: true })
  })

  return app
}
