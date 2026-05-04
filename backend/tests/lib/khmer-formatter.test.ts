import { describe, expect, it } from "bun:test"
import { ObjectId } from "mongodb"
import { formatAlertMessage } from "~/lib/khmer-formatter"
import type { Asset, Rule } from "~/types"

const asset: Asset = {
  _id: new ObjectId(),
  type: "chicken",
  breed: "broiler",
  quantity_initial: 50,
  quantity_current: 50,
  arrival_date: new Date("2026-04-27T17:00:00Z"),
  expected_harvest_date: new Date("2026-06-26T17:00:00Z"),
  status: "active",
  notes: "",
  created_by: new ObjectId(),
  created_at: new Date(),
  updated_at: new Date(),
}

const rule: Rule = {
  _id: new ObjectId(),
  asset_type: "chicken",
  day_offset: 7,
  category: "vaccine",
  severity: "critical",
  title_kh: "ចាក់វ៉ាក់សាំង Newcastle",
  title_en: "Newcastle vaccine",
  instructions_kh: "ត្រៀមវ៉ាក់សាំង Newcastle\nចាក់ដោយដក់ចូលក្នុងភ្នែក",
  instructions_en: "...",
  source_page: 12,
}

describe("formatAlertMessage", () => {
  it("renders day, batch, severity, quantity in Khmer numerals", () => {
    const out = formatAlertMessage({ asset, rule, batchLabel: "A1", catchUp: false })
    expect(out).toContain("ថ្ងៃទី ៧")
    expect(out).toContain("Batch #A1")
    expect(out).toContain("🚨 សំខាន់")
    expect(out).toContain("ចាក់វ៉ាក់សាំង Newcastle")
    expect(out).toContain("ចំនួនមាន់: ៥០ ក្បាល")
    expect(out).toContain("អាយុ: ៧ ថ្ងៃ")
    expect(out).toContain("MAFF ទំព័រ ១២")
    expect(out).not.toContain("ត្រួតឡើងវិញ")
  })

  it("adds catch-up prefix when flag is true", () => {
    const out = formatAlertMessage({ asset, rule, batchLabel: "A1", catchUp: true })
    expect(out).toContain("[ត្រួតឡើងវិញ]")
  })

  it("uses important badge for important severity", () => {
    const importantRule = { ...rule, severity: "important" as const }
    const out = formatAlertMessage({ asset, rule: importantRule, batchLabel: "A1", catchUp: false })
    expect(out).toContain("⚠️ យកចិត្តទុកដាក់")
  })

  it("uses info badge for info severity", () => {
    const infoRule = { ...rule, severity: "info" as const }
    const out = formatAlertMessage({ asset, rule: infoRule, batchLabel: "A1", catchUp: false })
    expect(out).toContain("ℹ️ ព័ត៌មាន")
  })
})
