"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Users, Plus, Trash2, CheckCircle2, XCircle,
  Send, ShieldCheck, Loader2,
} from "lucide-react"
import { apiFetch } from "~/lib/api"

// ─── Types ───────────────────────────────────────────────────────────────────

interface FarmUser {
  _id: string
  telegram_id: number
  telegram_username: string
  display_name: string
  approved: boolean
  created_at: string
  last_login_at: string
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchUsers(): Promise<FarmUser[]> {
  const res = await apiFetch<{ users: FarmUser[] }>("/api/admin/users")
  return res.users
}

async function createUser(payload: {
  telegram_id: number
  telegram_username?: string
  display_name: string
  approved: boolean
}): Promise<void> {
  await apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(payload) })
}

async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function UserRow({ user, onDelete }: { user: FarmUser; onDelete: (id: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const font = "var(--font-inter), var(--font-kantumruy)"

  async function handleDelete() {
    if (!confirm(`លុប ${user.display_name} ចេញ?`)) return
    setIsDeleting(true)
    try {
      await deleteUser(user._id)
      onDelete(user._id)
    } catch {
      alert("មិនអាចលុបបាន")
    } finally {
      setIsDeleting(false)
    }
  }

  const joined = new Date(user.created_at).toLocaleDateString("km-KH", { year: "numeric", month: "short", day: "numeric" })

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="border-b border-field-stone last:border-b-0"
    >
      {/* Avatar + name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canopy-deep/10 text-sm font-bold text-canopy-deep">
            {user.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111]" style={{ fontFamily: font }}>{user.display_name}</p>
            {user.telegram_username && (
              <p className="text-[11px] text-[#aaa]">@{user.telegram_username}</p>
            )}
          </div>
        </div>
      </td>

      {/* Telegram ID */}
      <td className="px-5 py-4">
        <span className="font-mono text-xs text-[#888]">{user.telegram_id}</span>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        {user.approved ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700" style={{ fontFamily: font }}>
            <CheckCircle2 className="h-3 w-3" /> អនុម័ត
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700" style={{ fontFamily: font }}>
            <XCircle className="h-3 w-3" /> មិនទាន់
          </span>
        )}
      </td>

      {/* Joined */}
      <td className="px-5 py-4">
        <span className="text-xs text-[#888]" style={{ fontFamily: font }}>{joined}</span>
      </td>

      {/* Delete */}
      <td className="px-4 py-4 text-right">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#ccc] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 cursor-pointer"
        >
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      </td>
    </motion.tr>
  )
}

function AddUserModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ display_name: "", telegram_id: "", telegram_username: "", approved: true })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const font = "var(--font-inter), var(--font-kantumruy)"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.display_name.trim() || !form.telegram_id.trim()) {
      setError("សូមបំពេញឈ្មោះ និង Telegram ID")
      return
    }
    const telegramId = parseInt(form.telegram_id)
    if (isNaN(telegramId)) { setError("Telegram ID មិនត្រឹមត្រូវ"); return }

    setIsSubmitting(true)
    setError("")
    try {
      await createUser({ display_name: form.display_name.trim(), telegram_id: telegramId, telegram_username: form.telegram_username.trim(), approved: form.approved })
      onAdded()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? "មានបញ្ហា សូមព្យាយាមម្តងទៀត")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md rounded-2xl border border-field-stone bg-white p-6 shadow-xl"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-base font-bold text-[#111]" style={{ fontFamily: font }}>
          បន្ថែមមត្ថករថ្មី
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#999]" style={{ fontFamily: font }}>ឈ្មោះ *</label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="ឈ្មោះពេញ"
              className="h-9 rounded-lg border border-field-stone px-3 text-sm text-[#333] placeholder:text-[#ccc] outline-none focus:border-canopy-deep"
              style={{ fontFamily: font }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#999]" style={{ fontFamily: font }}>Telegram ID *</label>
            <input
              type="number"
              value={form.telegram_id}
              onChange={(e) => setForm({ ...form, telegram_id: e.target.value })}
              placeholder="123456789"
              className="h-9 rounded-lg border border-field-stone px-3 text-sm text-[#333] placeholder:text-[#ccc] outline-none focus:border-canopy-deep font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#999]" style={{ fontFamily: font }}>Username Telegram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#bbb]">@</span>
              <input
                type="text"
                value={form.telegram_username}
                onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
                placeholder="username"
                className="h-9 w-full rounded-lg border border-field-stone pl-7 pr-3 text-sm text-[#333] placeholder:text-[#ccc] outline-none focus:border-canopy-deep"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-field-stone bg-rice-parchment px-4 py-3">
            <input
              type="checkbox"
              id="approved"
              checked={form.approved}
              onChange={(e) => setForm({ ...form, approved: e.target.checked })}
              className="h-4 w-4 accent-canopy-deep"
            />
            <label htmlFor="approved" className="text-sm font-medium text-[#333] cursor-pointer" style={{ fontFamily: font }}>
              អនុម័តភ្លាម (អាចប្រើប្រាស់បានភ្លាម)
            </label>
          </div>

          {error && <p className="text-xs text-red-500" style={{ fontFamily: font }}>{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-field-stone py-2.5 text-sm font-medium text-[#555] hover:bg-field-stone transition-colors cursor-pointer" style={{ fontFamily: font }}>
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-canopy-deep py-2.5 text-sm font-semibold text-white hover:bg-[#165a2d] transition-colors disabled:opacity-60 cursor-pointer"
              style={{ fontFamily: font }}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              បន្ថែម
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [users, setUsers]         = useState<FarmUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const font = "var(--font-inter), var(--font-kantumruy)"

  const load = useCallback(async () => {
    setIsLoading(true)
    try { setUsers(await fetchUsers()) }
    catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function handleDeleted(id: string) {
    setUsers((prev) => prev.filter((u) => u._id !== id))
  }

  const approved   = users.filter((u) => u.approved).length
  const unapproved = users.filter((u) => !u.approved).length

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#111]" style={{ fontFamily: "var(--font-playfair), var(--font-kantumruy)" }}>
              ការកំណត់
            </h1>
            <p className="mt-0.5 text-sm text-[#888]" style={{ fontFamily: font }}>
              គ្រប់គ្រងអ្នកប្រើប្រាស់ និង Telegram Whitelist
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-canopy-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#165a2d] cursor-pointer"
            style={{ fontFamily: font }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">បន្ថែមមតត្ថករ</span>
            <span className="sm:hidden">បន្ថែម</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "អ្នកប្រើប្រាស់សរុប", value: users.length,  icon: <Users       className="h-4 w-4" />, bg: "bg-canopy-deep/10", color: "text-canopy-deep" },
            { label: "បានអនុម័ត",           value: approved,     icon: <ShieldCheck className="h-4 w-4" />, bg: "bg-green-50",       color: "text-green-600"  },
            { label: "មិនទាន់អនុម័ត",        value: unapproved,   icon: <Send        className="h-4 w-4" />, bg: "bg-amber-50",       color: "text-amber-600"  },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3.5 rounded-xl border border-field-stone bg-white px-4 py-3.5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#999]" style={{ fontFamily: font }}>{s.label}</p>
                <p className="tabular-nums text-xl font-bold text-[#111]">{isLoading ? "—" : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info strip */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5">
          <Send className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-700 leading-relaxed" style={{ fontFamily: font }}>
            Telegram Whitelist — មតត្ថករដែល Telegram ID ត្រូវបានបន្ថែមនឹងអាចចូលប្រើប្រព័ន្ធ។ ប្រើ Bot: @KasekorBot ដើម្បីស្នើសុំការអនុម័ត ឬ Admin អាចបន្ថែមដោយខ្លួនឯង។
          </p>
        </div>

        {/* Users table */}
        <div className="rounded-xl border border-field-stone bg-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div className="border-b border-field-stone px-5 py-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>
              បញ្ជីមតត្ថករ
            </h2>
          </div>

          {isLoading ? (
            <div className="divide-y divide-field-stone">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-field-stone" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="h-3 w-32 animate-pulse rounded bg-field-stone" />
                    <div className="h-2.5 w-20 animate-pulse rounded bg-field-stone" />
                  </div>
                  <div className="h-5 w-20 animate-pulse rounded-full bg-field-stone" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="h-8 w-8 text-[#ddd]" />
              <p className="text-sm text-[#aaa]" style={{ fontFamily: font }}>មិនទាន់មានមតត្ថករទេ</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-canopy-deep px-4 py-2 text-xs font-semibold text-white hover:bg-[#165a2d] transition-colors cursor-pointer"
                style={{ fontFamily: font }}
              >
                <Plus className="h-3.5 w-3.5" /> បន្ថែមមតត្ថករ
              </button>
            </div>
          ) : (
            <table className="w-full" style={{ fontFamily: font }}>
              <thead className="border-b border-field-stone bg-rice-parchment">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999]">ឈ្មោះ</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999]">Telegram ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999]">ស្ថានភាព</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#999]">ថ្ងៃចូល</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {users.map((u) => (
                    <UserRow key={u._id} user={u} onDelete={handleDeleted} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Farm info card */}
        <div className="rounded-xl border border-field-stone bg-white p-5" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: font }}>
            ព័ត៌មានប្រព័ន្ធ
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: "ប្រព័ន្ធ",         value: "VKasekor Farming Assistant" },
              { label: "Version",            value: "1.0.0" },
              { label: "Backend",            value: "Hono + MongoDB" },
              { label: "ស្ថានភាព API",      value: "🟢 Online" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between rounded-lg border border-field-stone bg-rice-parchment px-4 py-3">
                <span className="text-xs text-[#888]" style={{ fontFamily: font }}>{item.label}</span>
                <span className="text-xs font-semibold text-[#333]" style={{ fontFamily: font }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AddUserModal
            onClose={() => setIsModalOpen(false)}
            onAdded={load}
          />
        )}
      </AnimatePresence>
    </>
  )
}
