import { connectDb, collections, disconnectDb } from "~/lib/db"
import { env } from "~/env"
import { MAFF_CHICKEN_RULES_PLACEHOLDER } from "~/seeds/maff-chicken-rules"

async function seed() {
  await connectDb(env.MONGODB_URI)

  await collections.rules().deleteMany({ asset_type: "chicken" })
  const docs = MAFF_CHICKEN_RULES_PLACEHOLDER.map((r) => ({ ...r }))
  if (docs.length > 0) await collections.rules().insertMany(docs as any)

  console.log(`seeded ${docs.length} chicken rules (PLACEHOLDER content)`)
  await disconnectDb()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
