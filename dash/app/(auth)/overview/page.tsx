"use client"

import { useState, useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "motion/react"
import {
  Layers, Activity, AlertCircle, Leaf, Plus,
  TrendingUp, TrendingDown, ArrowRight, CalendarRange,
  Tractor, DollarSign,
} from "lucide-react"
import { DataTable } from "~/components/dashboard/data-table"
import { DataTableSkeleton, StatRowSkeleton } from "~/components/dashboard/skeletons"
import { RegisterPanel, type AssetBatch } from "~/components/dashboard/register-panel"
import { StatusBadge } from "~/components/ui/status-badge"
import {
  fetchAssets, fetchMonthlySummary,
  ASSET_CONFIG,
  type Asset,
} from "~/lib/api"

function ageInDays(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

function assetToRow(a: Asset): AssetBatch {
  let status: AssetBatch["status"] = "Healthy"
  if (a.status === "harvested") status = "Harvesting"
  if (a.status === "archived")  status = "At Risk"
  return {
    id: a._id,
    batchName: a.notes || `${ASSET_CONFIG[a.type].labelKh} · ${a.breed}`,
    assetType: a.type,
    quantity: a.quantity_current,
    status,
    registeredAt: a.arrival_date.split("T")[0],
    _raw: a,
  }
}

function KpiCard({
  label, value, icon, iconBg, iconColor, trend, trendLabel, isPositive,
}: {
  label: string; value: string | number; icon: ReactNode
  iconBg: string; iconColor: string; trend?: number; trendLabel?: string; isPositive?: boolean
}) {
  const font = "var(--font-inter), var(--font-kantumruy)"
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-field-stone bg-white px-5 py-4" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend !== undefined && isPositive !== undefined && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`} style={{ fontFamily: font }}>
            {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {trend}%
          </span>
        )}
      </div>
      <div>
        <p className="tabular-nums text-[1.625rem] font-bold leading-none tracking-tight text-[#111]" style={{ fontFamily: font }}>{value}</p>
        <p className="mt-1.5 text-[11px] leading-snug text-[#666]" style={{ fontFamily: font }}>{label}</p>
        {trendLabel && <p className="mt-0.5 text-[10px] text-[#aaa]" style={{ fontFamily: font }}>{trendLabel}</p>}
      </div>
    </div>
  )
}

const columns: ColumnDef<AssetBatch>[] = [
  {
    accessorKey: "batchName",
    header: "ហ្វូង/ដំណាំ",
    cell: ({ row }) => (
      <Link href={`/assets/${row.original.id}`} className="font-semibold text-[13px] text-[#111] hover:text-[#16a34a] hover:underline">
        {row.getValue("batchName")}
      </Link>
    ),
  },
  {
    accessorKey: "assetType",
    header: "ប្រភេទ",
    cell: ({ row }) => {
      const type = row.getValue("assetType") as string
      const cfg = ASSET_CONFIG[type as keyof typeof ASSET_CONFIG]
      return cfg ? (
        <span className="text-xs font-medium text-[#555]">{cfg.emoji} {cfg.labelKh}</span>
      ) : <span className="text-xs text-[#666]">{type}</span>
    },
  },
  {
    accessorKey: "quantity",
    header: "ចំនួន",
    cell: ({ row }) => {
      const type = row.original.assetType
      const cfg = ASSET_CONFIG[type as keyof typeof ASSET_CONFIG]
      return <span className="tabular-nums text-sm font-semibold text-[#111]">{(row.getValue("quantity") as number).toLocaleString()} {cfg?.unitKh}</span>
    },
  },
  {
    accessorKey: "registeredAt",
    header: "ថ្ងៃចូល",
    cell: ({ row }) => {
      const date = row.getValue("registeredAt") as string
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-[#444]">{date}</span>
          <span className="text-[11px] text-[#aaa]">ថ្ងៃទី {ageInDays(date)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "ស្ថានភាព",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [batches, setBatches] = useState<AssetBatch[]>([])
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [plThisMonth, setPlThisMonth] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetchAssets(),
      fetchMonthlySummary(new Date().getFullYear(), new Date().getMonth() + 1),
    ])
      .then(([assets, monthly]) => {
        setBatches(assets.map(assetToRow))
        setPlThisMonth(monthly.summary.profit_loss_usd)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total:   batches.reduce((s, b) => s + b.quantity, 0),
    active:  batches.filter((b) => b._raw?.status === "active").length,
    atRisk:  batches.filter((b) => b._raw?.status === "archived").length,
    batches: batches.length,
  }), [batches])

  function handleBatchRegistered(batch: AssetBatch) {
    setBatches((prev) => [batch, ...prev])
    setIsRegisterOpen(false)
    // navigate to detail page of newly registered asset
    if (batch.id) router.push(`/assets/${batch.id}`)
  }

  const font = "var(--font-inter), var(--font-kantumruy)"
  const plPositive = (plThisMonth ?? 0) >= 0

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#111]" style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}>
              ទិដ្ឋភាពទូទៅនៃកសិដ្ឋាន
            </h1>
            <p className="mt-0.5 text-sm text-[#888]" style={{ fontFamily: font }}>
              {isLoading ? " " : `${batches.length} ហ្វូង/ដំណាំ · ${stats.atRisk > 0 ? `${stats.atRisk} ការព្រមាន` : "គ្មានការព្រមាន"}`}
            </p>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-canopy-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shadow-canopy cursor-pointer"
            style={{ fontFamily: font }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">ចុះឈ្មោះហ្វូង/ដំណាំ</span>
            <span className="sm:hidden">ចុះឈ្មោះ</span>
          </button>
        </div>

        {/* KPI cards */}
        {isLoading ? (
          <StatRowSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <KpiCard
              label="ចំនួនសត្វ/ដំណាំសរុប"
              value={stats.total.toLocaleString()}
              icon={<Layers className="h-4 w-4" />}
              iconBg="bg-canopy-deep/10"
              iconColor="text-canopy-deep"
            />
            <KpiCard
              label="ហ្វូង/ដំណាំសកម្ម"
              value={stats.active}
              icon={<Activity className="h-4 w-4" />}
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            <KpiCard
              label="ការព្រមានដែលរង់ចាំ"
              value={stats.atRisk}
              icon={<AlertCircle className="h-4 w-4" />}
              iconBg="bg-red-50"
              iconColor="text-red-500"
            />
            <KpiCard
              label="ចំណេញ/ខាតខែនេះ"
              value={plThisMonth !== null ? `$${plThisMonth >= 0 ? "+" : ""}${plThisMonth.toFixed(2)}` : "—"}
              icon={<DollarSign className="h-4 w-4" />}
              iconBg={plPositive ? "bg-green-50" : "bg-red-50"}
              iconColor={plPositive ? "text-green-600" : "text-red-500"}
              isPositive={plPositive}
              trendLabel="ចំណូល - ចំណាយ"
            />
          </motion.div>
        )}

        {/* At-risk alert strip */}
        {!isLoading && stats.atRisk > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#dc2626]" strokeWidth={2} />
              <p className="text-sm font-medium text-[#dc2626]" style={{ fontFamily: font }}>
                {stats.atRisk} ហ្វូង/ដំណាំ ត្រូវការការយកចិត្តទុកដាក់
              </p>
            </div>
            <Link href="/assets" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#dc2626] hover:underline cursor-pointer" style={{ fontFamily: font }}>
              ពិនិត្យ​មើល <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Batch table (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>
                ហ្វូង/ដំណាំថ្មីៗ
              </h2>
              {!isLoading && (
                <Link href="/assets" className="flex items-center gap-1 text-xs font-medium text-[#999] transition-colors hover:text-canopy-deep cursor-pointer" style={{ fontFamily: font }}>
                  មើលទាំងអស់ <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
            {isLoading ? (
              <DataTableSkeleton />
            ) : batches.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 rounded-xl border border-field-stone bg-white py-16 text-center">
                <p className="text-sm font-medium text-[#666]" style={{ fontFamily: font }}>មិនមានហ្វូង/ដំណាំត្រូវបានចុះឈ្មោះទេ។</p>
                <button onClick={() => setIsRegisterOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-canopy-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-shadow-canopy cursor-pointer" style={{ fontFamily: font }}>
                  <Plus className="h-3.5 w-3.5" /> ចុះឈ្មោះហ្វូង/ដំណាំ
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                <DataTable columns={columns} data={batches.slice(0, 10)} />
              </motion.div>
            )}
          </div>

          {/* Right sidebar (1/3) */}
          <div className="flex flex-col gap-4">
            {!isLoading && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="flex flex-col gap-4">

                {/* Type breakdown */}
                <div className="rounded-xl border border-field-stone bg-white p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>ការបែងចែកប្រភេទ</h2>
                  <div className="flex flex-col gap-3">
                    {Object.entries(ASSET_CONFIG).map(([type, cfg]) => {
                      const group = batches.filter((b) => b.assetType === type)
                      if (group.length === 0) return null
                      const qty = group.reduce((s, b) => s + b.quantity, 0)
                      const total = batches.reduce((s, b) => s + b.quantity, 0)
                      const pct = total > 0 ? Math.round((qty / total) * 100) : 0
                      return (
                        <div key={type} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#555]" style={{ fontFamily: font }}>{cfg.emoji} {cfg.labelKh}</span>
                            <span className="shrink-0 tabular-nums text-xs text-[#666]" style={{ fontFamily: font }}>{group.length} ហ្វូង · {qty.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-field-stone">
                            <motion.div className="h-full rounded-full bg-[#16a34a]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }} />
                          </div>
                        </div>
                      )
                    })}
                    {batches.length === 0 && <p className="text-xs text-[#aaa]" style={{ fontFamily: font }}>មិនទាន់មានទ្រព្យសកម្មទេ</p>}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-xl border border-field-stone bg-white p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>សកម្មភាព​រហ័ស</h2>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => setIsRegisterOpen(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-rice-parchment cursor-pointer" style={{ fontFamily: font }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canopy-deep/10"><Plus className="h-3.5 w-3.5 text-canopy-deep" /></span>
                      ចុះឈ្មោះហ្វូង/ដំណាំ
                    </button>
                    <Link href="/assets" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-rice-parchment cursor-pointer" style={{ fontFamily: font }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-field-stone"><Tractor className="h-3.5 w-3.5 text-[#666]" /></span>
                      ទ្រព្យសកម្មទាំងអស់
                    </Link>
                    <Link href="/schedules" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-rice-parchment cursor-pointer" style={{ fontFamily: font }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-field-stone"><CalendarRange className="h-3.5 w-3.5 text-[#666]" /></span>
                      កាលវិភាគ
                    </Link>
                    <Link href="/ledger" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-rice-parchment cursor-pointer" style={{ fontFamily: font }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-field-stone"><DollarSign className="h-3.5 w-3.5 text-[#666]" /></span>
                      ហិរញ្ញវត្ថុ
                    </Link>
                  </div>
                </div>

              </motion.div>
            )}
            {isLoading && (
              <>
                <div className="h-48 animate-pulse rounded-xl border border-field-stone bg-white" />
                <div className="h-36 animate-pulse rounded-xl border border-field-stone bg-white" />
              </>
            )}
          </div>

        </div>
      </div>

      <RegisterPanel
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleBatchRegistered}
      />
    </>
  )
}
