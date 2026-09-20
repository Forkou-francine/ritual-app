import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

/** Heures des rappels, au format « HH:MM ». */
export interface Reminders {
  sportStart: string
  sportEnd: string
  code: string
}

export const DEFAULT_REMINDERS: Reminders = { sportStart: '07:00', sportEnd: '08:00', code: '20:00' }

const KEYS: Record<keyof Reminders, string> = {
  sportStart: 'remSportStart',
  sportEnd: 'remSportEnd',
  code: 'remCode',
}

export function useReminders(): Reminders {
  const rows = useLiveQuery(() => db.settings.toArray())
  const map = new Map((rows ?? []).map((r) => [r.key, String(r.value)]))
  const get = (k: keyof Reminders) => {
    const v = map.get(KEYS[k])
    return v && /^\d{2}:\d{2}$/.test(v) ? v : DEFAULT_REMINDERS[k]
  }
  return { sportStart: get('sportStart'), sportEnd: get('sportEnd'), code: get('code') }
}

export async function setReminder(field: keyof Reminders, value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) await db.settings.put({ key: KEYS[field], value })
}
