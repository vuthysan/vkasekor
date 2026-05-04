import { ObjectId } from "mongodb"
import { collections } from "~/lib/db"
import { startOfDayInPhnomPenh, daysBetween, enumerateDaysFrom, addDays } from "~/lib/lifecycle"
import { matchingRulesForAge } from "~/lib/rule-matcher"
import { formatAlertMessage } from "~/lib/khmer-formatter"
import { sendTelegramMessage } from "~/lib/telegram"
import type { Asset, Rule } from "~/types"

interface RunArgs {
  botToken: string
  chatId: string
}

const HARVEST_DAY = 60

function batchLabel(asset: Asset): string {
  return asset._id.toHexString().slice(-6).toUpperCase()
}

export async function processOneRule(
  asset: Asset,
  rule: Rule,
  processingDay: Date,
  isCatchUp: boolean,
  args: RunArgs,
): Promise<void> {
  const alertId = new ObjectId()
  try {
    await collections.alerts().insertOne({
      _id: alertId,
      asset_id: asset._id,
      rule_id: rule._id,
      scheduled_for: processingDay,
      sent_at: null,
      delivery_status: "pending",
      telegram_message_id: null,
      error: null,
      attempt_count: 0,
    })
  } catch (err: any) {
    if (err?.code === 11000) return // already processed (idempotent)
    throw err
  }

  const text = formatAlertMessage({ asset, rule, batchLabel: batchLabel(asset), catchUp: isCatchUp })
  const result = await sendTelegramMessage({ botToken: args.botToken, chatId: args.chatId, text })

  await collections.alerts().updateOne(
    { _id: alertId },
    {
      $set: {
        sent_at: new Date(),
        delivery_status: result.ok ? "sent" : "failed",
        telegram_message_id: result.result?.message_id ?? null,
        error: result.ok ? null : result.description ?? "unknown",
      },
      $inc: { attempt_count: 1 },
    },
  )
}

export async function runDailyCheck(args: RunArgs): Promise<void> {
  const today = startOfDayInPhnomPenh(new Date())
  const lastRecord = await collections.system().findOne({ key: "last_cron_run" })
  const startDay = lastRecord ? addDays(lastRecord.value, 1) : today
  const daysToProcess = enumerateDaysFrom(
    startDay.getTime() <= today.getTime() ? startDay : today,
    today,
  )

  const allRules = await collections.rules().find({ asset_type: "chicken" }).toArray()
  const activeAssets = await collections.assets().find({ status: "active" }).toArray()

  for (const processingDay of daysToProcess) {
    const isCatchUp = processingDay.getTime() < today.getTime()
    for (const asset of activeAssets) {
      const age = daysBetween(asset.arrival_date, processingDay)
      if (age < 0) continue
      const rules = matchingRulesForAge(allRules, asset.type, age)
      for (const rule of rules) {
        await processOneRule(asset, rule, processingDay, isCatchUp, args)
      }
      if (age >= HARVEST_DAY && asset.status === "active") {
        await collections.assets().updateOne(
          { _id: asset._id },
          { $set: { status: "harvested", updated_at: new Date() } },
        )
      }
    }
  }

  await collections.system().updateOne(
    { key: "last_cron_run" },
    { $set: { key: "last_cron_run", value: today } },
    { upsert: true },
  )
}
