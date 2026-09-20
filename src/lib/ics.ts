import { addDays, isoDate } from './date'
import type { Weekday } from '../db/types'

export interface IcsEvent {
  /** Identifiant stable : réimporter le fichier met l'événement à jour au lieu de le dupliquer. */
  uid: string
  title: string
  description?: string
  url?: string
  /** Heures locales « HH:MM ». */
  start: string
  end: string
  day: Weekday
}

const BYDAY: Record<Weekday, string> = { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA' }

const escapeText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** Plie les lignes à 75 octets UTF-8, comme l'exige la RFC 5545. */
function fold(line: string): string {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const n = enc.encode(ch).length
    if (bytes + n > (out.length === 0 ? 75 : 74)) {
      out.push(cur)
      cur = ''
      bytes = 0
    }
    cur += ch
    bytes += n
  }
  out.push(cur)
  return out.join('\r\n ')
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** Prochaine date (aujourd'hui incluse) tombant un jour de semaine donné. */
function nextDate(day: Weekday): string {
  const today = isoDate()
  const gap = (day - new Date(today + 'T12:00:00').getDay() + 7) % 7
  return addDays(today, gap)
}

const localStamp = (iso: string, hhmm: string) => `${iso.replace(/-/g, '')}T${hhmm.replace(':', '')}00`

/**
 * Événements hebdomadaires récurrents avec alarme à l'heure de début.
 * Heures « flottantes » (sans fuseau) : 7 h reste 7 h quel que soit le fuseau du téléphone.
 */
export function buildIcs(events: IcsEvent[]): string {
  const now = stamp(new Date())
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rituel//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']

  for (const e of events) {
    const date = nextDate(e.day)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}-${e.day}@rituel`,
      `DTSTAMP:${now}`,
      `DTSTART:${localStamp(date, e.start)}`,
      `DTEND:${localStamp(date, e.end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[e.day]}`,
      `SUMMARY:${escapeText(e.title)}`,
    )
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`)
    if (e.url) lines.push(`URL:${e.url}`)
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(e.title)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

/** Partage le fichier (iOS/Android) ou le télécharge à défaut. */
export async function deliverIcs(ics: string, filename: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([ics], filename, { type: 'text/calendar' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  return 'downloaded'
}
