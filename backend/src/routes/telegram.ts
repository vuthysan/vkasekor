import { Hono } from "hono"
import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import {
  answerCallbackQuery,
  editTelegramMessageText,
} from "~/lib/telegram"
import { formatAlertMessage, formatAckedMessage } from "~/lib/khmer-formatter"
import { ASSET_CONFIG } from "~/lib/asset-config"
import type { AckStatus, Alert, Asset, Rule } from "~/types"

interface TelegramRouteConfig {
  botToken: string
  webhookSecret: string
}

const ACK_STATUSES = new Set<AckStatus>(["done", "skipped", "blocked"])

interface TelegramUser {
  id: number
}
interface TelegramMessage {
  message_id: number
  chat: { id: number }
  text?: string
  caption?: string
  photo?: { file_id: string }[]
  reply_to_message?: TelegramMessage
}
interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  data?: string
  message?: TelegramMessage
}
interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export function telegramRoutes(cfg: TelegramRouteConfig) {
  const app = new Hono()

  // Public — auth is the secret header Telegram sends back from setWebhook.
  app.post("/webhook", async (c) => {
    const secret = c.req.header("x-telegram-bot-api-secret-token")
    if (secret !== cfg.webhookSecret) return c.json({ ok: false }, 401)

    const update = (await c.req.json().catch(() => null)) as TelegramUpdate | null
    if (!update) return c.json({ ok: false }, 400)

    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, cfg)
    } else if (update.message?.reply_to_message) {
      await handleReplyMessage(update.message)
    }

    // Always 200 — Telegram retries on non-2xx and we don't want re-delivery storms.
    return c.json({ ok: true })
  })

  return app
}

async function handleCallbackQuery(
  query: TelegramCallbackQuery,
  cfg: TelegramRouteConfig,
): Promise<void> {
  const data = query.data ?? ""
  const parts = data.split(":")
  if (parts.length !== 3 || parts[0] !== "ack") {
    await answerCallbackQuery({ botToken: cfg.botToken, callbackQueryId: query.id })
    return
  }
  const [, statusRaw, alertIdHex] = parts
  if (!ACK_STATUSES.has(statusRaw as AckStatus) || !ObjectId.isValid(alertIdHex)) {
    await answerCallbackQuery({ botToken: cfg.botToken, callbackQueryId: query.id })
    return
  }
  const status = statusRaw as AckStatus

  const ackedAt = new Date()
  const result = await collections.alerts().findOneAndUpdate(
    { _id: new ObjectId(alertIdHex), ack_status: null },
    {
      $set: {
        ack_status: status,
        ack_at: ackedAt,
        ack_via: "telegram",
        ack_by_chat_id: String(query.from.id),
      },
    },
    { returnDocument: "after" },
  )

  if (!result) {
    // Alert not found, or already acknowledged — surface a friendly toast.
    await answerCallbackQuery({
      botToken: cfg.botToken,
      callbackQueryId: query.id,
      text: "បានកត់ត្រារួចហើយ",
    })
    return
  }

  // Best-effort: rewrite the original message to show the ack badge and remove buttons.
  if (query.message) {
    const newText = await rebuildMessageWithAck(result, status, ackedAt, query.message)
    if (newText) {
      try {
        await editTelegramMessageText({
          botToken: cfg.botToken,
          chatId: query.message.chat.id,
          messageId: query.message.message_id,
          text: newText,
        })
      } catch {
        // ignore — edit is cosmetic
      }
    }
  }

  await answerCallbackQuery({
    botToken: cfg.botToken,
    callbackQueryId: query.id,
    text: ackBadgeText(status),
  })
}

function ackBadgeText(status: AckStatus): string {
  switch (status) {
    case "done":
      return "✅ ធ្វើរួច"
    case "skipped":
      return "⏭️ រំលង"
    case "blocked":
      return "❓ បានបញ្ជូនទៅអ្នកជំនាញ"
  }
}

async function rebuildMessageWithAck(
  alert: Alert,
  status: AckStatus,
  ackedAt: Date,
  originalMessage: TelegramMessage,
): Promise<string | null> {
  const fallbackText = originalMessage.text ?? ""
  const asset = (await collections.assets().findOne({ _id: alert.asset_id })) as Asset | null
  const rule = (await collections.rules().findOne({ _id: alert.rule_id })) as Rule | null
  if (!asset || !rule) return formatAckedMessage(fallbackText, status, ackedAt)

  const config = ASSET_CONFIG[asset.type]
  if (!config) return formatAckedMessage(fallbackText, status, ackedAt)

  const batchLabel = asset._id.toHexString().slice(-6).toUpperCase()
  const baseText = formatAlertMessage({ asset, rule, batchLabel, catchUp: false })
  return formatAckedMessage(baseText, status, ackedAt)
}

async function handleReplyMessage(message: TelegramMessage): Promise<void> {
  const replyTo = message.reply_to_message
  if (!replyTo) return

  // Find the alert this reply belongs to.
  const alert = await collections.alerts().findOne({
    telegram_message_id: replyTo.message_id,
    telegram_chat_id: String(message.chat.id),
  })
  if (!alert) return

  const note = (message.text ?? message.caption ?? "").trim()
  const photoFileId = pickLargestPhoto(message.photo)
  if (!note && !photoFileId) return

  const update: Record<string, unknown> = {}
  if (note) update.ack_note_kh = note
  if (photoFileId) update.ack_photo_file_id = photoFileId

  await collections.alerts().updateOne({ _id: alert._id }, { $set: update })
}

function pickLargestPhoto(photos?: { file_id: string }[]): string | null {
  if (!photos || photos.length === 0) return null
  // Telegram returns photos sorted small → large. Take the last (largest).
  return photos[photos.length - 1].file_id
}
