const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set")
}

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  const text = await res.text()
  const body = text ? safeJson(text) : null

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : null) ?? `Request failed with status ${res.status}`
    throw new ApiError(res.status, body, message)
  }

  return body as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// ─── Domain Types ──────────────────────────────────────────────────────────

export type AssetType = "chicken" | "pig" | "duck" | "cucumber" | "cabbage" | "tomato" | "lemon" | "cow"
export type AssetStatus = "active" | "harvested" | "archived"
export type LedgerType = "expense" | "revenue" | "death" | "sold" | "born"

export interface Asset {
  _id: string
  type: AssetType
  breed: string
  quantity_initial: number
  quantity_current: number
  arrival_date: string
  expected_harvest_date: string
  status: AssetStatus
  notes: string
  parent_asset_id?: string
  created_at: string
}

export interface LedgerEntry {
  _id: string
  asset_id: string
  type: LedgerType
  quantity?: number
  amount_usd?: number
  note_kh?: string
  child_asset_id?: string
  recorded_at: string
}

export interface LedgerSummary {
  total_expense_usd: number
  total_revenue_usd: number
  total_deaths: number
  total_sold: number
  total_born: number
  profit_loss_usd: number
}

// ─── Asset API ─────────────────────────────────────────────────────────────

export async function fetchAssets(status?: AssetStatus): Promise<Asset[]> {
  const query = status ? `?status=${status}` : ""
  const res = await apiFetch<{ assets: Asset[] }>(`/api/assets${query}`)
  return res.assets
}

export async function fetchAsset(id: string): Promise<Asset> {
  const res = await apiFetch<{ asset: Asset }>(`/api/assets/${id}`)
  return res.asset
}

export interface CreateAssetPayload {
  type: AssetType
  breed: string
  quantity_initial: number
  arrival_date: string
  notes?: string
  parent_asset_id?: string
}

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  const res = await apiFetch<{ asset: Asset }>("/api/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return res.asset
}

// ─── Ledger API ────────────────────────────────────────────────────────────

export async function fetchLedger(assetId: string): Promise<{
  entries: LedgerEntry[]
  summary: LedgerSummary
}> {
  return apiFetch(`/api/ledger/${assetId}`)
}

export interface CreateLedgerEntryPayload {
  asset_id: string
  type: LedgerType
  quantity?: number
  amount_usd?: number
  note_kh?: string
  born_arrival_date?: string
  born_breed?: string
}

export async function addLedgerEntry(payload: CreateLedgerEntryPayload): Promise<{
  entry: LedgerEntry
  child_asset?: Asset
}> {
  return apiFetch("/api/ledger", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export interface MonthlySummary {
  period: { year: number; month: number }
  summary: LedgerSummary
}

export async function fetchMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
  return apiFetch(`/api/ledger/summary/monthly?year=${year}&month=${month}`)
}

export interface YearlySummary {
  year: number
  months: Array<{
    month: number
    expense: number
    revenue: number
    deaths: number
    sold: number
    born: number
    profit_loss_usd: number
  }>
  totals: {
    total_expense_usd: number
    total_revenue_usd: number
    profit_loss_usd: number
  }
}

export async function fetchYearlySummary(year: number): Promise<YearlySummary> {
  return apiFetch(`/api/ledger/summary/yearly?year=${year}`)
}

// ─── Asset Config (mirrors backend) ────────────────────────────────────────

// ─── Rules API ─────────────────────────────────────────────────────────────

export interface Rule {
  _id: string
  asset_type: AssetType
  day_offset: number
  category: string
  severity: string
  title_kh: string
  instructions_kh: string
  source_page?: number
}

export async function fetchRules(assetType?: AssetType): Promise<Rule[]> {
  const query = assetType ? `?asset_type=${assetType}` : ""
  const res = await apiFetch<{ rules: Rule[] }>(`/api/rules${query}`)
  return res.rules
}

// ─── Alerts API ─────────────────────────────────────────────────────────────

export interface Alert {
  _id: string
  asset_id: string
  rule_id: string
  asset_type: AssetType
  day_offset: number
  category: string
  severity: string
  title_kh: string
  instructions_kh: string
  scheduled_for: string
  sent_at?: string
  delivery_status?: string
  // enriched from asset doc
  asset_breed?: string
  asset_notes?: string
}

export async function fetchAlerts(opts?: { assetId?: string; days?: number }): Promise<Alert[]> {
  const params = new URLSearchParams()
  if (opts?.assetId) params.set("asset_id", opts.assetId)
  else if (opts?.days) params.set("days", String(opts.days))
  const query = params.toString() ? `?${params}` : ""
  const res = await apiFetch<{ alerts: Alert[] }>(`/api/alerts${query}`)
  return res.alerts
}

export async function markAlertDone(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/alerts/${id}/done`, {
    method: "PATCH",
  })
}


// ─── Asset Config (mirrors backend) ────────────────────────────────────────

export const ASSET_CONFIG: Record<AssetType, { emoji: string; labelKh: string; unitKh: string; defaultHarvestDays: number }> = {
  chicken:  { emoji: "🐔", labelKh: "មាន់",       unitKh: "ក្បាល", defaultHarvestDays: 60  },
  pig:      { emoji: "🐖", labelKh: "ជ្រូក",      unitKh: "ក្បាល", defaultHarvestDays: 180 },
  duck:     { emoji: "🦆", labelKh: "ទា",          unitKh: "ក្បាល", defaultHarvestDays: 75  },
  cucumber: { emoji: "🥒", labelKh: "ត្រសក់",     unitKh: "រង",    defaultHarvestDays: 45  },
  cabbage:  { emoji: "🥬", labelKh: "ស្ពៃក្តោប", unitKh: "ដើម",   defaultHarvestDays: 70  },
  tomato:   { emoji: "🍅", labelKh: "ប៉េងប៉ោះ",  unitKh: "ដើម",   defaultHarvestDays: 80  },
  lemon:    { emoji: "🍋", labelKh: "ក្រូចឆ្មារ", unitKh: "ដើម",   defaultHarvestDays: 360 },
  cow:      { emoji: "🐄", labelKh: "គោ",          unitKh: "ក្បាល", defaultHarvestDays: 540 },
}
