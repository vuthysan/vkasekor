"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { addLedgerEntry, ASSET_CONFIG, type LedgerType, type LedgerEntry, type Asset } from "~/lib/api"

interface LogEventPanelProps {
  isOpen: boolean
  onClose: () => void
  assetId: string
  assetType: Asset["type"]
  onSuccess: (entry: LedgerEntry, childAsset?: Asset) => void
}

interface FormErrors {
  type?: string
  quantity?: string
  amount?: string
  submit?: string
}

const inputClass =
  "w-full rounded-lg border-[1.5px] border-[#e5e5e0] bg-white px-3 py-2.5 text-sm text-[#333] placeholder:text-[#ccc] outline-none transition-colors hover:[border-color:rgba(22,163,74,0.55)] focus:border-[#16a34a]"

const EVENT_TYPES: { value: LedgerType; labelKh: string; emoji: string; color: string }[] = [
  { value: "expense",  labelKh: "ចំណាយ",     emoji: "💸", color: "#dc2626" },
  { value: "revenue",  labelKh: "ចំណូល",     emoji: "💰", color: "#16a34a" },
  { value: "death",    labelKh: "ស្លាប់",     emoji: "💀", color: "#6b7280" },
  { value: "sold",     labelKh: "លក់",        emoji: "🛒", color: "#2563eb" },
  { value: "born",     labelKh: "កើត/ចំណូល",  emoji: "🐣", color: "#d97706" },
]

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

export function LogEventPanel({ isOpen, onClose, assetId, assetType, onSuccess }: LogEventPanelProps) {
  const [eventType, setEventType] = useState<LedgerType | "">("")
  const [quantity, setQuantity] = useState("")
  const [amount, setAmount] = useState("")
  const [noteKh, setNoteKh] = useState("")
  const [bornDate, setBornDate] = useState(todayISO)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const cfg = ASSET_CONFIG[assetType]
  const needsQty = ["death", "sold", "born"].includes(eventType)
  const needsAmount = ["expense", "revenue"].includes(eventType)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  function reset() {
    setEventType("")
    setQuantity("")
    setAmount("")
    setNoteKh("")
    setBornDate(todayISO())
    setErrors({})
  }

  function handleClose() { reset(); onClose() }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!eventType) { errs.type = "ជ្រើសរើសប្រភេទព្រឹត្តិការណ៍។"; return errs }
    if (needsQty) {
      const qty = parseInt(quantity, 10)
      if (!quantity || isNaN(qty) || qty < 1) errs.quantity = "បរិមាណត្រូវតែ ≥ ១"
    }
    if (needsAmount) {
      const amt = parseFloat(amount)
      if (!amount || isNaN(amt) || amt < 0) errs.amount = "ចំនួនទឹកប្រាក់ត្រូវតែ ≥ $0"
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsSubmitting(true)
    try {
      const result = await addLedgerEntry({
        asset_id: assetId,
        type: eventType as LedgerType,
        quantity: needsQty ? parseInt(quantity, 10) : undefined,
        amount_usd: needsAmount ? parseFloat(amount) : undefined,
        note_kh: noteKh || undefined,
        born_arrival_date: eventType === "born" ? bornDate : undefined,
      })
      reset()
      onSuccess(result.entry, result.child_asset)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error, please try again."
      setErrors((prev) => ({ ...prev, submit: msg }))
      setIsSubmitting(false)
    }
  }

  const panelClass = isMobile
    ? "fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl bg-white"
    : "fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col bg-white"

  const panelShadow = isMobile
    ? "0 -8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
    : "-12px 0 48px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={handleClose}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            className={panelClass}
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ duration: 0.24, ease: [0, 0, 0.2, 1] }}
            style={{ boxShadow: panelShadow }}
          >
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-[#e5e5e0]" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#e5e5e0] px-6 py-5">
              <div>
                <h2 className="text-base font-bold leading-tight text-[#111]" style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}>
                  {cfg.emoji} កត់ត្រាព្រឹត្តិការណ៍
                </h2>
                <p className="mt-0.5 text-xs text-[#999]" style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}>
                  {cfg.labelKh} · {cfg.unitKh}
                </p>
              </div>
              <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#999] transition-colors hover:bg-[#f5f4f1] hover:text-[#333]">
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-1 flex-col overflow-y-auto px-6 py-7"
              style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}
            >
              <div className="flex flex-col gap-5">

                {/* Event type — pill selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                    ប្រភេទព្រឹត្តិការណ៍
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {EVENT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => { setEventType(t.value); setErrors((p) => ({ ...p, type: undefined })) }}
                        className={`flex flex-col items-center gap-1 rounded-lg border-[1.5px] px-2 py-3 text-xs font-semibold transition-all ${
                          eventType === t.value
                            ? "border-current bg-[#f0fdf4]"
                            : "border-[#e5e5e0] text-[#666] hover:border-[#ccc]"
                        }`}
                        style={{ color: eventType === t.value ? t.color : undefined }}
                      >
                        <span className="text-lg leading-none">{t.emoji}</span>
                        {t.labelKh}
                      </button>
                    ))}
                  </div>
                  {errors.type && <p className="text-xs text-[#dc2626]">{errors.type}</p>}
                </div>

                {/* Quantity (death, sold, born) */}
                {needsQty && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                      ចំនួន ({cfg.unitKh})
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => { setQuantity(e.target.value); setErrors((p) => ({ ...p, quantity: undefined })) }}
                      placeholder="ឧទាហរណ៍ 3"
                      min="1"
                      className={inputClass}
                    />
                    {errors.quantity && <p className="text-xs text-[#dc2626]">{errors.quantity}</p>}
                  </div>
                )}

                {/* Amount (expense, revenue) */}
                {needsAmount && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                      ចំនួនទឹកប្រាក់ (USD $)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: undefined })) }}
                      placeholder="ឧទាហរណ៍ 50.00"
                      min="0"
                      step="0.01"
                      className={inputClass}
                    />
                    {errors.amount && <p className="text-xs text-[#dc2626]">{errors.amount}</p>}
                  </div>
                )}

                {/* Born date (born events only) */}
                {eventType === "born" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                      ថ្ងៃកើត
                    </label>
                    <input
                      type="date"
                      value={bornDate}
                      onChange={(e) => setBornDate(e.target.value)}
                      className={inputClass}
                    />
                    <p className="text-[11px] text-[#999]">ក្រុម{cfg.labelKh}ថ្មីនឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិ ✨</p>
                  </div>
                )}

                {/* Note */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                    កំណត់ចំណាំ (ស្រេចចិត្ត)
                  </label>
                  <textarea
                    value={noteKh}
                    onChange={(e) => setNoteKh(e.target.value)}
                    placeholder="ឧ. ចំណាយថ្នាំ, ចំណូលលក់តែម្ដង..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {errors.submit && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-[#dc2626]">{errors.submit}</p>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-[#0f3d1f] py-2.5 text-sm font-semibold text-[#fafaf8] transition-colors hover:bg-[#165a2d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "កំពុងរក្សាទុក..." : "រក្សាទុកព្រឹត្តិការណ៍"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-medium text-[#666] transition-colors hover:text-[#111]"
                >
                  បោះបង់
                </button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
