"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Bird, PawPrint, Leaf, Sparkles, Syringe, Wheat,
  Shield, Eye, Scissors, Printer,
} from "lucide-react"

type AssetType = "Chicken" | "Pig" | "Cucumber"

interface Rule {
  day: number
  title: string
  description: string
}

const scheduleData: Record<AssetType, Rule[]> = {
  Chicken: [
    {
      day: 0,
      title: "រៀបចំបរិស្ថាន",
      description: "សម្អាតនិងសម្លាប់មេរោគក្នុងទ្រុង។ ដំឡើងអំពូលកម្តៅ (៣៥°C)។ ចាក់ចំណីសម្រាប់កូនមាន់ (ប្រូតេអ៊ីនខ្ពស់ ២២%)។ ត្រូវប្រាកដថាមានកម្រាលទ្រុងស្ងួតល្អ។",
    },
    {
      day: 7,
      title: "ចាក់វ៉ាក់សាំងជំងឺញូវកាស",
      description: "ផ្តល់វ៉ាក់សាំងញូវកាសប្រភេទ F តាមរយៈទឹកផឹក។ ដកទឹកចេញ ២ ម៉ោងមុនពេលផ្តល់វ៉ាក់សាំង។ តាមដានអាកប្បកិរិយាហ្វូងមាន់រយៈពេល ២៤ ម៉ោងក្រោយចាក់វ៉ាក់សាំង។",
    },
    {
      day: 14,
      title: "ចាក់វ៉ាក់សាំងជំងឺកំប៉ូរ៉ូ",
      description: "ផ្តល់វ៉ាក់សាំង IBD តាមរយៈទឹកផឹក។ បន្ថយកម្តៅអំពូល ២°C។ ចាប់ផ្តើមតាមដានការស៊ីចំណី។",
    },
    {
      day: 21,
      title: "ប្តូរទៅចំណីមាន់ជំទង់",
      description: "ប្តូរពីចំណីកូនមាន់ (ប្រូតេអ៊ីន ២២%) ទៅចំណីមាន់ជំទង់ (ប្រូតេអ៊ីន ១៨%, ថាមពលខ្ពស់)។ បន្ថយកម្តៅអំពូលថែមទៀត។ ទីធ្លាគឺសំខាន់ណាស់នៅពេលនេះ - ពិនិត្យមើលភាពចង្អៀត។",
    },
    {
      day: 28,
      title: "ទម្លាក់សត្វល្អិតនិងការគ្រប់គ្រងកម្រាល",
      description: "ផ្តល់ថ្នាំទម្លាក់សត្វល្អិតតាមរយៈទឹកផឹកប្រសិនបើចាំបាច់។ កកាយនិងបង្វិលកម្រាលដើម្បីបន្ថយឧស្ម័នអាម៉ូញ៉ាក់។ ពិនិត្យប្រព័ន្ធខ្យល់ចេញចូល។",
    },
    {
      day: 45,
      title: "ពិនិត្យទម្ងន់មុនពេលប្រមូលផល",
      description: "ថ្លឹងទម្ងន់ ៥% នៃហ្វូងមាន់។ គោលដៅទម្ងន់រស់: ២.០-២.៣ គីឡូក្រាម។ កែសម្រួលចំណីប្រសិនបើទម្ងន់មិនដល់គោលដៅ។ បញ្ជាក់ការកក់សម្រាប់កាប់សាច់។",
    },
    {
      day: 60,
      title: "ប្រមូលផល",
      description: "ផ្អាកចំណី ៨-១២ ម៉ោងមុនពេលកាប់សាច់ដើម្បីសម្អាតពោះវៀន។ ចាប់មាន់នៅពេលយប់ដើម្បីកាត់បន្ថយភាពតានតឹង។ កត់ត្រាទម្ងន់ចុងក្រោយនិងចំនួនងាប់។",
    },
  ],
  Pig: [
    {
      day: 0,
      title: "ការរៀបចំសម្រាលកូន",
      description: "រៀបចំទ្រុងសម្រាលជាមួយកម្រាលស្អាត។ បញ្ជាក់ពីស្ថានភាពរាងកាយមេជ្រូក (២.៥-៣.៥)។ រៀបចំជាតិដែក, ថ្នាំសម្លាប់មេរោគ, និងអំពូលកម្តៅឲ្យរួចរាល់។",
    },
    {
      day: 3,
      title: "ចាក់ថ្នាំជាតិដែក",
      description: "ចាក់ជាតិដែក ២០០ មីលីក្រាម ទៅក្នុងសាច់ដុំកកូនជ្រូកនីមួយៗ។ កត់ត្រាទម្ងន់ពេលកើតនិងចំនួនកូនសរុប។",
    },
    {
      day: 7,
      title: "ចាក់វ៉ាក់សាំងលើកទី១",
      description: "ផ្តល់វ៉ាក់សាំង Mycoplasma hyopneumoniae។ កាត់ធ្មេញប្រសិនបើមានការខាំគ្នា។ តាមដានការបៅដោះ។",
    },
    {
      day: 21,
      title: "ផ្តាច់ដោះ",
      description: "បំបែកកូនជ្រូកពីមេនៅអាយុ ២១ ថ្ងៃ។ ប្តូរទៅទ្រុងផ្តាច់ដោះ (៣០°C)។ ចាប់ផ្តើមប្តូរទៅចំណីគ្រាប់ស្ងួតសម្រាប់កូនជ្រូក។ តាមដានជំងឺរាគរូសក្រោយផ្តាច់ដោះ។",
    },
    {
      day: 28,
      title: "ដំណាក់កាលចំណីចាប់ផ្តើម",
      description: "ផ្តល់ចំណីដែលងាយរំលាយ (ប្រូតេអ៊ីន ២១%, លីស៊ីន ១.៥%)។ បន្ថយកម្តៅបន្តិចម្តងៗមក ២៦°C។ តាមដានការឡើងទម្ងន់ប្រចាំថ្ងៃ។",
    },
    {
      day: 60,
      title: "ការប្តូរទៅចំណីជ្រូកសាច់",
      description: "ប្តូរទៅចំណីជ្រូកសាច់ (ប្រូតេអ៊ីន ១៨%)។ គោលដៅទម្ងន់: ២៥-៣០ គីឡូក្រាម។ បញ្ជាក់ពីស្ថានភាពវ៉ាក់សាំង។ កែសម្រួលទំហំហ្វូងបើមានការខាំគ្នា។",
    },
    {
      day: 90,
      title: "ការប្តូរទៅចំណីបំប៉ន",
      description: "ប្តូរទៅចំណីបំប៉នចុងក្រោយ (ប្រូតេអ៊ីន ១៦%, ថាមពលខ្ពស់)។ គោលដៅឡើងទម្ងន់ ៩០០ ក្រាមក្នុងមួយថ្ងៃ។",
    },
    {
      day: 180,
      title: "ប្រមូលផល",
      description: "គោលដៅទម្ងន់: ៩០-១០០ គីឡូក្រាម។ ផ្អាកចំណី ១២ ម៉ោងមុនពេលដឹកជញ្ជូន។ កត់ត្រាលទ្ធផលចុងក្រោយ: អត្រាស៊ីចំណី, ការឡើងទម្ងន់, និងចំនួនងាប់។",
    },
  ],
  Cucumber: [
    {
      day: 0,
      title: "ការរៀបចំដីនិងការសាបព្រោះ",
      description: "រៀបចំរងដីជាមួយនឹងល្បាយ ដី-ខ្សាច់-កំប៉ុស ៤០:៣០:៣០។ សាបគ្រាប់ ២ គ្រាប់ក្នុងមួយរណ្តៅ ជម្រៅ ១.៥ ស.ម ចន្លោះពីគ្នា ៣០ ស.ម។ ស្រោចទឹកថ្នមៗដើម្បីកុំឱ្យខ្ទាតគ្រាប់។",
    },
    {
      day: 5,
      title: "ការពិនិត្យការដុះពន្លក",
      description: "ពិនិត្យមើលការដុះពន្លកនៅគ្រប់រង។ ដកចេញទុកតែ ១ ដើមក្នុងមួយរណ្តៅបើដុះទាំង ២។ រក្សាសំណើមដី។ អាចត្រូវការស្បៃបាំងថ្ងៃបើក្តៅខ្លាំង។",
    },
    {
      day: 10,
      title: "ការដាក់ជីទឹកលើកទី១",
      description: "ប្រើជីអាសូតរាវ (NPK ២០-២០-២០ ក្នុងកម្រិត ២ក្រាម/លីត្រ)។ ស្រោចទឹកនៅពេលព្រឹក។ ពិនិត្យមើលពីក្រោមស្លឹកក្រែងមានសត្វល្អិតចង្រៃ។",
    },
    {
      day: 18,
      title: "ការចងទម្រនិងវល្លិ",
      description: "ចងវល្លិមេទៅនឹងទម្រឬទ្រើង។ កាត់ខ្នែងចោលត្រង់ថ្នាំងទី៥ចុះក្រោម ដើម្បីឱ្យដើមមេលូតលាស់ល្អ។ ចងឱ្យរលុងៗ។",
    },
    {
      day: 25,
      title: "ការចេញផ្កានិងការបង្កាត់ម្សៅ",
      description: "ផ្កាញីដំបូងចាប់ផ្តើមចេញ។ បើគ្មានសត្វល្អិតបង្កាត់ម្សៅ ត្រូវបង្កាត់ដោយដៃនៅពេលព្រឹកដោយប្រើផ្កាឈ្មោល។ បន្ថែមប៉ូតាស្យូមនៅដំណាក់កាលនេះ (០-០-៥០ កម្រិត ៣ក្រាម/លីត្រ)។",
    },
    {
      day: 33,
      title: "ការពិនិត្យសត្វល្អិតនិងជំងឺ",
      description: "ពិនិត្យមើលជំងឺផ្សិតនៅលើនិងក្រោមស្លឹក។ ប្រើប្រាស់ថ្នាំកម្ចាត់ផ្សិតមានជាតិទង់ដែងជាការការពារប្រសិនបើសំណើមលើសពី ៨០%។",
    },
    {
      day: 40,
      title: "ការពិនិត្យគុណភាពមុនប្រមូលផល",
      description: "ពិនិត្យប្រវែងនិងទំហំផ្លែ។ ទំហំគោលដៅ: ១៥-២០ ស.ម។ ពិនិត្យមើលផ្លែទុំលឿង (សញ្ញាចាស់ពេក)។ បញ្ជាក់ការបញ្ជាទិញឬផែនការប្រមូលផល។",
    },
    {
      day: 45,
      title: "ប្រមូលផល",
      description: "ប្រមូលផលរៀងរាល់ ២-៣ ថ្ងៃម្តងនៅពេលផ្លែដំបូងដល់ទំហំគោលដៅ។ ប្រើកាំបិតស្អាត។ កុំទុកផ្លែចាស់ពេកលើដើមព្រោះវាធ្វើឱ្យរុក្ខជាតិឈប់បង្កើតផ្លែថ្មី។",
    },
  ],
}

interface AssetMeta {
  key: AssetType
  label: string
  unit: string
  icon: ReactNode
  iconBg: string
  iconColor: string
}

const ASSET_META: AssetMeta[] = [
  { key: "Chicken",  label: "មាន់",   unit: "វដ្ត ៦០ ថ្ងៃ",  icon: <Bird     className="h-4 w-4" />, iconBg: "bg-amber-50",   iconColor: "text-amber-700"   },
  { key: "Pig",      label: "ជ្រូក",  unit: "វដ្ត ១៨០ ថ្ងៃ", icon: <PawPrint className="h-4 w-4" />, iconBg: "bg-pink-50",    iconColor: "text-pink-700"    },
  { key: "Cucumber", label: "ត្រសក់", unit: "វដ្ត ៤៥ ថ្ងៃ",  icon: <Leaf     className="h-4 w-4" />, iconBg: "bg-emerald-50", iconColor: "text-emerald-700" },
]

interface Phase {
  key: string
  label: string
  bg: string
  text: string
  border: string
  marker: string
  icon: ReactNode
}

const PHASES: Record<string, Phase> = {
  setup:      { key: "setup",      label: "រៀបចំ",   bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",   marker: "bg-slate-100",   icon: <Sparkles className="h-3 w-3" /> },
  health:     { key: "health",     label: "សុខភាព",  bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  marker: "bg-purple-100",  icon: <Syringe  className="h-3 w-3" /> },
  feeding:    { key: "feeding",    label: "ចំណី",    bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", marker: "bg-emerald-100", icon: <Wheat    className="h-3 w-3" /> },
  protection: { key: "protection", label: "ការពារ",  bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     marker: "bg-red-100",     icon: <Shield   className="h-3 w-3" /> },
  care:       { key: "care",       label: "ថែទាំ",   bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     marker: "bg-sky-100",     icon: <Eye      className="h-3 w-3" /> },
  harvest:    { key: "harvest",    label: "ប្រមូលផល", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   marker: "bg-amber-100",   icon: <Scissors className="h-3 w-3" /> },
}

function getPhase(title: string): Phase {
  if (title.trim() === "ប្រមូលផល") return PHASES.harvest
  if (/រៀបចំ|សាបព្រោះ|សម្រាល/.test(title)) return PHASES.setup
  if (/វ៉ាក់សាំង|ជាតិដែក|ផ្តាច់ដោះ/.test(title)) return PHASES.health
  if (/សត្វល្អិត|ទម្លាក់សត្វ|ផ្សិត/.test(title)) return PHASES.protection
  if (/ចំណី|ដាក់ជី|បំប៉ន/.test(title)) return PHASES.feeding
  return PHASES.care
}

export default function SchedulesPage() {
  const [active, setActive]       = useState<AssetType>("Chicken")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const rules = scheduleData[active]
  const meta  = ASSET_META.find((a) => a.key === active)!

  const phaseDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    rules.forEach((rule) => {
      const phase = getPhase(rule.title)
      counts[phase.key] = (counts[phase.key] || 0) + 1
    })
    return Object.entries(counts).map(([key, count]) => ({ ...PHASES[key], count }))
  }, [rules])

  const font = "var(--font-inter), var(--font-kantumruy)"

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold tracking-tight text-[#111]"
            style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}
          >
            កាលវិភាគថែទាំ
          </h1>
          <p className="mt-0.5 text-sm text-[#888]" style={{ fontFamily: font }}>
            មគ្គុទ្ទេសក៍ MAFF តាមប្រភេទទ្រព្យសកម្ម
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-field-stone bg-white px-3 text-xs font-medium text-[#666] transition-colors hover:bg-rice-parchment hover:text-[#333] cursor-pointer"
          style={{ fontFamily: font }}
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">បោះពុម្ព</span>
        </button>
      </div>

      {/* ── Asset type selector cards ── */}
      <div
        className="grid grid-cols-3 gap-3"
        role="group"
        aria-label="ជ្រើសរើសប្រភេទទ្រព្យសកម្ម"
      >
        {ASSET_META.map((type) => {
          const isActive = active === type.key
          const checkpointCount = scheduleData[type.key].length
          return (
            <button
              key={type.key}
              onClick={() => setActive(type.key)}
              aria-pressed={isActive}
              className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-green ${
                isActive
                  ? "border-canopy-deep bg-canopy-deep/5 ring-1 ring-inset ring-canopy-deep/15"
                  : "border-field-stone bg-white hover:border-sage-mist hover:bg-rice-parchment"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${type.iconBg}`}>
                  <span className={type.iconColor}>{type.icon}</span>
                </span>
                <span
                  className={`text-sm font-semibold ${isActive ? "text-canopy-deep" : "text-[#111]"}`}
                  style={{ fontFamily: font }}
                >
                  {type.label}
                </span>
              </div>
              <div className="text-[11px] text-[#888]" style={{ fontFamily: font }}>
                {type.unit} · <span className="tabular-nums">{checkpointCount}</span> ចំណុច
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Phase legend ── */}
      {!isLoading && (
        <motion.div
          key={`legend-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap items-center gap-2"
          style={{ fontFamily: font }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#999]">
            វគ្គ៖
          </span>
          {phaseDistribution.map((phase) => (
            <span
              key={phase.key}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${phase.bg} ${phase.text} ${phase.border}`}
            >
              {phase.icon}
              {phase.label}
              <span className="tabular-nums opacity-70">{phase.count}</span>
            </span>
          ))}
        </motion.div>
      )}

      {/* ── Timeline ── */}
      {isLoading ? (
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
                    <div className="h-4 w-48 animate-pulse rounded bg-field-stone" />
                    <div className="h-3 w-full animate-pulse rounded bg-field-stone" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-field-stone" />
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            className="grid grid-cols-[48px_1fr] gap-x-4 sm:grid-cols-[56px_1fr] sm:gap-x-5"
          >
            {rules.map((rule, i) => {
              const phase   = getPhase(rule.title)
              const isFirst = i === 0
              const isLast  = i === rules.length - 1
              const showLine = rules.length > 1
              return (
                <Fragment key={i}>
                  {/* Marker column */}
                  <div className="relative flex justify-center pb-7">
                    {/* Vertical line */}
                    {showLine && (
                      <div
                        className={`absolute left-1/2 w-px -translate-x-1/2 bg-field-stone ${
                          isFirst ? "top-5 bottom-0" :
                          isLast  ? "top-0 h-5" :
                          "inset-y-0"
                        }`}
                      />
                    )}
                    {/* Day marker */}
                    <div
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${phase.marker} ${phase.border}`}
                      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                    >
                      <span
                        className={`tabular-nums text-xs font-bold leading-none ${phase.text}`}
                        style={{ fontFamily: font }}
                      >
                        {rule.day}
                      </span>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="pb-7">
                    <div className="rounded-xl border border-field-stone bg-white p-4 transition-shadow hover:shadow-sm">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${phase.bg} ${phase.text} ${phase.border}`}
                          style={{ fontFamily: font }}
                        >
                          {phase.icon}
                          {phase.label}
                        </span>
                        <span
                          className="text-[10px] font-medium uppercase tracking-wider text-[#aaa]"
                          style={{ fontFamily: font }}
                        >
                          <span className="tabular-nums">{i + 1}</span> នៃ <span className="tabular-nums">{rules.length}</span>
                        </span>
                      </div>
                      <h3
                        className="text-sm font-semibold leading-snug text-[#111]"
                        style={{ fontFamily: font }}
                      >
                        {rule.title}
                      </h3>
                      <p
                        className="mt-1.5 text-[13px] leading-relaxed text-[#666]"
                        style={{ fontFamily: font, maxWidth: "62ch" }}
                      >
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </Fragment>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
