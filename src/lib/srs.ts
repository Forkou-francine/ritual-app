import type { Question } from '../db/types'
import { addDays, isoDate } from './date'

export function schedule(q: Question, correct: boolean, today = isoDate()) {
  if (!correct) {
    return { ease: Math.max(1.3, q.ease - 0.2), intervalDays: 0, dueDate: today }
  }
  const intervalDays = q.intervalDays === 0 ? 1 : q.intervalDays === 1 ? 3 : Math.round(q.intervalDays * q.ease)
  return {
    ease: Math.min(2.8, q.ease + 0.1),
    intervalDays,
    dueDate: addDays(today, intervalDays),
  }
}

export function dueLabel(intervalDays: number) {
  if (intervalDays === 0) return 'à revoir dans cette session'
  if (intervalDays === 1) return 'revue programmée demain'
  return `revue programmée dans ${intervalDays} jours`
}
