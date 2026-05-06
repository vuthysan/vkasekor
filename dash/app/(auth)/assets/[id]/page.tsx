"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown,
  Skull, ShoppingCart, Baby, Wallet, Banknote,
} from "lucide-react"
import { LogEventPanel } from "~/components/dashboard/log-event-panel"
import {
  fetchAsset, fetchLedger, ASSET_CONFIG,
  type Asset, type LedgerEntry, type LedgerSummary,
} from "~/lib/api"

function fmt(date: string) {
  return new Date(date).toLocaleDateString("km-KH", { year: "numeric", month: "short", day: "numeric" })
}

function ageInDays(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

const LEDGER_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  expense: { label: "ចំណាយ",      icon: <Wallet   className="h-3.5 w-3.5" />, color: "text-red-600",    bg: "bg-red-50"    },
  revenue: { label: "ចំណូល",      icon: <Banknote className="h-3.5 w-3.5" />, color: "text-green-600", bg: "bg-green-50"  },
  death:   { label: "ស្លាប់",      icon: <Skull    className="h-3.5 w-3.5" />, color: "text-gray-600",  bg: "bg-gray-50"   },
  sold:    { label: "លក់",         icon: <ShoppingCart className="h-3.5 w-3.5" />, color: "text-blue-600", bg: "bg-blue-50" },
  born:    { label: "កើត/ចំណូល",  icon: <Baby     className="h-3.5 w-3.5" />, color: "text-amber-600", bg: "bg-amber-50"  },
}

function SummaryCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  const font = "var(--font-inter), var(--font-kantumruy)"
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-field-stone bg-white px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]" style={{ fontFamily: font }}>{label}</p>
      <p
        className={`tabular-nums text-xl font-bold leading-none ${positive === true ? "text-green-600" : positive === false ? "text-red-500" : "text-[#111]"}`}
        style={{ fontFamily: font }}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-[#aaa]" style={{ fontFamily: font }}>{sub}</p>}
    </div>
  )
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [summary, setSummary] = useState<LedgerSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLogOpen, setIsLogOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const [a, ledger] = await Promise.all([fetchAsset(id), fetchLedger(id)])
      setAsset(a)
      setEntries(ledger.entries)
      setSummary(ledger.summary)
    } catch {
      router.push("/assets")
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  function handleEventLogged(entry: LedgerEntry, childAsset?: Asset) {
    setEntries((prev) => [entry, ...prev])
    // Update quantities from new entry
    if (asset) {
      const updated = { ...asset }
      if (entry.type === "death" || entry.type === "sold") {
        updated.quantity_current = Math.max(0, updated.quantity_current - (entry.quantity ?? 0))
      }
      if (entry.type === "born") {
        updated.quantity_current += entry.quantity ?? 0
      }
      setAsset(updated)
    }
    // Refresh summary from server
    fetchLedger(id).then((l) => setSummary(l.summary)).catch(() => {})
    setIsLogOpen(false)

    // If a child batch was created, notify
    if (childAsset) {
      alert(`✨ ក្រុមថ្មី (${childAsset._id.slice(-6).toUpperCase()}) ត្រូវបានបង្កើតជោគជ័យ!`)
    }
  }

  const font = "var(--font-inter), var(--font-kantumruy)"

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-field-stone" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-field-stone" />)}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-field-stone" />
      </div>
    )
  }

  if (!asset) return null

  const cfg = ASSET_CONFIG[asset.type]
  const age = ageInDays(asset.arrival_date)
  const plPositive = (summary?.profit_loss_usd ?? 0) >= 0

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Back + header */}
        <div className="flex flex-col gap-3">
          <Link
            href="/assets"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#999] hover:text-[#333] transition-colors"
            style={{ fontFamily: font }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            ត្រឡប់ទៅទ្រព្យសកម្ម
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cfg.emoji}</span>
                <h1 className="text-xl font-bold tracking-tight text-[#111]" style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}>
                  {asset.notes || `${cfg.labelKh} · ${asset.breed}`}
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#888]" style={{ fontFamily: font }}>
                {cfg.labelKh} · {asset.breed} · ចំណាស់ {age} ថ្ងៃ · {asset._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => setIsLogOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#0f3d1f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#165a2d] cursor-pointer"
              style={{ fontFamily: font }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">កត់ត្រាព្រឹត្តិការណ៍</span>
              <span className="sm:hidden">កត់ត្រា</span>
            </button>
          </div>
        </div>

        {/* Stock summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          <SummaryCard label="ចំណូលដំបូង" value={`${asset.quantity_initial.toLocaleString()} ${cfg.unitKh}`} />
          <SummaryCard label="ចំនួនសម្រាប់ (ស្លាប់)" value={`${(summary?.total_deaths ?? 0).toLocaleString()}`} sub={cfg.unitKh} />
          <SummaryCard label=" លក់ចេញ" value={`${(summary?.total_sold ?? 0).toLocaleString()}`} sub={cfg.unitKh} />
          <SummaryCard label="កើត" value={`${(summary?.total_born ?? 0).toLocaleString()}`} sub={cfg.unitKh} />
          <SummaryCard label="ចំណូលសម្រាប់" value={`${asset.quantity_current.toLocaleString()} ${cfg.unitKh}`} />
          <SummaryCard
            label="ចំណេញ/ខាត"
            value={`$${(summary?.profit_loss_usd ?? 0) >= 0 ? "+" : ""}${(summary?.profit_loss_usd ?? 0).toFixed(2)}`}
            positive={plPositive}
          />
        </motion.div>

        {/* Financial summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-field-stone bg-white p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#dc2626]" style={{ fontFamily: font }}>
              <TrendingDown className="h-4 w-4" /> ចំណាយសរុប
            </div>
            <p className="mt-2 tabular-nums text-2xl font-bold text-[#111]" style={{ fontFamily: font }}>
              ${(summary?.total_expense_usd ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-field-stone bg-white p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600" style={{ fontFamily: font }}>
              <TrendingUp className="h-4 w-4" /> ចំណូលសរុប
            </div>
            <p className="mt-2 tabular-nums text-2xl font-bold text-[#111]" style={{ fontFamily: font }}>
              ${(summary?.total_revenue_usd ?? 0).toFixed(2)}
            </p>
          </div>
          <div className={`rounded-xl border p-5 ${plPositive ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <div className={`flex items-center gap-2 text-sm font-semibold ${plPositive ? "text-green-600" : "text-red-500"}`} style={{ fontFamily: font }}>
              {plPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              ចំណេញ / ខាត
            </div>
            <p className={`mt-2 tabular-nums text-2xl font-bold ${plPositive ? "text-green-700" : "text-red-600"}`} style={{ fontFamily: font }}>
              ${(summary?.profit_loss_usd ?? 0) >= 0 ? "+" : ""}{(summary?.profit_loss_usd ?? 0).toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Ledger table */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-field-stone bg-white"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
        >
          <div className="flex items-center justify-between border-b border-field-stone px-5 py-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>
              សៀវភៅបញ្ជី
            </h2>
            <button
              onClick={() => setIsLogOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#555] transition-colors hover:bg-field-stone cursor-pointer"
              style={{ fontFamily: font }}
            >
              <Plus className="h-3.5 w-3.5" /> បន្ថែមចំណូល
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-[#aaa]" style={{ fontFamily: font }}>មិនទាន់មានកំណត់ត្រាទេ</p>
              <button
                onClick={() => setIsLogOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#0f3d1f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#165a2d] transition-colors cursor-pointer"
                style={{ fontFamily: font }}
              >
                <Plus className="h-3.5 w-3.5" /> កត់ត្រាព្រឹត្តិការណ៍ដំបូង
              </button>
            </div>
          ) : (
            <div className="divide-y divide-field-stone">
              {entries.map((entry) => {
                const meta = LEDGER_TYPE_META[entry.type] ?? LEDGER_TYPE_META.expense
                return (
                  <div key={entry._id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${meta.color}`} style={{ fontFamily: font }}>{meta.label}</span>
                        {entry.note_kh && <span className="truncate text-xs text-[#777]" style={{ fontFamily: font }}>{entry.note_kh}</span>}
                      </div>
                      <p className="text-[11px] text-[#aaa]" style={{ fontFamily: font }}>{fmt(entry.recorded_at)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {entry.quantity != null && (
                        <p className="tabular-nums text-sm font-semibold text-[#333]" style={{ fontFamily: font }}>
                          {entry.quantity} {cfg.unitKh}
                        </p>
                      )}
                      {entry.amount_usd != null && (
                        <p className={`tabular-nums text-sm font-semibold ${entry.type === "expense" ? "text-red-600" : "text-green-600"}`} style={{ fontFamily: font }}>
                          {entry.type === "expense" ? "-" : "+"}${(entry.amount_usd ?? 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>

      <LogEventPanel
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        assetId={asset._id}
        assetType={asset.type}
        onSuccess={handleEventLogged}
      />
    </>
  )
}
