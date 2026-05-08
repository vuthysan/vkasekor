import type { AssetType } from "~/types"

export interface AssetMetadata {
  emoji: string
  labelKh: string
  unitKh: string
  // For one-shot crops/animals: days from arrival until ready to harvest.
  // For perennials (perennial: true): days until first expected fruiting/yield —
  // used only for display; the cron does NOT auto-flip perennials to harvested.
  defaultHarvestDays: number
  perennial?: boolean
}

export const ASSET_CONFIG: Record<AssetType, AssetMetadata> = {
  chicken: {
    emoji: "🐔",
    labelKh: "មាន់",
    unitKh: "ក្បាល",
    defaultHarvestDays: 60,
  },
  cucumber: {
    emoji: "🥒",
    labelKh: "ត្រសក់",
    unitKh: "រង",
    defaultHarvestDays: 45,
  },
  lemon: {
    // Perennial: defaultHarvestDays is the first-fruiting horizon (~year 2),
    // shown in the dashboard as "expected first harvest". The cron skips the
    // auto-harvest flip for perennials, so year-2/3/4 rules continue to fire.
    emoji: "🍋",
    labelKh: "ក្រូចឆ្មារ",
    unitKh: "ដើម",
    defaultHarvestDays: 720,
    perennial: true,
  },
  cow: {
    emoji: "🐄",
    labelKh: "គោ",
    unitKh: "ក្បាល",
    defaultHarvestDays: 540,
  },
}
