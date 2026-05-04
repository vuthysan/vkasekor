import { Hono } from "hono"

const app = new Hono()

app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }))

const port = Number(process.env.PORT ?? 8080)

export default {
  port,
  fetch: app.fetch,
}
