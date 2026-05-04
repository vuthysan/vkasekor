import { describe, expect, it } from "bun:test"
import { loadEnv } from "~/env"

describe("loadEnv", () => {
  it("returns parsed env when all required vars present", () => {
    const env = loadEnv({
      MONGODB_URI: "mongodb://x/y",
      BOT_TOKEN: "abc",
      TELEGRAM_GROUP_ID: "-100123",
      JWT_SECRET: "s".repeat(32),
      PORT: "8080",
      NODE_ENV: "test",
    })
    expect(env.MONGODB_URI).toBe("mongodb://x/y")
    expect(env.PORT).toBe(8080)
  })

  it("throws when JWT_SECRET is shorter than 32 chars", () => {
    expect(() =>
      loadEnv({
        MONGODB_URI: "mongodb://x/y",
        BOT_TOKEN: "abc",
        TELEGRAM_GROUP_ID: "-100123",
        JWT_SECRET: "short",
        PORT: "8080",
        NODE_ENV: "test",
      }),
    ).toThrow()
  })

  it("throws when BOT_TOKEN is missing", () => {
    expect(() =>
      loadEnv({
        MONGODB_URI: "mongodb://x/y",
        TELEGRAM_GROUP_ID: "-100123",
        JWT_SECRET: "s".repeat(32),
        PORT: "8080",
        NODE_ENV: "test",
      } as any),
    ).toThrow()
  })
})
