const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

export function startOfDayInPhnomPenh(date: Date): Date {
  const ictMs = date.getTime() + ICT_OFFSET_MS
  const ictDate = new Date(ictMs)
  ictDate.setUTCHours(0, 0, 0, 0)
  return new Date(ictDate.getTime() - ICT_OFFSET_MS)
}

export function daysBetween(a: Date, b: Date): number {
  const aDay = startOfDayInPhnomPenh(a).getTime()
  const bDay = startOfDayInPhnomPenh(b).getTime()
  return Math.round((bDay - aDay) / (24 * 60 * 60 * 1000))
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export function enumerateDaysFrom(from: Date, to: Date): Date[] {
  const start = startOfDayInPhnomPenh(from)
  const end = startOfDayInPhnomPenh(to)
  const days: Date[] = []
  for (let d = start; d.getTime() <= end.getTime(); d = addDays(d, 1)) {
    days.push(d)
  }
  return days
}
