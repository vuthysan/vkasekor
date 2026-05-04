import type { Rule, AssetType } from "~/types"

export function matchingRulesForAge(rules: Rule[], assetType: AssetType, ageDays: number): Rule[] {
  return rules.filter((r) => r.asset_type === assetType && r.day_offset === ageDays)
}
