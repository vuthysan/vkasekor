import { createHash, createHmac, timingSafeEqual } from "node:crypto"

export interface TelegramLoginPayload {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

const TWENTY_FOUR_HOURS_S = 24 * 60 * 60

export function verifyTelegramLogin(
  payload: TelegramLoginPayload,
  botToken: string,
  now: () => number = () => Math.floor(Date.now() / 1000),
): TelegramLoginPayload {
  const { hash, ...fields } = payload
  const dataString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k as keyof typeof fields]}`)
    .join("\n")
  const secret = createHash("sha256").update(botToken).digest()
  const expected = createHmac("sha256", secret).update(dataString).digest("hex")
  const expectedBuf = Buffer.from(expected, "hex")
  const givenBuf = Buffer.from(hash, "hex")
  if (expectedBuf.length !== givenBuf.length || !timingSafeEqual(expectedBuf, givenBuf)) {
    throw new Error("invalid signature")
  }
  if (now() - payload.auth_date > TWENTY_FOUR_HOURS_S) {
    throw new Error("expired")
  }
  return payload
}

export interface SendMessageArgs {
  botToken: string
  chatId: string
  text: string
  parseMode?: "HTML" | "MarkdownV2"
}

export interface TelegramSendResult {
  ok: boolean
  result?: { message_id: number }
  description?: string
  error_code?: number
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  text,
  parseMode = "HTML",
}: SendMessageArgs): Promise<TelegramSendResult> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_notification: false,
    }),
  })
  return (await res.json()) as TelegramSendResult
}
