process.env.JWT_SECRET = "x".repeat(32)
process.env.NODE_ENV = "test"

import { describe, expect, it, beforeAll, afterAll, beforeEach, mock } from "bun:test"
import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { setupTestDb, teardownTestDb, clearAllCollections } from "./helpers"
import { collections } from "~/lib/db"
import { telegramRoutes } from "~/routes/telegram"

const BOT_TOKEN = "1:T"
const WEBHOOK_SECRET = "secret-1234567890ab"

function buildApp() {
  const app = new Hono()
  app.route(
    "/api/telegram",
    telegramRoutes({ botToken: BOT_TOKEN, webhookSecret: WEBHOOK_SECRET }),
  )
  return app
}

interface FetchCall {
  url: string
  body: any
}

let fetchCalls: FetchCall[] = []

function installFetchMock(): void {
  fetchCalls = []
  globalThis.fetch = mock(async (url: any, init?: any) => {
    const body = init?.body ? JSON.parse(init.body as string) : null
    fetchCalls.push({ url: String(url), body })
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }) as any
}

async function seedAlert(opts?: { ack_status?: "done" | null; chatId?: string }) {
  const _id = new ObjectId()
  const assetId = new ObjectId()
  const ruleId = new ObjectId()
  await collections.assets().insertOne({
    _id: assetId,
    type: "chicken",
    breed: "broiler",
    quantity_initial: 10,
    quantity_current: 10,
    arrival_date: new Date(),
    expected_harvest_date: new Date(),
    status: "active",
    notes: "",
    created_by: new ObjectId(),
    created_at: new Date(),
    updated_at: new Date(),
  })
  await collections.rules().insertOne({
    _id: ruleId,
    asset_type: "chicken",
    day_offset: 7,
    category: "vaccine",
    severity: "critical",
    title_kh: "ND",
    instructions_kh: "ចាក់វ៉ាក់សាំង",
    source_page: 1,
  })
  await collections.alerts().insertOne({
    _id,
    asset_id: assetId,
    rule_id: ruleId,
    scheduled_for: new Date(),
    sent_at: new Date(),
    delivery_status: "sent",
    telegram_message_id: 999,
    telegram_chat_id: opts?.chatId ?? "-100",
    error: null,
    attempt_count: 1,
    ack_status: opts?.ack_status ?? null,
    ack_at: null,
    ack_note_kh: null,
    ack_photo_file_id: null,
    ack_via: null,
    ack_by_chat_id: null,
  })
  return { alertId: _id, assetId, ruleId }
}

beforeAll(async () => setupTestDb())
afterAll(async () => teardownTestDb())
beforeEach(async () => {
  await clearAllCollections()
  installFetchMock()
})

describe("POST /api/telegram/webhook — auth", () => {
  it("rejects requests without the secret header", async () => {
    const res = await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(401)
  })

  it("rejects requests with a wrong secret header", async () => {
    const res = await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": "nope",
      },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(401)
  })
})

describe("callback_query (ack buttons)", () => {
  it("marks an alert as done, calls editMessageText and answerCallbackQuery", async () => {
    const { alertId } = await seedAlert()
    const res = await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 1,
        callback_query: {
          id: "cb-1",
          from: { id: 555 },
          data: `ack:done:${alertId.toHexString()}`,
          message: { message_id: 999, chat: { id: -100 } },
        },
      }),
    })
    expect(res.status).toBe(200)

    const after = await collections.alerts().findOne({ _id: alertId })
    expect(after?.ack_status).toBe("done")
    expect(after?.ack_via).toBe("telegram")
    expect(after?.ack_by_chat_id).toBe("555")
    expect(after?.ack_at).toBeInstanceOf(Date)

    const editCall = fetchCalls.find((c) => c.url.endsWith("/editMessageText"))
    expect(editCall).toBeDefined()
    const ansCall = fetchCalls.find((c) => c.url.endsWith("/answerCallbackQuery"))
    expect(ansCall).toBeDefined()
    expect(ansCall?.body.callback_query_id).toBe("cb-1")
  })

  it("marks an alert as skipped", async () => {
    const { alertId } = await seedAlert()
    await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 2,
        callback_query: {
          id: "cb-2",
          from: { id: 555 },
          data: `ack:skipped:${alertId.toHexString()}`,
          message: { message_id: 999, chat: { id: -100 } },
        },
      }),
    })
    const after = await collections.alerts().findOne({ _id: alertId })
    expect(after?.ack_status).toBe("skipped")
  })

  it("does nothing when the alert id is unknown but still 200s", async () => {
    const res = await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 3,
        callback_query: {
          id: "cb-3",
          from: { id: 555 },
          data: `ack:done:${new ObjectId().toHexString()}`,
          message: { message_id: 999, chat: { id: -100 } },
        },
      }),
    })
    expect(res.status).toBe(200)
    // No editMessageText (we didn't update anything), but answerCallbackQuery did fire.
    expect(fetchCalls.find((c) => c.url.endsWith("/editMessageText"))).toBeUndefined()
    expect(fetchCalls.find((c) => c.url.endsWith("/answerCallbackQuery"))).toBeDefined()
  })

  it("ignores a second ack on the same alert (idempotent)", async () => {
    const { alertId } = await seedAlert({ ack_status: null })
    const payload = {
      update_id: 4,
      callback_query: {
        id: "cb-4",
        from: { id: 555 },
        data: `ack:done:${alertId.toHexString()}`,
        message: { message_id: 999, chat: { id: -100 } },
      },
    }
    await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
    })
    const firstAck = await collections.alerts().findOne({ _id: alertId })

    // Second ack with status=skipped should NOT overwrite (filter requires ack_status: null)
    await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 5,
        callback_query: {
          id: "cb-5",
          from: { id: 555 },
          data: `ack:skipped:${alertId.toHexString()}`,
          message: { message_id: 999, chat: { id: -100 } },
        },
      }),
    })
    const after = await collections.alerts().findOne({ _id: alertId })
    expect(after?.ack_status).toBe("done")
    expect(after?.ack_at?.getTime()).toBe(firstAck?.ack_at?.getTime())
  })

  it("ignores malformed callback_data", async () => {
    const res = await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 6,
        callback_query: {
          id: "cb-6",
          from: { id: 555 },
          data: "not:a:valid:thing",
          message: { message_id: 999, chat: { id: -100 } },
        },
      }),
    })
    expect(res.status).toBe(200)
  })
})

describe("reply_to_message (notes & photos)", () => {
  it("captures a text reply as ack_note_kh", async () => {
    const { alertId } = await seedAlert()
    const res = await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 10,
        message: {
          message_id: 1000,
          chat: { id: -100 },
          text: "ឱសថអស់",
          reply_to_message: { message_id: 999, chat: { id: -100 } },
        },
      }),
    })
    expect(res.status).toBe(200)
    const after = await collections.alerts().findOne({ _id: alertId })
    expect(after?.ack_note_kh).toBe("ឱសថអស់")
  })

  it("captures the largest photo file_id", async () => {
    const { alertId } = await seedAlert()
    await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 11,
        message: {
          message_id: 1001,
          chat: { id: -100 },
          caption: "មាន់ឈឺ",
          photo: [
            { file_id: "small" },
            { file_id: "medium" },
            { file_id: "large" },
          ],
          reply_to_message: { message_id: 999, chat: { id: -100 } },
        },
      }),
    })
    const after = await collections.alerts().findOne({ _id: alertId })
    expect(after?.ack_photo_file_id).toBe("large")
    expect(after?.ack_note_kh).toBe("មាន់ឈឺ")
  })

  it("does nothing when the reply_to_message doesn't match an alert", async () => {
    await seedAlert()
    const res = await buildApp().request("/api/telegram/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        update_id: 12,
        message: {
          message_id: 2000,
          chat: { id: -100 },
          text: "hi",
          reply_to_message: { message_id: 12345, chat: { id: -100 } },
        },
      }),
    })
    expect(res.status).toBe(200)
  })
})
