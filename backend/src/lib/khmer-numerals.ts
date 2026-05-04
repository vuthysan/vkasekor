const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"]

export function toKhmerNumerals(input: number | string): string {
  return String(input).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)])
}
