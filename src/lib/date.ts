export function isoDate(d: Date = new Date()): string {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return tz.toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

export function lastNDates(n: number, end: string = isoDate()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1))
}

const LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const SHORT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })

export const formatLong = (iso: string) => LONG.format(new Date(iso + 'T12:00:00'))
export const formatShort = (iso: string) => SHORT.format(new Date(iso + 'T12:00:00')).replace('.', '')
