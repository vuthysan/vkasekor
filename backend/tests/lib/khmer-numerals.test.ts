import { describe, expect, it } from "bun:test"
import { toKhmerNumerals } from "~/lib/khmer-numerals"

describe("toKhmerNumerals", () => {
  it("converts 0-9 individually", () => {
    expect(toKhmerNumerals(0)).toBe("០")
    expect(toKhmerNumerals(7)).toBe("៧")
    expect(toKhmerNumerals(9)).toBe("៩")
  })

  it("converts multi-digit numbers", () => {
    expect(toKhmerNumerals(50)).toBe("៥០")
    expect(toKhmerNumerals(2026)).toBe("២០២៦")
  })

  it("accepts a string of digits", () => {
    expect(toKhmerNumerals("14")).toBe("១៤")
  })
})
