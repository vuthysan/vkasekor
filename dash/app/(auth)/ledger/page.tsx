"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { fetchYearlySummary, type YearlySummary } from "~/lib/api"

const MONTH_NAMES_KH = [
  "មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា",
  "កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ",
]

function Bar({ value, max, positive }: { value: number; max: number; positive: boolean }) {
  const pct = max > 0 ? Math.abs(value) / max : 0
  return (
    <div className="relative flex h-28 flex-col justify-end overflow-hidden rounded-md bg-[#f5f4f1]">
      <motion.div
        className={`w-full rounded-md ${positive ? "bg-green-500" : "bg-red-400"}`}
        initial={{ height: 0 }}
        animate={{ height: `${pct * 100}%` }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0, 0, 0.2, 1] }}
      />
    </div>
  )
}

export default function LedgerPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<YearlySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const font = "var(--font-inter), var(--font-kantumruy)"

  useEffect(() => {
    setIsLoading(true)
    fetchYearlySummary(year)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [year])

  const maxAbs = data
    ? Math.max(...data.months.map((m) => Math.abs(m.profit_loss_usd)), 1)
    : 1

  const totals = data?.totals

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111]" style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}>
            ហិរញ្ញវត្ថុ
          </h1>
          <p className="mt-0.5 text-sm text-[#888]" style={{ fontFamily: font }}>
            ការសង្ខេបប្រចាំឆ្នាំ · ចំណូល ចំណាយ ចំណេញ/ខាត
          </p>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-1 rounded-xl border border-field-stone bg-white px-3 py-2" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <button
            onClick={() => setYear((y) => y - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#666] transition-colors hover:bg-field-stone"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 tabular-nums text-sm font-semibold text-[#111]" style={{ fontFamily: font }}>{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#666] transition-colors hover:bg-field-stone"
            disabled={year >= new Date().getFullYear()}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <motion.div
        key={year}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-field-stone bg-white p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#dc2626]" style={{ fontFamily: font }}>
            <TrendingDown className="h-4 w-4" /> ចំណាយសរុប
          </div>
          <p className="mt-2 tabular-nums text-2xl font-bold text-[#111]" style={{ fontFamily: font }}>
            {isLoading ? "—" : `$${totals?.total_expense_usd.toFixed(2) ?? "0.00"}`}
          </p>
        </div>
        <div className="rounded-xl border border-field-stone bg-white p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600" style={{ fontFamily: font }}>
            <TrendingUp className="h-4 w-4" /> ចំណូលសរុប
          </div>
          <p className="mt-2 tabular-nums text-2xl font-bold text-[#111]" style={{ fontFamily: font }}>
            {isLoading ? "—" : `$${totals?.total_revenue_usd.toFixed(2) ?? "0.00"}`}
          </p>
        </div>
        <div className={`rounded-xl border p-5 ${(totals?.profit_loss_usd ?? 0) >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <div className={`flex items-center gap-2 text-sm font-semibold ${(totals?.profit_loss_usd ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`} style={{ fontFamily: font }}>
            <DollarSign className="h-4 w-4" /> ចំណេញ / ខាត
          </div>
          <p className={`mt-2 tabular-nums text-2xl font-bold ${(totals?.profit_loss_usd ?? 0) >= 0 ? "text-green-700" : "text-red-600"}`} style={{ fontFamily: font }}>
            {isLoading ? "—" : `${(totals?.profit_loss_usd ?? 0) >= 0 ? "+" : ""}$${totals?.profit_loss_usd.toFixed(2) ?? "0.00"}`}
          </p>
        </div>
      </motion.div>

      {/* Monthly bar chart */}
      <motion.div
        key={`chart-${year}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="rounded-xl border border-field-stone bg-white p-6"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
      >
        <h2 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>
          ចំណេញ/ខាតប្រចាំខែ · {year}
        </h2>

        {isLoading ? (
          <div className="flex gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1">
                <div className="h-28 animate-pulse rounded-md bg-field-stone" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2">
            {data?.months.map((m) => {
              const pl = m.profit_loss_usd
              const positive = pl >= 0
              return (
                <div key={m.month} className="flex flex-1 flex-col gap-1.5">
                  <Bar value={pl} max={maxAbs} positive={positive} />
                  <div className="text-center">
                    <p className="text-[10px] text-[#999]" style={{ fontFamily: font }}>{MONTH_NAMES_KH[m.month - 1]}</p>
                    <p className={`tabular-nums text-[10px] font-semibold ${positive ? "text-green-600" : "text-red-500"}`} style={{ fontFamily: font }}>
                      {pl === 0 ? "—" : `${positive ? "+" : ""}$${pl.toFixed(0)}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Monthly breakdown table */}
      <motion.div
        key={`table-${year}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="rounded-xl border border-field-stone bg-white"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
      >
        <div className="border-b border-field-stone px-5 py-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>
            ការបែងចែកតាមខែ
          </h2>
        </div>
        <div className="divide-y divide-field-stone">
          {isLoading
            ? [...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse bg-field-stone/50 mx-5 my-2 rounded" />)
            : data?.months.filter((m) => m.expense > 0 || m.revenue > 0).map((m) => (
              <div key={m.month} className="flex items-center gap-4 px-5 py-3">
                <div className="w-20 shrink-0">
                  <p className="text-sm font-medium text-[#333]" style={{ fontFamily: font }}>{MONTH_NAMES_KH[m.month - 1]}</p>
                </div>
                <div className="flex flex-1 items-center gap-4 text-xs" style={{ fontFamily: font }}>
                  <span className="text-red-500">↓ ${m.expense.toFixed(2)}</span>
                  <span className="text-green-600">↑ ${m.revenue.toFixed(2)}</span>
                  {m.deaths > 0 && <span className="text-gray-500">💀 {m.deaths}</span>}
                  {m.sold > 0 && <span className="text-blue-500">🛒 {m.sold}</span>}
                </div>
                <span
                  className={`tabular-nums text-sm font-semibold ${m.profit_loss_usd >= 0 ? "text-green-600" : "text-red-500"}`}
                  style={{ fontFamily: font }}
                >
                  {m.profit_loss_usd >= 0 ? "+" : ""}${m.profit_loss_usd.toFixed(2)}
                </span>
              </div>
            ))
          }
          {!isLoading && data?.months.every((m) => m.expense === 0 && m.revenue === 0) && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-[#aaa]" style={{ fontFamily: font }}>មិនមានទិន្នន័យសម្រាប់ឆ្នាំ {year} ទេ</p>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  )
}
