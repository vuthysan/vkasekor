import { MongoMemoryServer } from "mongodb-memory-server"
import { MongoClient } from "mongodb"
import { connectDb, disconnectDb, collections } from "~/lib/db"

let mongo: MongoMemoryServer | null = null
let client: MongoClient | null = null

export async function setupTestDb(): Promise<void> {
  mongo = await MongoMemoryServer.create()
  await connectDb(mongo.getUri(), "smartfarm-test")

  await collections.users().createIndex({ telegram_id: 1 }, { unique: true })
  await collections.assets().createIndex({ status: 1 })
  await collections.rules().createIndex({ asset_type: 1, day_offset: 1 })
  await collections
    .alerts()
    .createIndex({ asset_id: 1, rule_id: 1, scheduled_for: 1 }, { unique: true })
  await collections.system().createIndex({ key: 1 }, { unique: true })
}

export async function teardownTestDb(): Promise<void> {
  await disconnectDb()
  if (client) await client.close()
  if (mongo) await mongo.stop()
  mongo = null
  client = null
}

export async function clearAllCollections(): Promise<void> {
  await collections.users().deleteMany({})
  await collections.assets().deleteMany({})
  await collections.rules().deleteMany({})
  await collections.alerts().deleteMany({})
  await collections.system().deleteMany({})
}
