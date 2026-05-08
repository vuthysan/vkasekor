import { env } from "~/env"

async function setupWebhook() {
  if (!env.TELEGRAM_WEBHOOK_URL) {
    console.error("TELEGRAM_WEBHOOK_URL is not set in env.")
    process.exit(1)
  }

  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: env.TELEGRAM_WEBHOOK_URL,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ["callback_query", "message"],
    }),
  })

  const body = await res.json()
  console.log("setWebhook response:", body)
  if (!res.ok || !body.ok) process.exit(1)
}

setupWebhook().catch((err) => {
  console.error(err)
  process.exit(1)
})
