import type { ObjectId } from "mongodb"

export interface User {
  _id: ObjectId
  telegram_id: number
  telegram_username: string
  display_name: string
  approved: boolean
  created_at: Date
  last_login_at: Date
}

export type AssetType = "chicken" | "cucumber" | "lemon" | "cow"
export type LedgerType = "expense" | "revenue" | "death" | "sold" | "born"
export type Breed = string
export type AssetStatus = "active" | "harvested" | "archived"

export interface Asset {
  _id: ObjectId
  type: AssetType
  breed: Breed
  quantity_initial: number
  quantity_current: number
  arrival_date: Date
  expected_harvest_date: Date
  status: AssetStatus
  notes: string
  parent_asset_id?: ObjectId  // set when this batch was born from another batch
  created_by: ObjectId
  created_at: Date
  updated_at: Date
}

export type Currency = "KHR" | "USD"

export interface LedgerEntry {
  _id: ObjectId
  asset_id: ObjectId          // which batch this belongs to
  type: LedgerType
  quantity?: number           // animals affected (death, sold, born)
  // ─── Money fields ─────────────────────────────────────────────────────────
  // `currency` + `amount` is the value as the user recorded it (the source of truth).
  // `amount_khr` and `amount_usd` are denormalized at write time using the prevailing
  // FX rate so reads can sum either currency without re-converting historical entries.
  currency?: Currency         // optional for backward compat with old USD-only rows
  amount?: number             // raw value in `currency`
  amount_khr?: number         // denormalized; computed at write time
  amount_usd?: number         // denormalized; kept for back-compat with pre-currency rows
  fx_rate_khr_per_usd?: number // captured at write time
  // ──────────────────────────────────────────────────────────────────────────
  note_kh?: string            // optional Khmer note e.g. ចំណាយថ្នាំ
  child_asset_id?: ObjectId   // set when type === "born", links to new child batch
  recorded_at: Date
  created_by: ObjectId
}

export type RuleCategory = "vaccine" | "feed" | "health" | "housing" | "harvest" | "fertilizer" | "pesticide" | "irrigation" | "planting"
export type Severity = "critical" | "important" | "info"

export interface Rule {
  _id: ObjectId
  asset_type: AssetType
  day_offset: number
  category: RuleCategory
  severity: Severity
  title_kh: string
  instructions_kh: string
  source_page: number
}

export type DeliveryStatus = "pending" | "sent" | "failed"
export type AckStatus = "done" | "skipped" | "blocked"
export type AckChannel = "telegram" | "web"

export interface Alert {
  _id: ObjectId
  asset_id: ObjectId
  rule_id: ObjectId
  scheduled_for: Date
  sent_at: Date | null
  delivery_status: DeliveryStatus
  telegram_message_id: number | null
  telegram_chat_id: string | null
  error: string | null
  attempt_count: number
  ack_status: AckStatus | null
  ack_at: Date | null
  ack_note_kh: string | null
  ack_photo_file_id: string | null
  ack_via: AckChannel | null
  ack_by_chat_id: string | null
}

export interface TelegramInlineKeyboardButton {
  text: string
  callback_data: string
}

export interface TelegramInlineKeyboard {
  inline_keyboard: TelegramInlineKeyboardButton[][]
}

export interface SystemRecord {
  _id: ObjectId
  key: "last_cron_run"
  value: Date
}

export interface SessionPayload {
  user_id: string
  telegram_id?: number
}
