import { Hono } from "hono"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth } from "~/middleware/auth"
import { addDays, startOfDayInPhnomPenh } from "~/lib/lifecycle"
import { runBackfillForAsset } from "~/cron/daily-check"
import { ASSET_CONFIG } from "~/lib/asset-config"
import type { Asset, LedgerEntry } from "~/types"

const CreateEntrySchema = z.object({
  asset_id: z.string(),
  type: z.enum(["expense", "revenue", "death", "sold", "born"]),
  quantity: z.number().int().positive().optional(),
  amount_usd: z.number().nonnegative().optional(),
  note_kh: z.string().optional(),
  // For "born" type: describes the new child batch
  born_arrival_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  born_breed: z.string().optional(),
})

interface LedgerRouteConfig {
  botToken: string
  chatId: string
}

export function ledgerRoutes(cfg: LedgerRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth)

  /**
   * POST /api/ledger
   * Log a new ledger event: expense, revenue, death, sold, or born.
   * For "born" events, a new child Asset is automatically created and linked.
   */
  app.post("/", async (c) => {
    const body = await c.req.json()
    const parsed = CreateEntrySchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const { type, asset_id, quantity, amount_usd, note_kh, born_arrival_date, born_breed } = parsed.data

    if (!ObjectId.isValid(asset_id)) return c.json({ error: "invalid asset_id" }, 400)
    const assetObjId = new ObjectId(asset_id)

    const parentAsset = await collections.assets().findOne({ _id: assetObjId })
    if (!parentAsset) return c.json({ error: "asset not found" }, 404)

    const session = c.get("session")
    const userId = new ObjectId(session.user_id)
    const now = new Date()

    let childAsset: Asset | null = null

    // --- If this is a BIRTH event, create the new child batch ---
    if (type === "born") {
      if (!quantity || quantity <= 0) return c.json({ error: "quantity is required for born events" }, 400)
      const arrival = born_arrival_date
        ? startOfDayInPhnomPenh(new Date(`${born_arrival_date}T00:00:00Z`))
        : startOfDayInPhnomPenh(now)
      const harvestDays = ASSET_CONFIG[parentAsset.type]?.defaultHarvestDays ?? 60
      childAsset = {
        _id: new ObjectId(),
        type: parentAsset.type,
        breed: born_breed ?? parentAsset.breed,
        quantity_initial: quantity,
        quantity_current: quantity,
        arrival_date: arrival,
        expected_harvest_date: addDays(arrival, harvestDays),
        status: "active",
        notes: note_kh ?? `កូនពី batch ${asset_id.slice(-6).toUpperCase()}`,
        parent_asset_id: assetObjId,
        created_by: userId,
        created_at: now,
        updated_at: now,
      }
      await collections.assets().insertOne(childAsset)

      // Auto-trigger rule schedule for the new child batch
      const today = startOfDayInPhnomPenh(now)
      if (arrival.getTime() < today.getTime()) {
        await runBackfillForAsset({
          asset: childAsset,
          botToken: cfg.botToken,
          chatId: cfg.chatId,
          today,
        })
      }
    }

    // --- Create the ledger entry ---
    const entry: LedgerEntry = {
      _id: new ObjectId(),
      asset_id: assetObjId,
      type,
      quantity,
      amount_usd,
      note_kh,
      child_asset_id: childAsset ? childAsset._id : undefined,
      recorded_at: now,
      created_by: userId,
    }
    await collections.ledger().insertOne(entry)

    // --- Update parent asset's current quantity for death/sold ---
    if ((type === "death" || type === "sold") && quantity) {
      await collections.assets().updateOne(
        { _id: assetObjId },
        {
          $inc: { quantity_current: -quantity },
          $set: { updated_at: now },
        },
      )
    }

    return c.json({ entry, child_asset: childAsset }, 201)
  })

  /**
   * GET /api/ledger/:asset_id
   * Fetch all ledger entries for an asset with a financial summary.
   */
  app.get("/:asset_id", async (c) => {
    const asset_id = c.req.param("asset_id") ?? ""
    if (!ObjectId.isValid(asset_id)) return c.json({ error: "invalid asset_id" }, 400)

    const entries = await collections
      .ledger()
      .find({ asset_id: new ObjectId(asset_id) })
      .sort({ recorded_at: -1 })
      .toArray()

    // Build a summary
    const summary = entries.reduce(
      (acc, e) => {
        if (e.type === "expense") acc.total_expense_usd += e.amount_usd ?? 0
        if (e.type === "revenue") acc.total_revenue_usd += e.amount_usd ?? 0
        if (e.type === "death") acc.total_deaths += e.quantity ?? 0
        if (e.type === "sold") acc.total_sold += e.quantity ?? 0
        if (e.type === "born") acc.total_born += e.quantity ?? 0
        return acc
      },
      {
        total_expense_usd: 0,
        total_revenue_usd: 0,
        total_deaths: 0,
        total_sold: 0,
        total_born: 0,
      },
    )

    const profit_loss_usd = summary.total_revenue_usd - summary.total_expense_usd

    return c.json({ entries, summary: { ...summary, profit_loss_usd } })
  })

  /**
   * GET /api/ledger/summary/monthly?year=2025&month=5
   * Aggregate profit/loss across ALL assets for a given month.
   */
  app.get("/summary/monthly", async (c) => {
    const year = parseInt(c.req.query("year") ?? `${new Date().getFullYear()}`)
    const month = parseInt(c.req.query("month") ?? `${new Date().getMonth() + 1}`)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 1)

    const entries = await collections
      .ledger()
      .find({ recorded_at: { $gte: start, $lt: end } })
      .toArray()

    const summary = entries.reduce(
      (acc, e) => {
        if (e.type === "expense") acc.total_expense_usd += e.amount_usd ?? 0
        if (e.type === "revenue") acc.total_revenue_usd += e.amount_usd ?? 0
        if (e.type === "death") acc.total_deaths += e.quantity ?? 0
        if (e.type === "sold") acc.total_sold += e.quantity ?? 0
        if (e.type === "born") acc.total_born += e.quantity ?? 0
        return acc
      },
      {
        total_expense_usd: 0,
        total_revenue_usd: 0,
        total_deaths: 0,
        total_sold: 0,
        total_born: 0,
      },
    )

    return c.json({
      period: { year, month },
      summary: {
        ...summary,
        profit_loss_usd: summary.total_revenue_usd - summary.total_expense_usd,
      },
    })
  })

  /**
   * GET /api/ledger/summary/yearly?year=2025
   * Aggregate profit/loss across ALL assets for a given year, broken down by month.
   */
  app.get("/summary/yearly", async (c) => {
    const year = parseInt(c.req.query("year") ?? `${new Date().getFullYear()}`)
    const start = new Date(year, 0, 1)
    const end = new Date(year + 1, 0, 1)

    const entries = await collections
      .ledger()
      .find({ recorded_at: { $gte: start, $lt: end } })
      .toArray()

    // Group by month
    const byMonth: Record<number, { expense: number; revenue: number; deaths: number; sold: number; born: number }> = {}
    for (let m = 1; m <= 12; m++) {
      byMonth[m] = { expense: 0, revenue: 0, deaths: 0, sold: 0, born: 0 }
    }

    for (const e of entries) {
      const m = e.recorded_at.getMonth() + 1
      if (e.type === "expense") byMonth[m].expense += e.amount_usd ?? 0
      if (e.type === "revenue") byMonth[m].revenue += e.amount_usd ?? 0
      if (e.type === "death") byMonth[m].deaths += e.quantity ?? 0
      if (e.type === "sold") byMonth[m].sold += e.quantity ?? 0
      if (e.type === "born") byMonth[m].born += e.quantity ?? 0
    }

    const months = Object.entries(byMonth).map(([month, data]) => ({
      month: parseInt(month),
      ...data,
      profit_loss_usd: data.revenue - data.expense,
    }))

    const totals = months.reduce(
      (acc, m) => {
        acc.total_expense_usd += m.expense
        acc.total_revenue_usd += m.revenue
        return acc
      },
      { total_expense_usd: 0, total_revenue_usd: 0 },
    )

    return c.json({
      year,
      months,
      totals: {
        ...totals,
        profit_loss_usd: totals.total_revenue_usd - totals.total_expense_usd,
      },
    })
  })

  return app
}
