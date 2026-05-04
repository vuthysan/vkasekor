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

export type AssetType = "chicken"
export type Breed = "broiler" | "layer" | "local"
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
  created_by: ObjectId
  created_at: Date
  updated_at: Date
}

export type RuleCategory = "vaccine" | "feed" | "health" | "housing" | "harvest"
export type Severity = "critical" | "important" | "info"

export interface Rule {
  _id: ObjectId
  asset_type: AssetType
  day_offset: number
  category: RuleCategory
  severity: Severity
  title_kh: string
  title_en: string
  instructions_kh: string
  instructions_en: string
  source_page: number
}

export type DeliveryStatus = "pending" | "sent" | "failed"

export interface Alert {
  _id: ObjectId
  asset_id: ObjectId
  rule_id: ObjectId
  scheduled_for: Date
  sent_at: Date | null
  delivery_status: DeliveryStatus
  telegram_message_id: number | null
  error: string | null
  attempt_count: number
}

export interface SystemRecord {
  _id: ObjectId
  key: "last_cron_run"
  value: Date
}

export interface SessionPayload {
  user_id: string
  telegram_id: number
}
