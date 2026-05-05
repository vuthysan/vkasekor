import { connectDb, collections, disconnectDb } from "~/lib/db"
import { env } from "~/env"
import { MAFF_CHICKEN_RULES_PLACEHOLDER } from "~/seeds/maff-chicken-rules"
import { CUCUMBER_RULES } from "~/seeds/cucumber-rules"

async function seed() {
  await connectDb(env.MONGODB_URI)

  await collections.rules().deleteMany({})
  
  const chickenDocs = MAFF_CHICKEN_RULES_PLACEHOLDER.map((r) => ({ ...r }))
  const cucumberDocs = CUCUMBER_RULES.map((r) => ({ ...r }))
  
  const allDocs = [...chickenDocs, ...cucumberDocs]
  
  if (allDocs.length > 0) {
    await collections.rules().insertMany(allDocs as any)
  }

  console.log(`seeded ${chickenDocs.length} chicken rules`)
  console.log(`seeded ${cucumberDocs.length} cucumber rules`)
  await disconnectDb()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
