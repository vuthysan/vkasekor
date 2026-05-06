"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Sparkles, Syringe, Wheat, Shield, Eye, Scissors, Printer,
  Bell, BookOpen, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react"
import {
  fetchRules, fetchAlerts, ASSET_CONFIG,
  type AssetType, type Rule, type Alert,
} from "~/lib/api"

// ─── Phase config ──────────────────────────────────────────────────────────

interface Phase {
  key: string; label: string
  bg: string; text: string; border: string; marker: string
  icon: ReactNode
}

const PHASES: Record<string, Phase> = {
  setup:      { key: "setup",      label: "រៀបចំ",    bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",   marker: "bg-slate-100",   icon: <Sparkles className="h-3 w-3" /> },
  health:     { key: "health",     label: "សុខភាព",   bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  marker: "bg-purple-100",  icon: <Syringe  className="h-3 w-3" /> },
  feed:       { key: "feed",       label: "ចំណី",     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", marker: "bg-emerald-100", icon: <Wheat    className="h-3 w-3" /> },
  protection: { key: "protection", label: "ការពារ",   bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     marker: "bg-red-100",     icon: <Shield   className="h-3 w-3" /> },
  care:       { key: "care",       label: "ថែទាំ",    bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     marker: "bg-sky-100",     icon: <Eye      className="h-3 w-3" /> },
  housing:    { key: "housing",    label: "ទ្រុង",    bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  marker: "bg-orange-100",  icon: <Eye      className="h-3 w-3" /> },
  harvest:    { key: "harvest",    label: "ប្រមូលផល", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   marker: "bg-amber-100",   icon: <Scissors className="h-3 w-3" /> },
}

function getPhase(category: string): Phase {
  return PHASES[category] ?? PHASES.care
}

const SEVERITY_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  critical:  { label: "ចាំបាច់ខ្លាំង", color: "text-red-600",    bg: "bg-red-50",    dot: "bg-red-500"    },
  important: { label: "សំខាន់",         color: "text-amber-600",  bg: "bg-amber-50",  dot: "bg-amber-400"  },
  routine:   { label: "ទូទៅ",            color: "text-green-600",  bg: "bg-green-50",  dot: "bg-green-400"  },
}

// ─── Asset type selector items ─────────────────────────────────────────────

const ASSET_TABS: AssetType[] = ["chicken", "pig", "duck", "cow", "lemon", "cucumber", "cabbage", "tomato"]

// ─── Sub-components ─────────────────────────────────────────────────────────

function SkeletonTimeline() {
  return (
    <div className="grid grid-cols-[48px_1fr] gap-x-4 sm:grid-cols-[56px_1fr] sm:gap-x-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Fragment key={i}>
          <div className="flex justify-center pb-7">
            <div className="h-10 w-10 animate-pulse rounded-full bg-field-stone" />
          </div>
          <div className="pb-7">
            <div className="rounded-xl border border-field-stone bg-white p-4">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-20 animate-pulse rounded bg-field-stone" />
                <div className="h-4 w-52 animate-pulse rounded bg-field-stone" />
                <div className="h-3 w-full animate-pulse rounded bg-field-stone" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-field-stone" />
              </div>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function RuleCard({ rule, index, total }: { rule: Rule; index: number; total: number }) {
  const phase     = getPhase(rule.category)
  const severity  = SEVERITY_META[rule.severity] ?? SEVERITY_META.routine
  const isFirst   = index === 0
  const isLast    = index === total - 1
  const font      = "var(--font-inter), var(--font-kantumruy)"

  return (
    <Fragment>
      {/* Marker column */}
      <div className="relative flex justify-center pb-7">
        {total > 1 && (
          <div className={`absolute left-1/2 w-px -translate-x-1/2 bg-field-stone ${isFirst ? "top-5 bottom-0" : isLast ? "top-0 h-5" : "inset-y-0"}`} />
        )}
        <div
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${phase.marker} ${phase.border}`}
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <span className={`tabular-nums text-xs font-bold leading-none ${phase.text}`} style={{ fontFamily: font }}>
            {rule.day_offset}
          </span>
        </div>
      </div>

      {/* Content card */}
      <div className="pb-7">
        <div className="rounded-xl border border-field-stone bg-white p-4 transition-shadow hover:shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${phase.bg} ${phase.text} ${phase.border}`} style={{ fontFamily: font }}>
              {phase.icon} {phase.label}
            </span>
            {/* Severity dot */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${severity.color}`} style={{ fontFamily: font }}>
              <span className={`h-1.5 w-1.5 rounded-full ${severity.dot}`} />
              {severity.label}
            </span>
            {/* Step counter */}
            <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-[#aaa]" style={{ fontFamily: font }}>
              <span className="tabular-nums">{index + 1}</span> នៃ <span className="tabular-nums">{total}</span>
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-snug text-[#111]" style={{ fontFamily: font }}>
            {rule.title_kh}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#666]" style={{ fontFamily: font, maxWidth: "62ch" }}>
            {rule.instructions_kh}
          </p>
          {rule.source_page && (
            <p className="mt-2 text-[11px] text-[#ccc]" style={{ fontFamily: font }}>ប្រភព: MAFF ទំព័រ {rule.source_page}</p>
          )}
        </div>
      </div>
    </Fragment>
  )
}

function AlertCard({ alert }: { alert: Alert }) {
  const phase    = getPhase(alert.category)
  const severity = SEVERITY_META[alert.severity] ?? SEVERITY_META.routine
  const cfg      = ASSET_CONFIG[alert.asset_type]
  const font     = "var(--font-inter), var(--font-kantumruy)"
  const date     = new Date(alert.scheduled_for).toLocaleDateString("km-KH", { month: "short", day: "numeric" })

  return (
    <div className="rounded-xl border border-field-stone bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${phase.bg} ${phase.text} ${phase.border}`} style={{ fontFamily: font }}>
          {phase.icon} {phase.label}
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${severity.color}`} style={{ fontFamily: font }}>
          <span className={`h-1.5 w-1.5 rounded-full ${severity.dot}`} />
          {severity.label}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#aaa]" style={{ fontFamily: font }}>
          <Clock className="h-3 w-3" /> {date} · ថ្ងៃទី {alert.day_offset}
        </span>
      </div>
      <div className="flex items-start gap-2.5">
        <span className="text-lg leading-none">{cfg?.emoji ?? "🌿"}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#111]" style={{ fontFamily: font }}>{alert.title_kh}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#666]" style={{ fontFamily: font }}>{alert.instructions_kh}</p>
        </div>
      </div>
      {alert.sent_at && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-600" style={{ fontFamily: font }}>
          <CheckCircle2 className="h-3.5 w-3.5" /> ផ្ញើទៅ Telegram ហើយ
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

type Tab = "guide" | "alerts"

export default function SchedulesPage() {
  const [tab, setTab]               = useState<Tab>("guide")
  const [activeType, setActiveType] = useState<AssetType>("chicken")
  const [rules, setRules]           = useState<Rule[]>([])
  const [alerts, setAlerts]         = useState<Alert[]>([])
  const [isLoadingRules, setIsLoadingRules]   = useState(true)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)

  const font = "var(--font-inter), var(--font-kantumruy)"

  // Load rules for selected type
  useEffect(() => {
    setIsLoadingRules(true)
    fetchRules(activeType)
      .then(setRules)
      .catch(console.error)
      .finally(() => setIsLoadingRules(false))
  }, [activeType])

  // Load today's alerts once on mount
  useEffect(() => {
    fetchAlerts({ days: 7 })
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setIsLoadingAlerts(false))
  }, [])

  const phaseDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    rules.forEach((r) => {
      const phase = getPhase(r.category)
      counts[phase.key] = (counts[phase.key] || 0) + 1
    })
    return Object.entries(counts).map(([key, count]) => ({ ...PHASES[key], count }))
  }, [rules])

  const todayAlerts = alerts.filter((a) => {
    const d = new Date(a.scheduled_for)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })

  const weekAlerts = alerts

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111]" style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}>
            កាលវិភាគថែទាំ
          </h1>
          <p className="mt-0.5 text-sm text-[#888]" style={{ fontFamily: font }}>
            មគ្គុទ្ទេសក៍ MAFF · {todayAlerts.length > 0 ? `ថ្ងៃនេះ ${todayAlerts.length} ការជូនដំណឹង` : "គ្មានការជូនដំណឹងថ្ងៃនេះ"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Alert badge on header */}
          {todayAlerts.length > 0 && (
            <button
              onClick={() => setTab("alerts")}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 cursor-pointer"
              style={{ fontFamily: font }}
            >
              <Bell className="h-3.5 w-3.5" />
              {todayAlerts.length} ការជូនដំណឹង
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-field-stone bg-white px-3 text-xs font-medium text-[#666] transition-colors hover:bg-rice-parchment hover:text-[#333] cursor-pointer"
            style={{ fontFamily: font }}
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">បោះពុម្ព</span>
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-field-stone bg-white p-1" style={{ width: "fit-content" }}>
        {([
          { key: "guide",  label: "មគ្គុទ្ទេសក៍",    icon: <BookOpen className="h-3.5 w-3.5" /> },
          { key: "alerts", label: "ការជូនដំណឹង", icon: <Bell     className="h-3.5 w-3.5" /> },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              tab === t.key
                ? "bg-canopy-deep text-white shadow-sm"
                : "text-[#666] hover:text-[#333]"
            }`}
            style={{ fontFamily: font }}
          >
            {t.icon} {t.label}
            {t.key === "alerts" && todayAlerts.length > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === "alerts" ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"}`}>
                {todayAlerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── GUIDE TAB ── */}
        {tab === "guide" && (
          <motion.div key="guide" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">

            {/* Asset type selector */}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="group" aria-label="ជ្រើសរើសប្រភេទ">
              {ASSET_TABS.map((type) => {
                const cfg = ASSET_CONFIG[type]
                const isActive = activeType === type
                return (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    aria-pressed={isActive}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                      isActive
                        ? "border-canopy-deep bg-canopy-deep/5 ring-1 ring-inset ring-canopy-deep/15"
                        : "border-field-stone bg-white hover:border-sage-mist hover:bg-rice-parchment"
                    }`}
                  >
                    <span className="text-xl leading-none">{cfg.emoji}</span>
                    <span className={`text-[11px] font-semibold ${isActive ? "text-canopy-deep" : "text-[#555]"}`} style={{ fontFamily: font }}>
                      {cfg.labelKh}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Rules info bar */}
            {!isLoadingRules && rules.length > 0 && (
              <div className="flex flex-wrap items-center gap-3" style={{ fontFamily: font }}>
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#999]">
                  {ASSET_CONFIG[activeType].labelKh} · {rules.length} ចំណុច · {ASSET_CONFIG[activeType].defaultHarvestDays} ថ្ងៃ
                </span>
                <div className="h-3 w-px bg-field-stone" />
                <div className="flex flex-wrap gap-1.5">
                  {phaseDistribution.map((phase) => (
                    <span
                      key={phase.key}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${phase.bg} ${phase.text} ${phase.border}`}
                    >
                      {phase.icon} {phase.label} <span className="tabular-nums opacity-70">{phase.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {isLoadingRules ? (
              <SkeletonTimeline />
            ) : rules.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-[#aaa]" style={{ fontFamily: font }}>
                  មិនទាន់មានវិធានសម្រាប់ {ASSET_CONFIG[activeType].labelKh} ក្នុងមូលដ្ឋានទិន្នន័យ
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeType}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
                  className="grid grid-cols-[48px_1fr] gap-x-4 sm:grid-cols-[56px_1fr] sm:gap-x-5"
                >
                  {rules.map((rule, i) => (
                    <RuleCard key={rule._id} rule={rule} index={i} total={rules.length} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* ── ALERTS TAB ── */}
        {tab === "alerts" && (
          <motion.div key="alerts" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">

            {/* Today's alerts section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>ថ្ងៃនេះ</h2>
                {todayAlerts.length > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{todayAlerts.length}</span>
                )}
              </div>

              {isLoadingAlerts ? (
                <div className="flex flex-col gap-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl border border-field-stone bg-white" />)}
                </div>
              ) : todayAlerts.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-field-stone bg-white px-5 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  <p className="text-sm text-[#555]" style={{ fontFamily: font }}>គ្មានការជូនដំណឹងថ្ងៃនេះ — ទ្រព្យសកម្មទាំងអស់ running on schedule</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayAlerts.map((a) => <AlertCard key={a._id} alert={a} />)}
                </div>
              )}
            </div>

            {/* Last 7 days section */}
            {weekAlerts.filter((a) => {
              const d = new Date(a.scheduled_for)
              const today = new Date()
              return d.toDateString() !== today.toDateString()
            }).length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>
                  ៧ ថ្ងៃចុងក្រោយ
                </h2>
                <div className="flex flex-col gap-3">
                  {weekAlerts
                    .filter((a) => new Date(a.scheduled_for).toDateString() !== new Date().toDateString())
                    .map((a) => <AlertCard key={a._id} alert={a} />)}
                </div>
              </div>
            )}

            {!isLoadingAlerts && weekAlerts.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rice-parchment">
                  <AlertTriangle className="h-5 w-5 text-[#ccc]" />
                </div>
                <p className="text-sm text-[#aaa]" style={{ fontFamily: font }}>
                  មិនទាន់មានការជូនដំណឹង ៧ ថ្ងៃចុងក្រោយ
                </p>
                <p className="text-xs text-[#bbb]" style={{ fontFamily: font }}>
                  ការជូនដំណឹងនឹងបង្ហាញនៅពេលចុះឈ្មោះហ្វូង/ដំណាំ
                </p>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
