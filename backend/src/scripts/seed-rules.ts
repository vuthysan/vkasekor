import { connectDb, collections, disconnectDb } from "~/lib/db"
import { env } from "~/env"
import { MAFF_CHICKEN_RULES } from "~/seeds/maff-chicken-rules"
import { CUCUMBER_RULES } from "~/seeds/cucumber-rules"
import { LEMON_RULES } from "~/seeds/lemon-rules"
import { COW_RULES } from "~/seeds/cow-rules"
import type { Rule } from "~/types"

type SeedRule = Omit<Rule, "_id">

interface SeedStats {
  added: number
  updated: number
  unchanged: number
}

function ruleEqualsExisting(seed: SeedRule, existing: Rule): boolean {
  return (
    existing.category === seed.category &&
    existing.severity === seed.severity &&
    existing.instructions_kh === seed.instructions_kh &&
    existing.source_page === seed.source_page
  )
}

async function upsertRules(label: string, rules: SeedRule[]): Promise<SeedStats> {
  const stats: SeedStats = { added: 0, updated: 0, unchanged: 0 }

  for (const rule of rules) {
    // Natural key: (asset_type, day_offset, title_kh). Two rules at the same offset
    // for the same asset must differ in title to be treated as distinct.
    const filter = {
      asset_type: rule.asset_type,
      day_offset: rule.day_offset,
      title_kh: rule.title_kh,
    }
    const existing = await collections.rules().findOne(filter)

    if (!existing) {
      await collections.rules().insertOne(rule as Rule)
      stats.added++
      continue
    }

    if (ruleEqualsExisting(rule, existing)) {
      stats.unchanged++
      continue
    }

    await collections.rules().updateOne(filter, {
      $set: {
        category: rule.category,
        severity: rule.severity,
        instructions_kh: rule.instructions_kh,
        source_page: rule.source_page,
      },
    })
    stats.updated++
  }

  console.log(
    `${label}: +${stats.added} added, ~${stats.updated} updated, =${stats.unchanged} unchanged`,
  )
  return stats
}

async function seed() {
  if (env.NODE_ENV === "production" && process.env.CONFIRM !== "yes") {
    console.error(
      "Refusing to run in production without CONFIRM=yes. " +
        "Re-run with: CONFIRM=yes bun run seed",
    )
    process.exit(1)
  }

  await connectDb(env.MONGODB_URI)

  await upsertRules("chicken", MAFF_CHICKEN_RULES)
  await upsertRules("cucumber", CUCUMBER_RULES)
  await upsertRules("lemon", LEMON_RULES)
  await upsertRules("cow", COW_RULES)

  await disconnectDb()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
