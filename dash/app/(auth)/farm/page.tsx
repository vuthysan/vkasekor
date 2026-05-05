"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sun, Sunrise, Sunset, Moon } from "lucide-react"
import { TaskCard, type FarmerTask } from "~/components/farm/task-card"
import { BatchStatusBar, type FarmerBatch } from "~/components/farm/batch-status-bar"

// ---------------------------------------------------------------------------
// Mock data — mirrors what the backend Rules Engine would return for a farmer.
// Replace with a real fetch once the /api/farm endpoint exists.
// ---------------------------------------------------------------------------

const MOCK_BATCHES: FarmerBatch[] = [
  {
    id: "B-1001",
    nameKh: "ហ្វូងមាន់ A",
    type: "chicken",
    emoji: "🐔",
    status: "Healthy",
    dayCount: 14,
  },
  {
    id: "B-1003",
    nameKh: "ត្រសក់ C",
    type: "cucumber",
    emoji: "🥒",
    status: "At Risk",
    dayCount: 15,
  },
]

const INITIAL_TASKS: FarmerTask[] = [
  {
    id: "t-overdue-1",
    batchNameKh: "ហ្វូងមាន់ A",
    emoji: "🐔",
    titleKh: "ចាក់វ៉ាក់សាំង Newcastle (ND-IB) ដងទី១",
    instructionsKh: "ប្រើ B1 strain\nដក់ចូលក្នុងភ្នែក ឬច្រមុះ\nធ្វើនៅពេលព្រឹក ឬល្ងាច",
    day: 7,
    dueType: "overdue",
    isDone: false,
  },
  {
    id: "t-today-1",
    batchNameKh: "ហ្វូងមាន់ A",
    emoji: "🐔",
    titleKh: "ចាក់វ៉ាក់សាំង Gumboro ដងទី១",
    instructionsKh: "លាយក្នុងទឹកផឹក\nឲ្យមាន់ឃ្លានបន្តិចមុន",
    day: 14,
    dueType: "today",
    isDone: false,
  },
  {
    id: "t-today-2",
    batchNameKh: "ត្រសក់ C",
    emoji: "🥒",
    titleKh: "ដាក់ជីបំប៉នលើកទី១",
    instructionsKh: "ប្រើជី NPK 15-15-15\nដាក់ជុំវិញគល់ ចម្ងាយ ១០ ស.ម.",
    day: 15,
    dueType: "today",
    isDone: false,
  },
  {
    id: "t-upcoming-1",
    batchNameKh: "ត្រសក់ C",
    emoji: "🥒",
    titleKh: "ចាប់ផ្តើមប្រមូលផល",
    instructionsKh: "បេះផ្លែដែលគ្រប់អាយុ\nកុំទុកឲ្យផ្លែចាស់ពេក",
    day: 30,
    dueType: "upcoming",
    isDone: false,
  },
]

// ─── Khmer date helpers ────────────────────────────────────────────────────

const KH_DAYS   = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"]
const KH_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"]

function formatKhmerDate(d: Date): string {
  return `ថ្ងៃ${KH_DAYS[d.getDay()]} ទី${d.getDate()} ខែ${KH_MONTHS[d.getMonth()]} ឆ្នាំ${d.getFullYear()}`
}

function getGreeting(d: Date): { text: string; icon: ReactIcon; iconBg: string; iconColor: string } {
  const h = d.getHours()
  if (h >= 5  && h < 9)  return { text: "អរុណសួស្ដី", icon: Sunrise, iconBg: "#fef3c7", iconColor: "#d97706" }
  if (h >= 9  && h < 17) return { text: "ទិវាសួស្ដី",  icon: Sun,     iconBg: "#fef3c7", iconColor: "#f59e0b" }
  if (h >= 17 && h < 20) return { text: "សាយណ្ហសួស្ដី", icon: Sunset,  iconBg: "#fed7aa", iconColor: "#ea580c" }
  return                        { text: "រាត្រីសួស្ដី",  icon: Moon,    iconBg: "#e0e7ff", iconColor: "#4f46e5" }
}

type ReactIcon = typeof Sun

// ─── Sub-components ────────────────────────────────────────────────────────

function HeroHeader({
  now, done, total,
}: { now: Date | null; done: number; total: number }) {
  const fallback = { text: "សួស្ដី", icon: Sun, iconBg: "#fef3c7", iconColor: "#f59e0b" }
  const g = now ? getGreeting(now) : fallback
  const Icon = g.icon
  const dateStr = now ? formatKhmerDate(now) : " "
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const isComplete = total > 0 && done === total

  return (
    <div
      className="rounded-2xl px-5 py-5"
      style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: g.iconBg, color: g.iconColor }}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            style={{
              fontFamily: "var(--font-kantumruy)",
              fontSize: 19,
              fontWeight: 700,
              color: "#1c1408",
              lineHeight: "1.4",
            }}
          >
            {g.text}!
          </p>
          <p
            className="mt-0.5"
            style={{
              fontFamily: "var(--font-kantumruy)",
              fontSize: 12.5,
              color: "#9c8b73",
              lineHeight: "1.6",
            }}
          >
            {dateStr}
          </p>
        </div>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div
          className="mt-4 rounded-xl px-4 py-3"
          style={{ background: "#fdf6e3", border: "1px solid rgba(0,0,0,0.04)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              style={{
                fontFamily: "var(--font-kantumruy)",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#7a6a50",
              }}
            >
              {isComplete ? "ភារកិច្ចទាំងអស់បានបញ្ចប់" : "ភារកិច្ចបានធ្វើ"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-inter), var(--font-kantumruy)",
                fontSize: 13,
                fontWeight: 700,
                color: "#1c1408",
              }}
            >
              <span className="tabular-nums">{done}</span>
              <span className="mx-1 opacity-40">/</span>
              <span className="tabular-nums">{total}</span>
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ background: "#ede8df" }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
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
    <div
      className="animate-pulse rounded-2xl px-5 py-5"
      style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}
    >
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
      <p
        style={{
          fontFamily: "var(--font-kantumruy)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color,
          textTransform: "uppercase",
        }}
      >
        {children}
      </p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl px-5 py-4"
      style={{ background: "#fffdf7", border: "1px solid rgba(0,0,0,0.07)" }}
    >
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
        transition={{ delay: 0.1, duration: 0.3, ease: [0, 0, 0.2, 1] }}
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "#f0fdf4" }}
      >
        <svg
          className="h-7 w-7"
          style={{ color: "#16a34a" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </motion.div>
      <div>
        <p
          style={{
            fontFamily: "var(--font-kantumruy)",
            fontSize: 18,
            fontWeight: 700,
            color: "#1c1408",
            lineHeight: "1.8",
          }}
        >
          ភារកិច្ចទាំងអស់បានបញ្ចប់
        </p>
        {hasUpcoming && (
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-kantumruy)",
              fontSize: 13,
              color: "#9c8b73",
              lineHeight: "1.9",
            }}
          >
            ភារកិច្ចខាងមុខបង្ហាញខាងក្រោម
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function FarmPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks]         = useState<FarmerTask[]>(INITIAL_TASKS)
  const [now, setNow]             = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  function handleDone(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDone: true } : t))
    )
  }

  const overdue  = tasks.filter((t) => t.dueType === "overdue" && !t.isDone)
  const today    = tasks.filter((t) => t.dueType === "today"   && !t.isDone)
  const upcoming = tasks.filter((t) => t.dueType === "upcoming" && !t.isDone)
  const done     = tasks.filter((t) => t.isDone)

  const actionableTotal   = tasks.filter((t) => t.dueType === "overdue" || t.dueType === "today").length
  const actionableDone    = tasks.filter((t) => (t.dueType === "overdue" || t.dueType === "today") && t.isDone).length
  const allActionableDone = actionableTotal > 0 && actionableDone === actionableTotal

  return (
    <div className="flex flex-col gap-6">

      {/* ── Greeting hero with progress (full width) ── */}
      {isLoading
        ? <HeroSkeleton />
        : <HeroHeader now={now} done={actionableDone} total={actionableTotal} />}

      {/* ── Main grid: tasks (left) + batch sidebar (right) on desktop ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Tasks column — appears second on mobile, primary on desktop */}
        <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-2">
          <h2
            style={{
              fontFamily: "var(--font-kantumruy)",
              fontSize: 22,
              fontWeight: 700,
              color: "#1c1408",
              lineHeight: "1.5",
            }}
          >
            ភារកិច្ចថ្ងៃនេះ
          </h2>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allActionableDone && <AllDoneState hasUpcoming={upcoming.length > 0} />}

              {overdue.length > 0 && (
                <div>
                  <SectionHeader color="#dc2626">យឺតពេល</SectionHeader>
                  <div className="flex flex-col gap-3">
                    {overdue.map((t) => (
                      <TaskCard key={t.id} task={t} onDone={handleDone} />
                    ))}
                  </div>
                </div>
              )}

              {today.length > 0 && (
                <div className={overdue.length > 0 ? "mt-3" : ""}>
                  {overdue.length > 0 && (
                    <SectionHeader color="#7a6a50">ថ្ងៃនេះ</SectionHeader>
                  )}
                  <div className="flex flex-col gap-3">
                    {today.map((t) => (
                      <TaskCard key={t.id} task={t} onDone={handleDone} />
                    ))}
                  </div>
                </div>
              )}

              {upcoming.length > 0 && (
                <div className="mt-3">
                  <SectionHeader color="#b5a88f">ខាងមុខ</SectionHeader>
                  <div className="flex flex-col gap-3">
                    {upcoming.map((t) => (
                      <TaskCard key={t.id} task={t} onDone={handleDone} />
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {done.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3"
                  >
                    <SectionHeader color="#b5a88f">បានធ្វើរួច</SectionHeader>
                    <div className="flex flex-col gap-3">
                      {done.map((t) => (
                        <TaskCard key={t.id} task={t} onDone={handleDone} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Batch sidebar — appears first on mobile, sticky right column on desktop */}
        <aside className="order-1 flex flex-col gap-3 lg:order-2 lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
          <h3
            style={{
              fontFamily: "var(--font-kantumruy)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#7a6a50",
              textTransform: "uppercase",
            }}
            className="hidden lg:block"
          >
            ហ្វូង/ដំណាំ
          </h3>
          {isLoading ? (
            <div className="flex flex-wrap gap-2.5 lg:flex-col">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 w-36 animate-pulse rounded-2xl lg:w-full"
                  style={{ background: "#ede8df" }}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="[&>div]:lg:flex-col [&>div>div]:lg:w-full"
            >
              <BatchStatusBar batches={MOCK_BATCHES} />
            </motion.div>
          )}
        </aside>
      </div>
    </div>
  )
}
