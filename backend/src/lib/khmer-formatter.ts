import type { Asset, Rule, Severity } from "~/types"
import { toKhmerNumerals } from "~/lib/khmer-numerals"

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
  const dayKh = toKhmerNumerals(rule.day_offset)
  const qtyKh = toKhmerNumerals(asset.quantity_current)
  const ageKh = toKhmerNumerals(rule.day_offset)
  const pageKh = toKhmerNumerals(rule.source_page)
  const badge = SEVERITY_BADGE[rule.severity]
  const prefix = catchUp ? "[ត្រួតឡើងវិញ] " : ""
  const instructions = rule.instructions_kh
    .split("\n")
    .map((line) => `• ${line}`)
    .join("\n")

  return [
    `${prefix}🐔 ថ្ងៃទី ${dayKh} — Batch #${batchLabel}`,
    "━━━━━━━━━━━━━━━━━━━━━",
    `[${badge}] ${rule.title_kh}`,
    "",
    `ចំនួនមាន់: ${qtyKh} ក្បាល`,
    `អាយុ: ${ageKh} ថ្ងៃ`,
    "",
    "📋 របៀបធ្វើ:",
    instructions,
    "",
    `📖 ប្រភព: MAFF ទំព័រ ${pageKh}`,
  ].join("\n")
}
