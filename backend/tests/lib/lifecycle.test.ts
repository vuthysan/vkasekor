import { describe, expect, it } from "bun:test"
import { startOfDayInPhnomPenh, daysBetween, addDays } from "~/lib/lifecycle"

describe("startOfDayInPhnomPenh", () => {
  it("returns 00:00:00 ICT (UTC+7) for a given UTC instant", () => {
    // 2026-05-04 03:30 UTC = 2026-05-04 10:30 ICT → start of day = 2026-05-03 17:00 UTC
    const input = new Date("2026-05-04T03:30:00Z")
    const result = startOfDayInPhnomPenh(input)
    expect(result.toISOString()).toBe("2026-05-03T17:00:00.000Z")
  })

  it("handles instants late in the UTC day that fall on next ICT day", () => {
    // 2026-05-04 18:00 UTC = 2026-05-05 01:00 ICT → start of day = 2026-05-04 17:00 UTC
    const input = new Date("2026-05-04T18:00:00Z")
    const result = startOfDayInPhnomPenh(input)
    expect(result.toISOString()).toBe("2026-05-04T17:00:00.000Z")
  })
})

describe("daysBetween", () => {
  it("returns 0 for two timestamps within the same ICT day", () => {
    // 2026-05-04 17:30 UTC = 2026-05-05 00:30 ICT  (start of May 5 ICT)
    // 2026-05-05 16:30 UTC = 2026-05-05 23:30 ICT  (end of May 5 ICT)
    const a = new Date("2026-05-04T17:30:00Z")
    const b = new Date("2026-05-05T16:30:00Z")
    expect(daysBetween(a, b)).toBe(0)
  })

  it("returns 7 for one week apart", () => {
    const a = startOfDayInPhnomPenh(new Date("2026-05-01T08:00:00Z"))
    const b = startOfDayInPhnomPenh(new Date("2026-05-08T08:00:00Z"))
    expect(daysBetween(a, b)).toBe(7)
  })

  it("returns negative when b is before a", () => {
    const a = startOfDayInPhnomPenh(new Date("2026-05-08T08:00:00Z"))
    const b = startOfDayInPhnomPenh(new Date("2026-05-01T08:00:00Z"))
    expect(daysBetween(a, b)).toBe(-7)
  })
})

describe("addDays", () => {
  it("adds N days preserving ICT start-of-day", () => {
    const start = startOfDayInPhnomPenh(new Date("2026-05-01T08:00:00Z"))
    const result = addDays(start, 60)
    expect(daysBetween(start, result)).toBe(60)
  })
})
