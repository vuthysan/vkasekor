import { describe, expect, it } from "bun:test"
import { ObjectId } from "mongodb"
import { matchingRulesForAge } from "~/lib/rule-matcher"
import type { Rule } from "~/types"

function rule(day: number, category: Rule["category"] = "vaccine"): Rule {
  return {
    _id: new ObjectId(),
    asset_type: "chicken",
    day_offset: day,
    category,
    severity: "critical",
    title_kh: "x",
    title_en: "x",
    instructions_kh: "x",
    instructions_en: "x",
    source_page: 1,
  }
}

describe("matchingRulesForAge", () => {
  const rules: Rule[] = [rule(0), rule(7), rule(14, "feed"), rule(14, "vaccine"), rule(60, "harvest")]

  it("returns rules matching exact day_offset", () => {
    const out = matchingRulesForAge(rules, "chicken", 7)
    expect(out).toHaveLength(1)
    expect(out[0].day_offset).toBe(7)
  })

  it("returns multiple rules when several match the same day", () => {
    const out = matchingRulesForAge(rules, "chicken", 14)
    expect(out).toHaveLength(2)
  })

  it("returns empty array when no rule matches", () => {
    expect(matchingRulesForAge(rules, "chicken", 5)).toEqual([])
  })

  it("filters by asset type", () => {
    expect(matchingRulesForAge(rules, "cow" as any, 7)).toEqual([])
  })
})
