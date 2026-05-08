import { Hono } from "hono"
import { z } from "zod"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { requireAuth } from "~/middleware/auth"
import { addDays, startOfDayInPhnomPenh } from "~/lib/lifecycle"
import { runBackfillForAsset } from "~/cron/daily-check"
import { ASSET_CONFIG } from "~/lib/asset-config"
import type { Asset, Currency, LedgerEntry } from "~/types"

// Accept either the new {currency, amount} shape or the legacy {amount_usd}.
// One or the other must be present for expense/revenue (not for death/sold/born
// which only use quantity).
const CreateEntrySchema = z.object({
  asset_id: z.string(),
  type: z.enum(["expense", "revenue", "death", "sold", "born"]),
  quantity: z.number().int().positive().optional(),
  // Preferred new shape:
  currency: z.enum(["KHR", "USD"]).optional(),
  amount: z.number().nonnegative().optional(),
  // Legacy shape, kept for clients that haven't migrated:
  amount_usd: z.number().nonnegative().optional(),
  note_kh: z.string().optional(),
  // For "born" type: describes the new child batch
  born_arrival_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  born_breed: z.string().optional(),
})

interface LedgerRouteConfig {
  botToken: string
  chatId: string
  defaultFxRateKhrPerUsd: number
}

interface MoneyPair {
  amount_khr: number
  amount_usd: number
  currency: Currency
  amount: number
  fx_rate_khr_per_usd: number
}

function buildMoneyPair(
  input: { currency?: Currency; amount?: number; amount_usd?: number },
  fxRate: number,
): MoneyPair | null {
  // Prefer the new {currency, amount} shape.
  if (input.currency && input.amount != null) {
    const amount_khr = input.currency === "KHR" ? input.amount : input.amount * fxRate
    const amount_usd = input.currency === "USD" ? input.amount : input.amount / fxRate
    return {
      currency: input.currency,
      amount: input.amount,
      amount_khr,
      amount_usd,
      fx_rate_khr_per_usd: fxRate,
    }
  }
  // Fall back to legacy amount_usd.
  if (input.amount_usd != null) {
    return {
      currency: "USD",
      amount: input.amount_usd,
      amount_khr: input.amount_usd * fxRate,
      amount_usd: input.amount_usd,
      fx_rate_khr_per_usd: fxRate,
    }
  }
  return null
}

function entryAmountPair(entry: LedgerEntry, fxRate: number): { khr: number; usd: number } {
  // Prefer denormalized fields; fall back to legacy amount_usd.
  const khr = entry.amount_khr ?? (entry.amount_usd != null ? entry.amount_usd * fxRate : 0)
  const usd = entry.amount_usd ?? (entry.amount_khr != null ? entry.amount_khr / fxRate : 0)
  return { khr, usd }
}

interface BatchSummary {
  total_expense_khr: number
  total_revenue_khr: number
  profit_loss_khr: number
  total_expense_usd: number
  total_revenue_usd: number
  profit_loss_usd: number
  total_deaths: number
  total_sold: number
  total_born: number
  // Per-batch metrics (only computed for the per-asset summary endpoint)
  quantity_initial?: number
  quantity_current?: number
  survival_rate?: number              // 0..1 — survivors / initial
  cost_per_surviving_khr?: number     // total_expense_khr / quantity_current (or null if 0)
  cost_per_surviving_usd?: number
  revenue_per_sold_khr?: number       // total_revenue_khr / total_sold
  revenue_per_sold_usd?: number
  margin_pct?: number                 // profit_loss / max(total_revenue, total_expense)
}

function summarize(entries: LedgerEntry[], fxRate: number): BatchSummary {
  let total_expense_khr = 0,
    total_revenue_khr = 0,
    total_expense_usd = 0,
    total_revenue_usd = 0
  let total_deaths = 0,
    total_sold = 0,
    total_born = 0

  for (const e of entries) {
    if (e.type === "expense") {
      const { khr, usd } = entryAmountPair(e, fxRate)
      total_expense_khr += khr
      total_expense_usd += usd
    }
    if (e.type === "revenue") {
      const { khr, usd } = entryAmountPair(e, fxRate)
      total_revenue_khr += khr
      total_revenue_usd += usd
    }
    if (e.type === "death") total_deaths += e.quantity ?? 0
    if (e.type === "sold") total_sold += e.quantity ?? 0
    if (e.type === "born") total_born += e.quantity ?? 0
  }

  return {
    total_expense_khr,
    total_revenue_khr,
    profit_loss_khr: total_revenue_khr - total_expense_khr,
    total_expense_usd,
    total_revenue_usd,
    profit_loss_usd: total_revenue_usd - total_expense_usd,
    total_deaths,
    total_sold,
    total_born,
  }
}

function withPerBatchMetrics(summary: BatchSummary, asset: Asset): BatchSummary {
  const initial = asset.quantity_initial
  const current = asset.quantity_current
  const survival_rate = initial > 0 ? Math.min(1, current / initial) : 0
  const cost_per_surviving_khr = current > 0 ? summary.total_expense_khr / current : 0
  const cost_per_surviving_usd = current > 0 ? summary.total_expense_usd / current : 0
  const revenue_per_sold_khr = summary.total_sold > 0 ? summary.total_revenue_khr / summary.total_sold : 0
  const revenue_per_sold_usd = summary.total_sold > 0 ? summary.total_revenue_usd / summary.total_sold : 0
  const denom = Math.max(summary.total_revenue_khr, summary.total_expense_khr)
  const margin_pct = denom > 0 ? summary.profit_loss_khr / denom : 0

  return {
    ...summary,
    quantity_initial: initial,
    quantity_current: current,
    survival_rate,
    cost_per_surviving_khr,
    cost_per_surviving_usd,
    revenue_per_sold_khr,
    revenue_per_sold_usd,
    margin_pct,
  }
}

export function ledgerRoutes(cfg: LedgerRouteConfig) {
  const app = new Hono()
  app.use("*", requireAuth)

  /**
   * POST /api/ledger
   * Log a new ledger event: expense, revenue, death, sold, or born.
   * For "born" events, a new child Asset is automatically created and linked.
   * For expense/revenue, accepts either { currency, amount } or { amount_usd }.
   */
  app.post("/", async (c) => {
    const body = await c.req.json()
    const parsed = CreateEntrySchema.safeParse(body)
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const {
      type, asset_id, quantity, currency, amount, amount_usd, note_kh,
      born_arrival_date, born_breed,
    } = parsed.data

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
    const money = buildMoneyPair({ currency, amount, amount_usd }, cfg.defaultFxRateKhrPerUsd)

    const entry: LedgerEntry = {
      _id: new ObjectId(),
      asset_id: assetObjId,
      type,
      quantity,
      ...(money ? {
        currency: money.currency,
        amount: money.amount,
        amount_khr: money.amount_khr,
        amount_usd: money.amount_usd,
        fx_rate_khr_per_usd: money.fx_rate_khr_per_usd,
      } : {}),
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
   * Fetch all ledger entries for an asset with a per-batch P/L summary
   * (KHR + USD, survival rate, cost-per-head, margin %).
   */
  app.get("/:asset_id", async (c) => {
    const asset_id = c.req.param("asset_id") ?? ""
    if (!ObjectId.isValid(asset_id)) return c.json({ error: "invalid asset_id" }, 400)
    const assetObjId = new ObjectId(asset_id)

    const asset = await collections.assets().findOne({ _id: assetObjId })
    if (!asset) return c.json({ error: "asset not found" }, 404)

    const entries = await collections
      .ledger()
      .find({ asset_id: assetObjId })
      .sort({ recorded_at: -1 })
      .toArray()

    const baseSummary = summarize(entries, cfg.defaultFxRateKhrPerUsd)
    const summary = withPerBatchMetrics(baseSummary, asset)

    return c.json({ entries, summary })
  })

  /**
   * GET /api/ledger/summary/monthly?year=2025&month=5
   * Aggregate P/L (KHR + USD) across ALL assets for a given month.
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

    const summary = summarize(entries, cfg.defaultFxRateKhrPerUsd)
    return c.json({ period: { year, month }, summary })
  })

  /**
   * GET /api/ledger/summary/yearly?year=2025
   * Aggregate P/L (KHR + USD) across ALL assets for a given year, broken down by month.
   */
  app.get("/summary/yearly", async (c) => {
    const year = parseInt(c.req.query("year") ?? `${new Date().getFullYear()}`)
    const start = new Date(year, 0, 1)
    const end = new Date(year + 1, 0, 1)

    const entries = await collections
      .ledger()
      .find({ recorded_at: { $gte: start, $lt: end } })
      .toArray()

    const byMonth: Record<number, LedgerEntry[]> = {}
    for (let m = 1; m <= 12; m++) byMonth[m] = []
    for (const e of entries) byMonth[e.recorded_at.getMonth() + 1].push(e)

    const months = Object.entries(byMonth).map(([month, monthEntries]) => ({
      month: parseInt(month),
      ...summarize(monthEntries, cfg.defaultFxRateKhrPerUsd),
    }))

    const totals = summarize(entries, cfg.defaultFxRateKhrPerUsd)

    return c.json({ year, months, totals })
  })

  return app
}
