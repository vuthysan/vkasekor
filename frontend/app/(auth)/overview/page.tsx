"use client"

import { useState, useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "motion/react"
import {
  Layers, Activity, AlertCircle, Leaf, Plus,
  Bird, PawPrint, TrendingUp, TrendingDown,
  ArrowRight, CalendarRange, Tractor,
} from "lucide-react"
import { DataTable } from "~/components/dashboard/data-table"
import { DataTableSkeleton, StatRowSkeleton } from "~/components/dashboard/skeletons"
import { RegisterPanel, type AssetBatch } from "~/components/dashboard/register-panel"
import { StatusBadge } from "~/components/ui/status-badge"

const initialBatches: AssetBatch[] = [
  { id: "B-1001", batchName: "Broiler Flock A",   assetType: "Chicken",  quantity: 500,  status: "Healthy",    registeredAt: "2026-05-01" },
  { id: "B-1002", batchName: "Piglets Barn 2",    assetType: "Pig",      quantity: 20,   status: "At Risk",    registeredAt: "2026-04-28" },
  { id: "B-1003", batchName: "Bok Choy Sector C", assetType: "Cucumber", quantity: 1000, status: "Harvesting", registeredAt: "2026-03-15" },
  { id: "B-1004", batchName: "Layer Flock B",     assetType: "Chicken",  quantity: 300,  status: "Healthy",    registeredAt: "2026-05-03" },
]

function ageInDays(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

interface AssetTypeMeta { icon: ReactNode; label: string; bar: string; color: string }
const ASSET_TYPE_META: Record<string, AssetTypeMeta> = {
  Chicken:  { icon: <Bird     className="h-3.5 w-3.5" />, label: "មាន់",   bar: "bg-amber-400",   color: "text-amber-700"   },
  Pig:      { icon: <PawPrint className="h-3.5 w-3.5" />, label: "ជ្រូក",  bar: "bg-pink-400",    color: "text-pink-700"    },
  Cucumber: { icon: <Leaf     className="h-3.5 w-3.5" />, label: "ត្រសក់", bar: "bg-emerald-400", color: "text-emerald-700" },
}

const columns: ColumnDef<AssetBatch>[] = [
  {
    accessorKey: "batchName",
    header: "ហ្វូង/ដំណាំ",
    cell: ({ row }) => (
      <span className="font-semibold text-[13px] text-[#111]">{row.getValue("batchName")}</span>
    ),
  },
  {
    accessorKey: "assetType",
    header: "ប្រភេទ",
    cell: ({ row }) => {
      const type = row.getValue("assetType") as string
      const meta = ASSET_TYPE_META[type]
      return meta ? (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.color}`}>
          {meta.icon}
          {meta.label}
        </span>
      ) : (
        <span className="text-xs text-[#666]">{type}</span>
      )
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

// ─── Sub-components ────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon, iconBg, iconColor, trend, trendLabel, isPositive,
}: {
  label: string
  value: string | number
  icon: ReactNode
  iconBg: string
  iconColor: string
  trend?: number
  trendLabel?: string
  isPositive?: boolean
}) {
  const font = "var(--font-inter), var(--font-kantumruy)"
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-field-stone bg-white px-5 py-4"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {trend !== undefined && isPositive !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            }`}
            style={{ fontFamily: font }}
          >
            {isPositive
              ? <TrendingUp className="h-2.5 w-2.5" />
              : <TrendingDown className="h-2.5 w-2.5" />}
            {trend}%
          </span>
        )}
      </div>
      <div>
        <p
          className="tabular-nums text-[1.625rem] font-bold leading-none tracking-tight text-[#111]"
          style={{ fontFamily: font }}
        >
          {value}
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-[#666]" style={{ fontFamily: font }}>
          {label}
        </p>
        {trendLabel && (
          <p className="mt-0.5 text-[10px] text-[#aaa]" style={{ fontFamily: font }}>
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  )
}

function TypeBreakdownItem({
  type, count, quantity, totalQty,
}: {
  type: string; count: number; quantity: number; totalQty: number
}) {
  const meta = ASSET_TYPE_META[type]
  const pct = totalQty > 0 ? Math.round((quantity / totalQty) * 100) : 0
  const font = "var(--font-inter), var(--font-kantumruy)"
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta?.color}`} style={{ fontFamily: font }}>
          {meta?.icon}
          {meta?.label}
        </span>
        <span className="shrink-0 tabular-nums text-xs text-[#666]" style={{ fontFamily: font }}>
          {count} ហ្វូង · {quantity.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-field-stone">
        <motion.div
          className={`h-full rounded-full ${meta?.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [isLoading, setIsLoading]           = useState(true)
  const [batches, setBatches]               = useState<AssetBatch[]>(initialBatches)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const stats = useMemo(() => ({
    total:   batches.reduce((s, b) => s + b.quantity, 0),
    healthy: batches.filter((b) => b.status === "Healthy").reduce((s, b) => s + b.quantity, 0),
    atRisk:  batches.filter((b) => b.status === "At Risk").length,
    active:  batches.filter((b) => b.status !== "Harvesting").length,
  }), [batches])

  const typeBreakdown = useMemo(() => {
    const totalQty = batches.reduce((s, b) => s + b.quantity, 0)
    return Object.keys(ASSET_TYPE_META).map((type) => {
      const group = batches.filter((b) => b.assetType === type)
      return { type, count: group.length, quantity: group.reduce((s, b) => s + b.quantity, 0), totalQty }
    })
  }, [batches])

  function handleBatchRegistered(batch: AssetBatch) {
    setBatches((prev) => [batch, ...prev])
    setIsRegisterOpen(false)
  }

  const font = "var(--font-inter), var(--font-kantumruy)"

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-xl font-bold tracking-tight text-[#111]"
              style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}
            >
              ទិដ្ឋភាពទូទៅនៃកសិដ្ឋាន
            </h1>
            <p className="mt-0.5 text-sm text-[#888]" style={{ fontFamily: font }}>
              {isLoading
                ? " "
                : `${batches.length} ហ្វូង/ដំណាំ · ${stats.atRisk > 0 ? `${stats.atRisk} ការព្រមាន` : "គ្មានការព្រមាន"}`}
            </p>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-canopy-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shadow-canopy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-green cursor-pointer"
            style={{ fontFamily: font }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">ចុះឈ្មោះហ្វូង/ដំណាំ</span>
            <span className="sm:hidden">ចុះឈ្មោះ</span>
          </button>
        </div>

        {/* ── KPI cards ── */}
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
              label="ទ្រព្យសកម្មសរុប"
              value={stats.total.toLocaleString()}
              icon={<Layers className="h-4 w-4" />}
              iconBg="bg-canopy-deep/10"
              iconColor="text-canopy-deep"
              trend={12}
              trendLabel="ពីខែមុន"
              isPositive={true}
            />
            <KpiCard
              label="ហ្វូងមានសុខភាពល្អ"
              value={stats.healthy.toLocaleString()}
              icon={<Activity className="h-4 w-4" />}
              iconBg="bg-green-50"
              iconColor="text-green-600"
              trend={2.5}
              trendLabel="ពីសប្តាហ៍មុន"
              isPositive={true}
            />
            <KpiCard
              label="ការព្រមានដែលរង់ចាំ"
              value={String(stats.atRisk)}
              icon={<AlertCircle className="h-4 w-4" />}
              iconBg="bg-red-50"
              iconColor="text-red-500"
              trend={1}
              trendLabel="ទាមទារសកម្មភាព"
              isPositive={false}
            />
            <KpiCard
              label="ហ្វូង/ដំណាំសកម្ម"
              value={String(stats.active)}
              icon={<Leaf className="h-4 w-4" />}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              trend={8}
              trendLabel="ធៀបនឹងខែមុន"
              isPositive={true}
            />
          </motion.div>
        )}

        {/* ── At-risk alert strip ── */}
        {!isLoading && stats.atRisk > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#dc2626]" strokeWidth={2} />
              <p className="text-sm font-medium text-[#dc2626]" style={{ fontFamily: font }}>
                {stats.atRisk} ហ្វូង/ដំណាំ ត្រូវការការយកចិត្តទុកដាក់
              </p>
            </div>
            <Link
              href="/assets"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#dc2626] hover:underline cursor-pointer"
              style={{ fontFamily: font }}
            >
              ពិនិត្យ​មើល
              <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}

        {/* ── Main content: table + sidebar ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Recent batches table (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]"
                style={{ fontFamily: font }}
              >
                ហ្វូង/ដំណាំថ្មីៗ
              </h2>
              {!isLoading && (
                <Link
                  href="/assets"
                  className="flex items-center gap-1 text-xs font-medium text-[#999] transition-colors hover:text-canopy-deep cursor-pointer"
                  style={{ fontFamily: font }}
                >
                  មើលទាំងអស់
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
            {isLoading ? (
              <DataTableSkeleton />
            ) : batches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-4 rounded-xl border border-field-stone bg-white py-16 text-center"
              >
                <p className="text-sm font-medium text-[#666]" style={{ fontFamily: font }}>
                  មិនមានហ្វូង/ដំណាំត្រូវបានចុះឈ្មោះទេ។
                </p>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-canopy-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-shadow-canopy cursor-pointer"
                  style={{ fontFamily: font }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  ចុះឈ្មោះហ្វូង/ដំណាំ
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1, ease: [0, 0, 0.2, 1] }}
              >
                <DataTable columns={columns} data={batches} />
              </motion.div>
            )}
          </div>

          {/* Right sidebar (1/3) */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <div className="h-48 animate-pulse rounded-xl border border-field-stone bg-white" />
                <div className="h-36 animate-pulse rounded-xl border border-field-stone bg-white" />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15, ease: [0, 0, 0.2, 1] }}
                className="flex flex-col gap-4"
              >
                {/* Asset type breakdown */}
                <div
                  className="rounded-xl border border-field-stone bg-white p-5"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
                >
                  <h2
                    className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]"
                    style={{ fontFamily: font }}
                  >
                    ការបែងចែកប្រភេទ
                  </h2>
                  <div className="flex flex-col gap-4">
                    {typeBreakdown.map(({ type, count, quantity, totalQty }) => (
                      <TypeBreakdownItem
                        key={type}
                        type={type}
                        count={count}
                        quantity={quantity}
                        totalQty={totalQty}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div
                  className="rounded-xl border border-field-stone bg-white p-5"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
                >
                  <h2
                    className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]"
                    style={{ fontFamily: font }}
                  >
                    សកម្មភាព​រហ័ស
                  </h2>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => setIsRegisterOpen(true)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-rice-parchment cursor-pointer"
                      style={{ fontFamily: font }}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canopy-deep/10">
                        <Plus className="h-3.5 w-3.5 text-canopy-deep" />
                      </span>
                      ចុះឈ្មោះហ្វូង/ដំណាំ
                    </button>
                    <Link
                      href="/assets"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-rice-parchment cursor-pointer"
                      style={{ fontFamily: font }}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-field-stone">
                        <Tractor className="h-3.5 w-3.5 text-[#666]" />
                      </span>
                      ទ្រព្យសកម្មទាំងអស់
                    </Link>
                    <Link
                      href="/schedules"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-rice-parchment cursor-pointer"
                      style={{ fontFamily: font }}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-field-stone">
                        <CalendarRange className="h-3.5 w-3.5 text-[#666]" />
                      </span>
                      កាលវិភាគ
                    </Link>
                  </div>
                </div>
              </motion.div>
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
