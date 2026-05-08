import { describe, expect, it, beforeAll, afterAll, beforeEach, mock } from "bun:test"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { runDailyCheck } from "~/cron/daily-check"
import { startOfDayInPhnomPenh, addDays } from "~/lib/lifecycle"

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => {
  await clearAllCollections()
  globalThis.fetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 }),
  ) as any
})

async function seedRules() {
  await collections.rules().insertMany([
    {
      _id: new ObjectId(),
      asset_type: "chicken",
      day_offset: 7,
      category: "vaccine",
      severity: "critical",
      title_kh: "ND",
      title_en: "ND",
      instructions_kh: "x",
      instructions_en: "x",
      source_page: 1,
    },
    {
      _id: new ObjectId(),
      asset_type: "chicken",
      day_offset: 14,
      category: "feed",
      severity: "important",
      title_kh: "Switch",
      title_en: "Switch",
      instructions_kh: "x",
      instructions_en: "x",
      source_page: 1,
    },
  ])
}

async function seedAsset(arrivalDaysAgo: number) {
  const _id = new ObjectId()
  const arrival = startOfDayInPhnomPenh(addDays(new Date(), -arrivalDaysAgo))
  await collections.assets().insertOne({
    _id,
    type: "chicken",
    breed: "broiler",
    quantity_initial: 50,
    quantity_current: 50,
    arrival_date: arrival,
    expected_harvest_date: addDays(arrival, 60),
    status: "active",
    notes: "",
    created_by: new ObjectId(),
    created_at: new Date(),
    updated_at: new Date(),
  })
  return _id
}

describe("runDailyCheck", () => {
  it("sends one alert for an asset that hits day 7 today", async () => {
    await seedRules()
    await seedAsset(7)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts).toHaveLength(1)
    expect(alerts[0].delivery_status).toBe("sent")
  })

  it("is idempotent — running twice on same day sends only once", async () => {
    await seedRules()
    await seedAsset(7)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts).toHaveLength(1)
  })

  it("sends two separate alerts when two rules match the same day", async () => {
    await collections.rules().insertMany([
      {
        _id: new ObjectId(),
        asset_type: "chicken",
        day_offset: 14,
        category: "feed",
        severity: "important",
        title_kh: "A",
        title_en: "A",
        instructions_kh: "x",
        instructions_en: "x",
        source_page: 1,
      },
      {
        _id: new ObjectId(),
        asset_type: "chicken",
        day_offset: 14,
        category: "vaccine",
        severity: "critical",
        title_kh: "B",
        title_en: "B",
        instructions_kh: "x",
        instructions_en: "x",
        source_page: 1,
      },
    ])
    await seedAsset(14)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts).toHaveLength(2)
  })

  it("auto-harvests assets at day 60", async () => {
    await seedRules()
    const id = await seedAsset(60)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const after = await collections.assets().findOne({ _id: id })
    expect(after?.status).toBe("harvested")
  })

  it("does NOT auto-harvest perennials (lemon) past defaultHarvestDays", async () => {
    const _id = new ObjectId()
    const arrival = startOfDayInPhnomPenh(addDays(new Date(), -800)) // > 720 (lemon's first-fruit horizon)
    await collections.assets().insertOne({
      _id,
      type: "lemon",
      breed: "eureka",
      quantity_initial: 10,
      quantity_current: 10,
      arrival_date: arrival,
      expected_harvest_date: addDays(arrival, 720),
      status: "active",
      notes: "",
      created_by: new ObjectId(),
      created_at: new Date(),
      updated_at: new Date(),
    })
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const after = await collections.assets().findOne({ _id })
    expect(after?.status).toBe("active")
  })

  it("marks alert failed when telegram returns ok:false", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: false, description: "blocked" }), { status: 400 }),
    ) as any
    await seedRules()
    await seedAsset(7)
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    const alerts = await collections.alerts().find({}).toArray()
    expect(alerts[0].delivery_status).toBe("failed")
    expect(alerts[0].error).toContain("blocked")
  })

  it("processes catch-up days when last_cron_run is older than today", async () => {
    await seedRules()
    const id = await seedAsset(7)
    // Make it look like cron last ran 2 days ago.
    const yesterday = startOfDayInPhnomPenh(addDays(new Date(), -1))
    await collections.system().insertOne({
      _id: new ObjectId(),
      key: "last_cron_run",
      value: addDays(yesterday, -1),
    })
    await runDailyCheck({ botToken: "1:T", chatId: "-100" })
    // Asset is at day 7 today; yesterday it was at day 6. Only day 7 should match.
    const alerts = await collections.alerts().find({ asset_id: id }).toArray()
    expect(alerts).toHaveLength(1)
  })
})
