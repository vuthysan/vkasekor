"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { RefreshCw, Sun, Sunrise, Sunset, Moon } from "lucide-react"
import { TaskCard, type FarmerTask } from "~/components/farm/task-card"
import { BatchStatusBar, type FarmerBatch, type BatchStatus } from "~/components/farm/batch-status-bar"
import { fetchAlerts, fetchAssets, ASSET_CONFIG, markAlertDone, type Alert, type Asset } from "~/lib/api"

// ─── Helpers ────────────────────────────────────────────────────────────────

const KH_DAYS   = ["អាទិត្យ","ច័ន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍"]
const KH_MONTHS = ["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"]

function formatKhmerDate(d: Date): string {
  return `ថ្ងៃ${KH_DAYS[d.getDay()]} ទី${d.getDate()} ខែ${KH_MONTHS[d.getMonth()]} ឆ្នាំ${d.getFullYear()}`
}

type ReactIcon = typeof Sun
function getGreeting(d: Date): { text: string; icon: ReactIcon; iconBg: string; iconColor: string } {
  const h = d.getHours()
  if (h >= 5  && h < 9)  return { text: "អរុណសួស្ដី",   icon: Sunrise, iconBg: "#fef3c7", iconColor: "#d97706" }
  if (h >= 9  && h < 17) return { text: "ទិវាសួស្ដី",    icon: Sun,     iconBg: "#fef3c7", iconColor: "#f59e0b" }
  if (h >= 17 && h < 20) return { text: "សាយណ្ហសួស្ដី", icon: Sunset,  iconBg: "#fed7aa", iconColor: "#ea580c" }
  return                         { text: "រាត្រីសួស្ដី",  icon: Moon,    iconBg: "#e0e7ff", iconColor: "#4f46e5" }
}

function ageInDays(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

// Convert a backend Alert (enriched with rule + asset fields) into a FarmerTask
function alertToTask(alert: Alert): FarmerTask {
  const cfg = alert.asset_type ? ASSET_CONFIG[alert.asset_type] : undefined
  const emoji = cfg?.emoji ?? "🌿"
  const labelKh = cfg?.labelKh ?? alert.asset_type ?? "?"
  // Build batch display name from enriched asset fields
  const batchNameKh = alert.asset_notes
    ? `${emoji} ${alert.asset_notes}`
    : `${emoji} ${labelKh} · ${alert.asset_breed ?? ""}`

  const scheduledDay = new Date(alert.scheduled_for)
  const today = new Date()
  scheduledDay.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  let dueType: FarmerTask["dueType"] = "today"
  if (scheduledDay < today) dueType = "overdue"
  else if (scheduledDay > today) dueType = "upcoming"

  return {
    id: alert._id,
    batchNameKh,
    emoji,
    titleKh: alert.title_kh ?? "—",
    instructionsKh: alert.instructions_kh ?? "",
    day: alert.day_offset ?? 0,
    dueType,
    isDone: false,
  }
}

// Convert a backend Asset into a FarmerBatch
function assetToBatch(a: Asset): FarmerBatch {
  const cfg = ASSET_CONFIG[a.type]
  let status: BatchStatus = "Healthy"
  if (a.status === "harvested") status = "Harvesting"
  return {
    id: a._id,
    nameKh: a.notes || `${cfg.labelKh} · ${a.breed}`,
    type: a.type,
    emoji: cfg.emoji,
    status,
    dayCount: ageInDays(a.arrival_date),
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function HeroHeader({ now, done, total }: { now: Date | null; done: number; total: number }) {
  const g = now ? getGreeting(now) : { text: "សួស្ដី", icon: Sun, iconBg: "#fef3c7", iconColor: "#f59e0b" }
  const Icon = g.icon
  const dateStr = now ? formatKhmerDate(now) : " "
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const isComplete = total > 0 && done === total

  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: g.iconBg, color: g.iconColor }}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p style={{ fontFamily: "var(--font-kantumruy)", fontSize: 19, fontWeight: 700, color: "#1c1408", lineHeight: "1.4" }}>
            {g.text}!
          </p>
          <p className="mt-0.5" style={{ fontFamily: "var(--font-kantumruy)", fontSize: 12.5, color: "#9c8b73", lineHeight: "1.6" }}>
            {dateStr}
          </p>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-4 rounded-xl px-4 py-3" style={{ background: "#fdf6e3", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ fontFamily: "var(--font-kantumruy)", fontSize: 12.5, fontWeight: 600, color: "#7a6a50" }}>
              {isComplete ? "ភារកិច្ចទាំងអស់បានបញ្ចប់" : "ភារកិច្ចបានធ្វើ"}
            </span>
            <span style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)", fontSize: 13, fontWeight: 700, color: "#1c1408" }}>
              <span className="tabular-nums">{done}</span>
              <span className="mx-1 opacity-40">/</span>
              <span className="tabular-nums">{total}</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#ede8df" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isComplete ? "#16a34a" : "#0f3d1f" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function HeroSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl px-5 py-5" style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#e8dcc8]" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-32 rounded bg-[#e8dcc8]" />
          <div className="h-3 w-44 rounded bg-[#e8dcc8]" />
        </div>
      </div>
      <div className="mt-4 h-12 rounded-xl bg-[#e8dcc8]" />
    </div>
  )
}

function SectionHeader({ children, color }: { children: string; color: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="block h-3 w-1 rounded-full" style={{ background: color }} />
      <p style={{ fontFamily: "var(--font-kantumruy)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color, textTransform: "uppercase" }}>
        {children}
      </p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl px-5 py-4" style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}>
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#e8dcc8]" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-[#e8dcc8]" />
          <div className="h-4 w-1/2 rounded bg-[#e8dcc8]" />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="h-3 w-full rounded bg-[#e8dcc8]" />
        <div className="h-3 w-5/6 rounded bg-[#e8dcc8]" />
      </div>
      <div className="mt-5 h-12 rounded-xl bg-[#e8dcc8]" />
    </div>
  )
}

function AllDoneState({ hasUpcoming }: { hasUpcoming: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center"
      style={{ background: "#fffdf7", border: "1px solid #bbf7d0" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "#f0fdf4" }}
      >
        <svg className="h-7 w-7" style={{ color: "#16a34a" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </motion.div>
      <div>
        <p style={{ fontFamily: "var(--font-kantumruy)", fontSize: 18, fontWeight: 700, color: "#1c1408", lineHeight: "1.8" }}>
          ភារកិច្ចទាំងអស់បានបញ្ចប់
        </p>
        {hasUpcoming && (
          <p className="mt-2" style={{ fontFamily: "var(--font-kantumruy)", fontSize: 13, color: "#9c8b73", lineHeight: "1.9" }}>
            ភារកិច្ចខាងមុខបង្ហាញខាងក្រោម
          </p>
        )}
      </div>
    </motion.div>
  )
}

function EmptyTaskState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center" style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}>
      <span className="text-4xl">🌱</span>
      <div>
        <p style={{ fontFamily: "var(--font-kantumruy)", fontSize: 17, fontWeight: 700, color: "#1c1408", lineHeight: "1.8" }}>
          គ្មានភារកិច្ចថ្ងៃនេះ
        </p>
        <p style={{ fontFamily: "var(--font-kantumruy)", fontSize: 13, color: "#9c8b73", lineHeight: "1.9" }}>
          ចុះឈ្មោះហ្វូង/ដំណាំ ដើម្បីចាប់ផ្ដើមទទួលការណែនាំ
        </p>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FarmPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks]         = useState<FarmerTask[]>([])
  const [batches, setBatches]     = useState<FarmerBatch[]>([])
  const [now, setNow]             = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    try {
      const [alerts, assets] = await Promise.all([
        fetchAlerts({ days: 7 }),
        fetchAssets("active"),
      ])
      // Keep only tasks for assets that the farmer actually has
      const myAssetIds = new Set(assets.map((a) => a._id))
      const myAlerts = alerts.filter((a) => myAssetIds.has(a.asset_id))
      setTasks(myAlerts.map(alertToTask))
      setBatches(assets.map(assetToBatch))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setNow(new Date())
    load()
  }, [load])

  async function handleDone(id: string) {
    // Optimistic update for premium user experience
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isDone: true } : t)))
    try {
      await markAlertDone(id)
    } catch (err) {
      console.error("Failed to mark alert as done:", err)
      // Revert optimistic state on failure
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isDone: false } : t)))
    }
  }

  const overdue  = tasks.filter((t) => t.dueType === "overdue"  && !t.isDone)
  const today    = tasks.filter((t) => t.dueType === "today"    && !t.isDone)
  const upcoming = tasks.filter((t) => t.dueType === "upcoming" && !t.isDone)
  const done     = tasks.filter((t) => t.isDone)

  const actionableTotal   = tasks.filter((t) => t.dueType === "overdue" || t.dueType === "today").length
  const actionableDone    = tasks.filter((t) => (t.dueType === "overdue" || t.dueType === "today") && t.isDone).length
  const allActionableDone = actionableTotal > 0 && actionableDone === actionableTotal

  return (
    <div className="flex flex-col gap-6">

      {/* Greeting hero with progress */}
      {isLoading
        ? <HeroSkeleton />
        : <HeroHeader now={now} done={actionableDone} total={actionableTotal} />}

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Tasks column */}
        <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: "var(--font-kantumruy)", fontSize: 22, fontWeight: 700, color: "#1c1408", lineHeight: "1.5" }}>
              ភារកិច្ចថ្ងៃនេះ
            </h2>
            <button
              onClick={() => load(true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1.5 rounded-lg border border-field-stone bg-white px-3 py-1.5 text-xs font-medium text-[#666] transition-colors hover:bg-rice-parchment disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">ធ្វើឱ្យស្រស់</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyTaskState />
          ) : (
            <div className="flex flex-col gap-3">
              {allActionableDone && <AllDoneState hasUpcoming={upcoming.length > 0} />}

              {overdue.length > 0 && (
                <div>
                  <SectionHeader color="#dc2626">យឺតពេល</SectionHeader>
                  <div className="flex flex-col gap-3">
                    {overdue.map((t) => <TaskCard key={t.id} task={t} onDone={handleDone} />)}
                  </div>
                </div>
              )}

              {today.length > 0 && (
                <div className={overdue.length > 0 ? "mt-3" : ""}>
                  {overdue.length > 0 && <SectionHeader color="#7a6a50">ថ្ងៃនេះ</SectionHeader>}
                  <div className="flex flex-col gap-3">
                    {today.map((t) => <TaskCard key={t.id} task={t} onDone={handleDone} />)}
                  </div>
                </div>
              )}

              {upcoming.length > 0 && (
                <div className="mt-3">
                  <SectionHeader color="#b5a88f">ខាងមុខ (៧ ថ្ងៃ)</SectionHeader>
                  <div className="flex flex-col gap-3">
                    {upcoming.map((t) => <TaskCard key={t.id} task={t} onDone={handleDone} />)}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {done.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    <SectionHeader color="#b5a88f">បានធ្វើរួច</SectionHeader>
                    <div className="flex flex-col gap-3">
                      {done.map((t) => <TaskCard key={t.id} task={t} onDone={handleDone} />)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Batch sidebar */}
        <aside className="order-1 flex flex-col gap-3 lg:order-2 lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
          <h3 className="hidden lg:block" style={{ fontFamily: "var(--font-kantumruy)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "#7a6a50", textTransform: "uppercase" }}>
            ហ្វូង/ដំណាំសកម្ម
          </h3>
          {isLoading ? (
            <div className="flex flex-wrap gap-2.5 lg:flex-col">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 w-36 animate-pulse rounded-2xl lg:w-full" style={{ background: "#ede8df" }} />
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="rounded-2xl px-4 py-6 text-center" style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}>
              <p style={{ fontFamily: "var(--font-kantumruy)", fontSize: 12.5, color: "#9c8b73" }}>
                មិនទាន់មានហ្វូង/ដំណាំ
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <BatchStatusBar batches={batches} />
            </motion.div>
          )}

          {/* Quick stats */}
          {!isLoading && batches.length > 0 && (
            <div className="mt-1 grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-2">
              {[
                { label: "ហ្វូងសរុប",  value: batches.length,                                                  color: "#7a6a50" },
                { label: "ភារកិច្ចថ្ងៃ", value: today.length + overdue.length,                                   color: today.length + overdue.length > 0 ? "#dc2626" : "#15803d" },
                { label: "ខាងមុខ",      value: upcoming.length,                                                  color: "#9c8b73" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col rounded-xl px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between" style={{ background: "#fdf6e3", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <span style={{ fontFamily: "var(--font-kantumruy)", fontSize: 11, color: "#9c8b73" }}>{s.label}</span>
                  <span className="tabular-nums" style={{ fontFamily: "var(--font-inter)", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

      </div>
    </div>
  )
}
