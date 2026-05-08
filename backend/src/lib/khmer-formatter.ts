import type { AckStatus, Asset, Rule, Severity, TelegramInlineKeyboard } from "~/types"
import { toKhmerNumerals } from "~/lib/khmer-numerals"
import { ASSET_CONFIG } from "~/lib/asset-config"

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "🚨 សំខាន់",
  important: "⚠️ យកចិត្តទុកដាក់",
  info: "ℹ️ ព័ត៌មាន",
}

interface FormatArgs {
  asset: Asset
  rule: Rule
  batchLabel: string
  catchUp: boolean
}

export function formatAlertMessage({ asset, rule, batchLabel, catchUp }: FormatArgs): string {
  const config = ASSET_CONFIG[asset.type]
  const dayKh = toKhmerNumerals(rule.day_offset)
  const qtyKh = toKhmerNumerals(asset.quantity_current)
  const ageKh = toKhmerNumerals(rule.day_offset)
  const pageKh = toKhmerNumerals(rule.source_page)
  const badge = SEVERITY_BADGE[rule.severity]
  const prefix = catchUp ? "[ត្រួតឡើងវិញ] " : ""
  const instructions = rule.instructions_kh
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => `• ${line}`)
    .join("\n")

  return [
    `${prefix}${config.emoji} ថ្ងៃទី ${dayKh} — Batch #${batchLabel}`,
    "━━━━━━━━━━━━━━━━━━━━━",
    `[${badge}] ${rule.title_kh}`,
    "",
    `ចំនួន${config.labelKh}: ${qtyKh} ${config.unitKh}`,
    `អាយុ: ${ageKh} ថ្ងៃ`,
    "",
    "📋 របៀបធ្វើ:",
    instructions,
    "",
    `📖 ប្រភព: MAFF ទំព័រ ${pageKh}`,
  ].join("\n")
}

export function buildAckKeyboard(alertId: string): TelegramInlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "✅ ធ្វើរួច", callback_data: `ack:done:${alertId}` },
        { text: "⏭️ រំលង", callback_data: `ack:skipped:${alertId}` },
        { text: "❓ ត្រូវការជំនួយ", callback_data: `ack:blocked:${alertId}` },
      ],
    ],
  }
}

const ACK_BADGE: Record<AckStatus, string> = {
  done: "✅ ធ្វើរួច",
  skipped: "⏭️ រំលង",
  blocked: "❓ ត្រូវការជំនួយ",
}

export function formatAckedMessage(originalText: string, status: AckStatus, ackedAt: Date): string {
  // Phnom Penh is UTC+7, no DST.
  const hh = (ackedAt.getUTCHours() + 7) % 24
  const mm = ackedAt.getUTCMinutes()
  const timeKh = `${toKhmerNumerals(hh).padStart(2, "០")}:${toKhmerNumerals(mm).padStart(2, "០")}`
  return `${originalText}\n━━━━━━━━━━━━━━━━━━━━━\n${ACK_BADGE[status]} — ${timeKh}`
}
