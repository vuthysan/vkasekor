import { Hono } from "hono"
import { cors } from "hono/cors"
import cron from "node-cron"
import { env } from "~/env"
import { connectDb } from "~/lib/db"
import { authRoutes } from "~/routes/auth"
import { assetsRoutes } from "~/routes/assets"
import { adminUsersRoutes } from "~/routes/users"
import { alertsRoutes } from "~/routes/alerts"
import { rulesRoutes } from "~/routes/rules"
import { runDailyCheck } from "~/cron/daily-check"

await connectDb(env.MONGODB_URI)

const app = new Hono()

app.use(
  "*",
  cors({
    origin: env.FRONTEND_ORIGIN ?? "*",
    credentials: true,
  }),
)

app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.route(
  "/api/auth",
  authRoutes({
    botToken: env.BOT_TOKEN,
    jwtSecret: env.JWT_SECRET,
    adminEmail: env.ADMIN_EMAIL,
    adminPasswordHash: env.ADMIN_PASSWORD_HASH,
    adminUserId: env.ADMIN_USER_ID,
  }),
)
app.route(
  "/api/assets",
  assetsRoutes({ jwtSecret: env.JWT_SECRET, botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID }),
)
app.route("/api/admin/users", adminUsersRoutes({ jwtSecret: env.JWT_SECRET }))
app.route("/api/alerts", alertsRoutes({ jwtSecret: env.JWT_SECRET }))
app.route("/api/rules", rulesRoutes({ jwtSecret: env.JWT_SECRET }))

// Dev-only endpoint to trigger the cron immediately for manual testing.
if (env.NODE_ENV !== "production") {
  app.post("/dev/trigger-cron", async (c) => {
    await runDailyCheck({ botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID })
    return c.json({ ok: true })
  })
}

// Cron: daily at 07:00 Asia/Phnom_Penh.
cron.schedule(
  "0 7 * * *",
  async () => {
    console.log("[cron-start]", new Date().toISOString())
    try {
      await runDailyCheck({ botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID })
      console.log("[cron-end]", new Date().toISOString())
    } catch (err) {
      console.error("[cron-error]", err)
    }
  },
  { timezone: "Asia/Phnom_Penh" },
)

// On startup, run catch-up if cron didn't fire yesterday.
runDailyCheck({ botToken: env.BOT_TOKEN, chatId: env.TELEGRAM_GROUP_ID }).catch((err) =>
  console.error("[startup-catchup-error]", err),
)

console.log(`[start] http://localhost:${env.PORT}`)

export default {
  port: env.PORT,
  fetch: app.fetch,
}
