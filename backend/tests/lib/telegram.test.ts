import { describe, expect, it, beforeEach, mock } from "bun:test"
import { createHash, createHmac } from "node:crypto"
import { verifyTelegramLogin, sendTelegramMessage } from "~/lib/telegram"

const BOT_TOKEN = "123:ABCDEF"

function signTelegramPayload(fields: Record<string, string | number>) {
  const dataString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n")
  const secret = createHash("sha256").update(BOT_TOKEN).digest()
  return createHmac("sha256", secret).update(dataString).digest("hex")
}

describe("verifyTelegramLogin", () => {
  const baseFields = {
    id: 12345,
    first_name: "Test",
    username: "testuser",
    auth_date: Math.floor(Date.now() / 1000),
  }

  it("returns the payload when hash and timestamp are valid", () => {
    const hash = signTelegramPayload(baseFields)
    const result = verifyTelegramLogin({ ...baseFields, hash }, BOT_TOKEN)
    expect(result.id).toBe(12345)
  })

  it("throws on invalid hash", () => {
    expect(() =>
      verifyTelegramLogin({ ...baseFields, hash: "0".repeat(64) }, BOT_TOKEN),
    ).toThrow("invalid signature")
  })

  it("throws when auth_date is older than 24h", () => {
    const stale = { ...baseFields, auth_date: Math.floor(Date.now() / 1000) - 25 * 3600 }
    const hash = signTelegramPayload(stale)
    expect(() => verifyTelegramLogin({ ...stale, hash }, BOT_TOKEN)).toThrow("expired")
  })
})

describe("sendTelegramMessage", () => {
  beforeEach(() => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: true, result: { message_id: 9999 } }), { status: 200 }),
    ) as any
  })

  it("posts to sendMessage endpoint and returns parsed body", async () => {
    const result = await sendTelegramMessage({
      botToken: BOT_TOKEN,
      chatId: "-100123",
      text: "hi",
    })
    expect(result.ok).toBe(true)
    expect(result.result?.message_id).toBe(9999)
  })

  it("returns ok:false when API returns error", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: false, description: "blocked" }), { status: 400 }),
    ) as any
    const result = await sendTelegramMessage({ botToken: BOT_TOKEN, chatId: "-100123", text: "hi" })
    expect(result.ok).toBe(false)
    expect(result.description).toBe("blocked")
  })
})
