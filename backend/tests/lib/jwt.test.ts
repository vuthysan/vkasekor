import { describe, expect, it } from "bun:test"
import { signSession, verifySession } from "~/lib/jwt"

const SECRET = "x".repeat(32)

describe("signSession / verifySession", () => {
  it("round-trips the payload", async () => {
    const token = await signSession({ user_id: "abc", telegram_id: 1, role: "admin" }, SECRET)
    const decoded = await verifySession(token, SECRET)
    expect(decoded.user_id).toBe("abc")
    expect(decoded.telegram_id).toBe(1)
    expect(decoded.role).toBe("admin")
  })

  it("rejects tampered tokens", async () => {
    const token = await signSession({ user_id: "abc", telegram_id: 1, role: "member" }, SECRET)
    const tampered = token.slice(0, -2) + "xx"
    await expect(verifySession(tampered, SECRET)).rejects.toThrow()
  })

  it("rejects tokens signed with a different secret", async () => {
    const token = await signSession({ user_id: "abc", telegram_id: 1, role: "member" }, SECRET)
    await expect(verifySession(token, "y".repeat(32))).rejects.toThrow()
  })
})
