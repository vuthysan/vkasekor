import { Hono } from "hono"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth, requireRole } from "~/middleware/auth"
import { addDays, startOfDayInPhnomPenh } from "~/lib/lifecycle"
import { runBackfillForAsset } from "~/cron/daily-check"
import type { Asset } from "~/types"

const CreateSchema = z.object({
  type: z.literal("chicken"),
  breed: z.enum(["broiler", "layer", "local"]),
  quantity_initial: z.number().int().positive(),
  arrival_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional().default(""),
})

const PatchSchema = z.object({
  quantity_current: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
})

interface AssetsRouteConfig {
  jwtSecret: string
  botToken: string
  chatId: string
}

export function assetsRoutes(cfg: AssetsRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth)

  app.post("/", async (c) => {
    const body = await c.req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const session = c.get("session")
    const arrival = startOfDayInPhnomPenh(new Date(`${parsed.data.arrival_date}T00:00:00Z`))
    const expected_harvest = addDays(arrival, 60)
    const now = new Date()
    const asset: Asset = {
      _id: new ObjectId(),
      type: parsed.data.type,
      breed: parsed.data.breed,
      quantity_initial: parsed.data.quantity_initial,
      quantity_current: parsed.data.quantity_initial,
      arrival_date: arrival,
      expected_harvest_date: expected_harvest,
      status: "active",
      notes: parsed.data.notes,
      created_by: new ObjectId(session.user_id),
      created_at: now,
      updated_at: now,
    }
    await collections.assets().insertOne(asset)
    const today = startOfDayInPhnomPenh(now)
    if (arrival.getTime() < today.getTime()) {
      await runBackfillForAsset({
        asset,
        botToken: cfg.botToken,
        chatId: cfg.chatId,
        today,
      })
    }
    return c.json({ asset }, 201)
  })

  app.get("/", async (c) => {
    const status = c.req.query("status")
    const filter = status ? { status: status as Asset["status"] } : {}
    const assets = await collections.assets().find(filter).sort({ arrival_date: -1 }).toArray()
    return c.json({ assets })
  })

  app.get("/:id", async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const asset = await collections.assets().findOne({ _id: new ObjectId(id) })
    if (!asset) return c.json({ error: "not found" }, 404)
    return c.json({ asset })
  })

  app.patch("/:id", async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const body = await c.req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const update: Record<string, unknown> = { updated_at: new Date() }
    if (parsed.data.quantity_current !== undefined) update.quantity_current = parsed.data.quantity_current
    if (parsed.data.notes !== undefined) update.notes = parsed.data.notes
    const result = await collections
      .assets()
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: "after" })
    if (!result) return c.json({ error: "not found" }, 404)
    return c.json({ asset: result })
  })

  app.delete("/:id", requireRole("admin"), async (c) => {
    const id = c.req.param("id")
    if (!ObjectId.isValid(id)) return c.json({ error: "invalid id" }, 400)
    const result = await collections
      .assets()
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: "archived", updated_at: new Date() } },
        { returnDocument: "after" },
      )
    if (!result) return c.json({ error: "not found" }, 404)
    return c.json({ asset: result })
  })

  return app
}
