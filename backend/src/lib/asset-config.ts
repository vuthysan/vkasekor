import type { AssetType } from "~/types"

export interface AssetMetadata {
  emoji: string
  labelKh: string
  unitKh: string
  defaultHarvestDays: number
}

export const ASSET_CONFIG: Record<AssetType, AssetMetadata> = {
  chicken: {
    emoji: "🐔",
    labelKh: "មាន់",
    unitKh: "ក្បាល",
    defaultHarvestDays: 60,
  },
  pig: {
    emoji: "🐖",
    labelKh: "ជ្រូក",
    unitKh: "ក្បាល",
    defaultHarvestDays: 180,
  },
  duck: {
    emoji: "🦆",
    labelKh: "ទា",
    unitKh: "ក្បាល",
    defaultHarvestDays: 75,
  },
  cucumber: {
    emoji: "🥒",
    labelKh: "ត្រសក់",
    unitKh: "រង",
    defaultHarvestDays: 45,
  },
  cabbage: {
    emoji: "🥬",
    labelKh: "ស្ពៃក្តោប",
    unitKh: "ដើម",
    defaultHarvestDays: 70,
  },
  tomato: {
    emoji: "🍅",
    labelKh: "ប៉េងប៉ោះ",
    unitKh: "ដើម",
    defaultHarvestDays: 80,
  },
}
