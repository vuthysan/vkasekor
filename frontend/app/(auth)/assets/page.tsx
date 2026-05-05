"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { StatusBadge } from "~/components/ui/status-badge"
import { RegisterPanel, type AssetBatch } from "~/components/dashboard/register-panel"
import { Button } from "~/components/ui/button"
import {
  Plus, Search, Bird, PawPrint, Leaf, Layers, Package,
  AlertTriangle, Scissors, ChevronDown, ChevronUp,
  MoreHorizontal, Download, Eye, Pencil, Trash2, X,
} from "lucide-react"

const allBatches: AssetBatch[] = [
  { id: "B-1001", batchName: "Broiler Flock A",  assetType: "Chicken",  quantity: 500,  status: "Healthy",    registeredAt: "2026-05-01" },
  { id: "B-1002", batchName: "Piglets Barn 2",   assetType: "Pig",      quantity: 20,   status: "At Risk",    registeredAt: "2026-04-28" },
  { id: "B-1003", batchName: "Bok Choy Sector C",assetType: "Cucumber", quantity: 1000, status: "Harvesting", registeredAt: "2026-03-15" },
  { id: "B-1004", batchName: "Layer Flock B",    assetType: "Chicken",  quantity: 300,  status: "Healthy",    registeredAt: "2026-05-03" },
  { id: "B-1005", batchName: "Grower Pigs East", assetType: "Pig",      quantity: 35,   status: "Healthy",    registeredAt: "2026-04-10" },
  { id: "B-1006", batchName: "Cucumber Row D",   assetType: "Cucumber", quantity: 600,  status: "At Risk",    registeredAt: "2026-04-01" },
  { id: "B-1007", batchName: "Broiler Flock C",  assetType: "Chicken",  quantity: 450,  status: "Harvesting", registeredAt: "2026-03-01" },
]

type StatusFilter = "All" | "Healthy" | "At Risk" | "Harvesting"
type SortKey    = "batchName" | "quantity" | "registeredAt" | "status"
type SortDir    = "asc" | "desc"

const FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "All",        label: "ទាំងអស់" },
  { key: "Healthy",    label: "សុខភាពល្អ" },
  { key: "At Risk",    label: "មានហានិភ័យ" },
  { key: "Harvesting", label: "កំពុងប្រមូលផល" },
]

interface AssetTypeMeta { icon: React.ReactNode; label: string; bg: string; text: string; border: string }
const ASSET_TYPE_META: Record<string, AssetTypeMeta> = {
  Chicken:  { icon: <Bird     className="h-3.5 w-3.5" />, label: "មាន់",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  Pig:      { icon: <PawPrint className="h-3.5 w-3.5" />, label: "ជ្រូក",  bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200"   },
  Cucumber: { icon: <Leaf     className="h-3.5 w-3.5" />, label: "ត្រសក់", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
}

function ageInDays(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, iconBg, iconColor,
}: {
  label: string; value: string | number
  icon: React.ReactNode; iconBg: string; iconColor: string
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-field-stone bg-white px-4 py-3.5 min-w-0">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p
          className="truncate text-[11px] font-medium uppercase tracking-[0.06em] text-[#999]"
          style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
        >
          {label}
        </p>
        <p className="tabular-nums text-xl font-bold text-[#111]">{value}</p>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-field-stone">
      <td className="px-4 py-4"><div className="h-2.5 w-12 rounded bg-dried-grass/60 animate-pulse" /></td>
      <td className="px-4 py-4"><div className="h-3 w-40 rounded bg-dried-grass/60 animate-pulse" /></td>
      <td className="px-4 py-4"><div className="h-5 w-18 rounded-full bg-dried-grass/60 animate-pulse" /></td>
      <td className="px-4 py-4"><div className="h-3 w-14 rounded bg-dried-grass/60 animate-pulse" /></td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="h-3 w-20 rounded bg-dried-grass/60 animate-pulse" />
          <div className="h-2.5 w-12 rounded bg-dried-grass/40 animate-pulse" />
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-5 w-22 rounded-full bg-dried-grass/60 animate-pulse" /></td>
      <td className="px-3 py-4"><div className="h-7 w-7 rounded-md bg-dried-grass/40 animate-pulse" /></td>
    </tr>
  )
}

function ActionMenu({ batch }: { batch: AssetBatch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${batch.batchName}`}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#ccc] hover:bg-field-stone hover:text-[#555] transition-colors cursor-pointer"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12, ease: [0, 0, 0.2, 1] }}
            className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-field-stone bg-white py-1 shadow-lg shadow-black/6"
          >
            {[
              { icon: <Eye     className="h-3.5 w-3.5" />, label: "មើលលម្អិត" },
              { icon: <Pencil  className="h-3.5 w-3.5" />, label: "កែសម្រួល"  },
              { icon: <Trash2  className="h-3.5 w-3.5" />, label: "លុបចេញ",   danger: true },
            ].map(({ icon, label, danger }) => (
              <button
                key={label}
                onClick={() => setOpen(false)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                  danger ? "text-[#dc2626] hover:bg-red-50" : "text-[#555] hover:bg-rice-parchment"
                }`}
                style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
              >
                {icon}
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SortTh({
  children, sortKey, currentSort, onSort,
}: {
  children: React.ReactNode
  sortKey: SortKey
  currentSort: { key: SortKey; dir: SortDir } | null
  onSort: (key: SortKey) => void
}) {
  const active = currentSort?.key === sortKey
  const isAsc  = active && currentSort?.dir === "asc"
  return (
    <th className="px-4 py-3.5 text-left">
      <button
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999] hover:text-[#555] transition-colors cursor-pointer"
      >
        {children}
        <span className={active ? "text-canopy-deep" : "text-[#d8d5d0]"}>
          {isAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      </button>
    </th>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [isLoading, setIsLoading]       = useState(true)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("All")
  const [batches, setBatches]           = useState<AssetBatch[]>(allBatches)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [sort, setSort]     = useState<{ key: SortKey; dir: SortDir } | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const counts: Record<StatusFilter, number> & { totalQty: number } = useMemo(() => ({
    All:        batches.length,
    Healthy:    batches.filter((b) => b.status === "Healthy").length,
    "At Risk":  batches.filter((b) => b.status === "At Risk").length,
    Harvesting: batches.filter((b) => b.status === "Harvesting").length,
    totalQty:   batches.reduce((s, b) => s + b.quantity, 0),
  }), [batches])

  const filtered = useMemo(() => {
    let result = activeFilter === "All" ? batches : batches.filter((b) => b.status === activeFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (b) =>
          b.batchName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.assetType.toLowerCase().includes(q)
      )
    }
    if (sort) {
      result = [...result].sort((a, b) => {
        let av: string | number = a[sort.key]
        let bv: string | number = b[sort.key]
        if (sort.key === "quantity") { av = Number(av); bv = Number(bv) }
        else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase() }
        if (av < bv) return sort.dir === "asc" ? -1 : 1
        if (av > bv) return sort.dir === "asc" ?  1 : -1
        return 0
      })
    }
    return result
  }, [batches, activeFilter, search, sort])

  function handleSort(key: SortKey) {
    setSort((prev) => {
      if (prev?.key === key) return prev.dir === "asc" ? { key, dir: "desc" } : null
      return { key, dir: "asc" }
    })
  }

  function handleBatchRegistered(batch: AssetBatch) {
    setBatches((prev) => [batch, ...prev])
    setIsRegisterOpen(false)
  }

  const font = "var(--font-inter), var(--font-kantumruy)"

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl font-bold tracking-tight text-[#111]"
              style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}
            >
              ហ្វូង/ដំណាំទាំងអស់
            </h1>
            <p className="mt-0.5 text-sm text-[#888]" style={{ fontFamily: font }}>
              {isLoading ? " " : `${counts.All} ហ្វូង · ${counts.totalQty.toLocaleString()} នាក់/ដើម`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="flex h-9 items-center gap-1.5 rounded-lg border border-field-stone bg-white px-3 text-xs font-medium text-[#666] transition-colors hover:bg-rice-parchment hover:text-[#333] cursor-pointer"
              style={{ fontFamily: font }}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">នាំចេញ</span>
            </button>
            <Button
              onClick={() => setIsRegisterOpen(true)}
              className="h-9 text-xs font-semibold"
              style={{ backgroundColor: "var(--color-canopy-deep)", color: "white", fontFamily: font }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ចុះឈ្មោះថ្មី</span>
              <span className="sm:hidden">ថ្មី</span>
            </Button>
          </div>
        </div>

        {/* ── KPI stat cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="ហ្វូង/ដំណាំសរុប"
            value={isLoading ? "—" : counts.All}
            icon={<Layers className="h-4 w-4" />}
            iconBg="bg-canopy-deep/10"
            iconColor="text-canopy-deep"
          />
          <StatCard
            label="បរិមាណសរុប"
            value={isLoading ? "—" : counts.totalQty.toLocaleString()}
            icon={<Package className="h-4 w-4" />}
            iconBg="bg-field-green/10"
            iconColor="text-field-green"
          />
          <StatCard
            label="មានហានិភ័យ"
            value={isLoading ? "—" : counts["At Risk"]}
            icon={<AlertTriangle className="h-4 w-4" />}
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />
          <StatCard
            label="កំពុងប្រមូលផល"
            value={isLoading ? "—" : counts.Harvesting}
            icon={<Scissors className="h-4 w-4" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />
        </div>

        {/* ── Toolbar: filter pills + search ── */}
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ fontFamily: font }}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_OPTIONS.map(({ key, label }) => {
              const active = activeFilter === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                    active
                      ? "bg-canopy-deep text-white"
                      : "bg-white border border-field-stone text-[#555] hover:border-sage-mist hover:bg-rice-parchment"
                  }`}
                >
                  {label}
                  <span
                    className={`tabular-nums rounded-full px-1.5 py-px text-[10px] font-bold ${
                      active ? "bg-white/20 text-white" : "bg-rice-parchment text-[#aaa]"
                    }`}
                  >
                    {counts[key]}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative shrink-0 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#bbb]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរក..."
              className="h-8 w-full rounded-lg border border-field-stone bg-white pl-8 pr-7 text-xs text-[#333] placeholder:text-[#ccc] outline-none transition-colors hover:border-sage-mist focus:border-field-green"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#555] cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          className="rounded-xl border border-field-stone bg-white overflow-hidden"
        >
          <table className="w-full" style={{ fontFamily: font }}>
            <thead className="border-b border-field-stone bg-rice-parchment">
              <tr>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999]">
                  លេខ​សម្គាល់
                </th>
                <SortTh sortKey="batchName"    currentSort={sort} onSort={handleSort}>ហ្វូង/ដំណាំ</SortTh>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999]">
                  ប្រភេទ
                </th>
                <SortTh sortKey="quantity"     currentSort={sort} onSort={handleSort}>បរិមាណ</SortTh>
                <SortTh sortKey="registeredAt" currentSort={sort} onSort={handleSort}>ថ្ងៃចូល · អាយុ</SortTh>
                <SortTh sortKey="status"       currentSort={sort} onSort={handleSort}>ស្ថានភាព</SortTh>
                <th className="px-3 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map((batch) => {
                    const meta = ASSET_TYPE_META[batch.assetType]
                    return (
                      <tr
                        key={batch.id}
                        className="border-b border-field-stone last:border-b-0 hover:bg-rice-parchment transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-[11px] tracking-wider text-[#c0bdb8]">
                            {batch.id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-[13px] text-[#111]">{batch.batchName}</span>
                        </td>
                        <td className="px-4 py-4">
                          {meta && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.bg} ${meta.text} ${meta.border}`}>
                              {meta.icon}
                              {meta.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="tabular-nums text-sm font-semibold text-[#222]">
                            {batch.quantity.toLocaleString()}
                          </span>
                          <span className="ml-1 text-[11px] text-[#bbb]">នាក់/ដើម</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-[#444]">{batch.registeredAt}</span>
                            <span className="text-[11px] text-[#aaa]">ថ្ងៃទី {ageInDays(batch.registeredAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={batch.status} />
                        </td>
                        <td className="px-3 py-4">
                          <ActionMenu batch={batch} />
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center" style={{ fontFamily: font }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rice-parchment">
                <Search className="h-5 w-5 text-[#ccc]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#555]">
                  {search ? "រកមិនឃើញ" : "គ្មានទិន្នន័យ"}
                </p>
                <p className="mt-0.5 text-xs text-[#aaa]">
                  {search
                    ? `"${search}" — ពុំមានហ្វូង/ដំណាំត្រូវគ្នា`
                    : "ចុះឈ្មោះហ្វូង/ដំណាំថ្មី ដើម្បីចាប់ផ្ដើម"}
                </p>
              </div>
              {!search && (
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg bg-canopy-deep px-4 py-2 text-xs font-semibold text-white hover:bg-shadow-canopy transition-colors cursor-pointer"
                  style={{ fontFamily: font }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  ចុះឈ្មោះហ្វូង/ដំណាំ
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Row count footer ── */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-right text-[11px] text-[#bbb]" style={{ fontFamily: font }}>
            {filtered.length === batches.length
              ? `${filtered.length} ហ្វូង/ដំណាំ`
              : `${filtered.length} នៃ ${batches.length} ហ្វូង/ដំណាំ`}
          </p>
        )}
      </div>

      <RegisterPanel
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleBatchRegistered}
      />
    </>
  )
}
