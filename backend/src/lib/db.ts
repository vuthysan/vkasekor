import { MongoClient, Db } from "mongodb"
import type { User, Asset, Rule, Alert, SystemRecord } from "~/types"

let client: MongoClient | null = null
let db: Db | null = null

export async function connectDb(uri: string, dbName?: string): Promise<Db> {
  if (db) return db
  client = new MongoClient(uri)
  await client.connect()
  db = client.db(dbName)
  return db
}

export async function disconnectDb(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

export function getDb(): Db {
  if (!db) throw new Error("DB not connected — call connectDb first")
  return db
}

export const collections = {
  users: () => getDb().collection<User>("users"),
  assets: () => getDb().collection<Asset>("assets"),
  rules: () => getDb().collection<Rule>("rules"),
  alerts: () => getDb().collection<Alert>("alerts"),
  system: () => getDb().collection<SystemRecord>("system"),
}
