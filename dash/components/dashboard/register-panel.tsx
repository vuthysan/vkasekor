"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { createAsset, ASSET_CONFIG, type Asset, type AssetType } from "~/lib/api"

export type { Asset }

export interface AssetBatch {
  id: string
  batchName: string
  assetType: string
  quantity: number
  status: "Healthy" | "At Risk" | "Harvesting"
  registeredAt: string
  _raw?: Asset
}

interface RegisterPanelProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (batch: AssetBatch) => void
}

interface FormErrors {
  batchName?: string
  assetType?: string
  breed?: string
  quantity?: string
  arrivalDate?: string
  submit?: string
}

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

const inputClass =
  "w-full rounded-lg border-[1.5px] border-[#e5e5e0] bg-white px-3 py-2.5 text-sm text-[#333] placeholder:text-[#ccc] outline-none transition-colors hover:[border-color:rgba(22,163,74,0.55)] focus:border-[#16a34a]"

const ASSET_TYPES = Object.entries(ASSET_CONFIG).map(([type, meta]) => ({
  value: type as AssetType,
  label: `${meta.emoji} ${meta.labelKh}`,
}))

const BREED_OPTIONS: Record<AssetType, string[]> = {
  chicken:  ["broiler", "layer", "local"],
  cucumber: ["chinese", "japanese", "local"],
  lemon:    ["eureka", "lisbon", "local"],
  cow:      ["local", "brahman", "angus"],
}

export function RegisterPanel({ isOpen, onClose, onSuccess }: RegisterPanelProps) {
  const [batchName, setBatchName] = useState("")
  const [assetType, setAssetType] = useState<AssetType | "">("")
  const [breed, setBreed] = useState("")
  const [quantity, setQuantity] = useState("")
  const [arrivalDate, setArrivalDate] = useState(todayISO)
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  // Reset breed when asset type changes
  useEffect(() => { setBreed("") }, [assetType])

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!batchName.trim() || batchName.trim().length < 2)
      errs.batchName = "ទាមទារយ៉ាងហោចណាស់ ២ តួអក្សរ។"
    if (!assetType) errs.assetType = "ជ្រើសរើសប្រភេទទ្រព្យសកម្ម។"
    if (!breed) errs.breed = "ជ្រើសរើសពូជ/ប្រភេទ។"
    const qty = parseInt(quantity, 10)
    if (!quantity || isNaN(qty) || qty < 1) errs.quantity = "បញ្ចូលបរិមាណចាប់ពី ១ ឡើងទៅ។"
    if (!arrivalDate) errs.arrivalDate = "ជ្រើសរើសថ្ងៃមកដល់។"
    return errs
  }

  function resetForm() {
    setBatchName("")
    setAssetType("")
    setBreed("")
    setQuantity("")
    setArrivalDate(todayISO())
    setNotes("")
    setErrors({})
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsSubmitting(true)
    try {
      const asset = await createAsset({
        type: assetType as AssetType,
        breed,
        quantity_initial: parseInt(quantity, 10),
        arrival_date: arrivalDate,
        notes: notes || batchName.trim(),
      })

      const cfg = ASSET_CONFIG[asset.type]
      const batch: AssetBatch = {
        id: asset._id,
        batchName: asset.notes || batchName.trim(),
        assetType: asset.type,
        quantity: asset.quantity_initial,
        status: "Healthy",
        registeredAt: asset.arrival_date.split("T")[0],
        _raw: asset,
      }
      resetForm()
      onSuccess(batch)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error, please try again."
      setErrors((prev) => ({ ...prev, submit: msg }))
      setIsSubmitting(false)
    }
  }

  const panelClass = isMobile
    ? "fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl bg-white"
    : "fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-white"

  const panelShadow = isMobile
    ? "0 -8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
    : "-12px 0 48px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)"

  const initial = isMobile ? { y: "100%" } : { x: "100%" }
  const animate = isMobile ? { y: 0 } : { x: 0 }
  const exit = isMobile ? { y: "100%" } : { x: "100%" }

  const breedOptions = assetType ? BREED_OPTIONS[assetType] : []

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
            aria-label="ចុះឈ្មោះហ្វូង/ដំណាំថ្មី"
            className={panelClass}
            initial={initial}
            animate={animate}
            exit={exit}
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
                <h2
                  className="text-base font-bold leading-tight text-[#111]"
                  style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}
                >
                  ចុះឈ្មោះហ្វូង/ដំណាំ
                </h2>
                <p className="mt-0.5 text-xs text-[#999]" style={{ fontFamily: "var(--font-inter), var(--font-kantumruy)" }}>
                  ហ្វូង/ដំណាំថ្មីត្រូវបានបន្ថែមទៅការតាមដានសកម្ម
                </p>
              </div>
              <button
                onClick={handleClose}
                aria-label="បិទផ្ទាំង"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#999] transition-colors hover:bg-[#f5f4f1] hover:text-[#333]"
              >
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

                {/* Batch name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-batch-name" className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                    ឈ្មោះហ្វូង/ដំណាំ
                  </label>
                  <input
                    id="reg-batch-name"
                    type="text"
                    value={batchName}
                    onChange={(e) => { setBatchName(e.target.value); clearError("batchName") }}
                    placeholder="ឧទាហរណ៍ ហ្វូងមាន់សាច់ A"
                    className={inputClass}
                  />
                  {errors.batchName && <p className="text-xs text-[#dc2626]">{errors.batchName}</p>}
                </div>

                {/* Asset type */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-asset-type" className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                    ប្រភេទទ្រព្យសកម្ម
                  </label>
                  <div className="relative">
                    <select
                      id="reg-asset-type"
                      value={assetType}
                      onChange={(e) => { setAssetType(e.target.value as AssetType); clearError("assetType") }}
                      className={`${inputClass} cursor-pointer appearance-none pr-9`}
                    >
                      <option value="" disabled>ជ្រើសរើសប្រភេទ...</option>
                      {ASSET_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {errors.assetType && <p className="text-xs text-[#dc2626]">{errors.assetType}</p>}
                </div>

                {/* Breed (shown once asset type is selected) */}
                {assetType && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-breed" className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                      ពូជ/ប្រភេទ
                    </label>
                    <div className="relative">
                      <select
                        id="reg-breed"
                        value={breed}
                        onChange={(e) => { setBreed(e.target.value); clearError("breed") }}
                        className={`${inputClass} cursor-pointer appearance-none pr-9`}
                      >
                        <option value="" disabled>ជ្រើសរើសពូជ...</option>
                        {breedOptions.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    {errors.breed && <p className="text-xs text-[#dc2626]">{errors.breed}</p>}
                  </div>
                )}

                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-quantity" className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                    បរិមាណ {assetType ? `(${ASSET_CONFIG[assetType].unitKh})` : ""}
                  </label>
                  <input
                    id="reg-quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); clearError("quantity") }}
                    placeholder="ឧទាហរណ៍ 20"
                    min="1"
                    className={inputClass}
                  />
                  {errors.quantity && <p className="text-xs text-[#dc2626]">{errors.quantity}</p>}
                </div>

                {/* Arrival date */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-arrival-date" className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                    ថ្ងៃមកដល់/ថ្ងៃដាំ
                  </label>
                  <input
                    id="reg-arrival-date"
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => { setArrivalDate(e.target.value); clearError("arrivalDate") }}
                    className={inputClass}
                  />
                  {errors.arrivalDate && <p className="text-xs text-[#dc2626]">{errors.arrivalDate}</p>}
                </div>

                {/* Notes (optional) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-notes" className="text-[11px] font-semibold uppercase text-[#666]" style={{ letterSpacing: "0.08em" }}>
                    កំណត់ចំណាំ (ស្រេចចិត្ត)
                  </label>
                  <textarea
                    id="reg-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ព័ត៌មានបន្ថែម..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {errors.submit && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-[#dc2626]">{errors.submit}</p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2 pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-[#0f3d1f] py-2.5 text-sm font-semibold text-[#fafaf8] transition-colors hover:bg-[#165a2d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "កំពុងចុះឈ្មោះ..." : "ចុះឈ្មោះហ្វូង/ដំណាំ"}
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
