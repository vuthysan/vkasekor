import { connectDb, collections, disconnectDb } from "~/lib/db"
import { env } from "~/env"

async function setupIndexes() {
  await connectDb(env.MONGODB_URI)

  await collections.users().createIndex({ telegram_id: 1 }, { unique: true })

  await collections.assets().createIndex({ status: 1 })
  await collections.assets().createIndex({ type: 1, status: 1 })

  await collections.rules().createIndex({ asset_type: 1, day_offset: 1 })
  // Natural key for idempotent seeding (matches src/scripts/seed-rules.ts).
  await collections.rules().createIndex(
    { asset_type: 1, day_offset: 1, title_kh: 1 },
    { unique: true },
  )

  await collections.alerts().createIndex(
    { asset_id: 1, rule_id: 1, scheduled_for: 1 },
    { unique: true },
  )
  await collections.alerts().createIndex({ delivery_status: 1, scheduled_for: 1 })
  await collections.alerts().createIndex({ ack_status: 1, scheduled_for: -1 })
  await collections.alerts().createIndex(
    { telegram_message_id: 1, telegram_chat_id: 1 },
    { sparse: true },
  )

  await collections.system().createIndex({ key: 1 }, { unique: true })

  console.log("indexes created")
  await disconnectDb()
}

setupIndexes().catch((err) => {
  console.error(err)
  process.exit(1)
})
