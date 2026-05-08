import { describe, expect, it } from "bun:test"
import { loadEnv } from "~/env"

const base = {
  MONGODB_URI: "mongodb://x/y",
  BOT_TOKEN: "abc",
  TELEGRAM_GROUP_ID: "-100123",
  JWT_SECRET: "s".repeat(32),
  PORT: "8080",
  NODE_ENV: "test",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD_HASH: "somehash",
  ADMIN_USER_ID: "a".repeat(24),
  TELEGRAM_WEBHOOK_SECRET: "w".repeat(24),
}

describe("loadEnv", () => {
  it("returns parsed env when all required vars present", () => {
    const env = loadEnv(base)
    expect(env.MONGODB_URI).toBe("mongodb://x/y")
    expect(env.PORT).toBe(8080)
    expect(env.ADMIN_EMAIL).toBe("admin@example.com")
    expect(env.ADMIN_USER_ID).toBe("a".repeat(24))
  })

  it("throws when JWT_SECRET is shorter than 32 chars", () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: "short" })).toThrow()
  })

  it("throws when BOT_TOKEN is missing", () => {
    const { BOT_TOKEN: _, ...rest } = base
    expect(() => loadEnv(rest as any)).toThrow()
  })

  it("throws when ADMIN_EMAIL is not a valid email", () => {
    expect(() => loadEnv({ ...base, ADMIN_EMAIL: "notanemail" })).toThrow()
  })

  it("throws when ADMIN_USER_ID is not 24 characters", () => {
    expect(() => loadEnv({ ...base, ADMIN_USER_ID: "tooshort" })).toThrow()
  })

  it("throws when ADMIN_PASSWORD_HASH is missing", () => {
    const { ADMIN_PASSWORD_HASH: _, ...rest } = base
    expect(() => loadEnv(rest as any)).toThrow()
  })
})
