import { db } from './db'
import { lastNDates } from '../lib/date'
import type { Habit, HabitEntry, Weekday } from './types'

/** Une habitude est-elle prévue ce jour de la semaine ? */
export function isScheduled(habit: Habit, date: string) {
  const wd = new Date(date + 'T12:00:00').getDay() as Weekday
  return habit.days.includes(wd)
}

/** Objectif atteint pour ce jour ? */
export function isComplete(habit: Habit, entry?: HabitEntry) {
  if (!entry) return false
  if (habit.kind === 'check') return entry.done
  return entry.value >= (habit.goal ?? 1)
}

/**
 * Même précaution que `getOrCreateLog` : l'index `&[habitId+date]` est unique, donc
 * deux appels concurrents doivent être sérialisés par une transaction, sinon le second
 * `add` échoue et l'écriture avortée casse le suivi optimiste des liveQuery.
 */
export async function getOrCreateEntry(habitId: number, date: string) {
  return db.transaction('rw', db.habitEntries, async () => {
    const existing = await db.habitEntries.get({ habitId, date })
    if (existing) return existing
    const id = await db.habitEntries.add({ habitId, date, value: 0, done: false })
    return (await db.habitEntries.get(id))!
  })
}

export async function toggleHabit(habitId: number, date: string) {
  const entry = await getOrCreateEntry(habitId, date)
  await db.habitEntries.update(entry.id!, { done: !entry.done })
}

/** Fixe la valeur du jour (bornée à zéro). */
export async function setHabitValue(habitId: number, date: string, value: number) {
  const entry = await getOrCreateEntry(habitId, date)
  await db.habitEntries.update(entry.id!, { value: Math.max(0, Math.round(value)) })
}

export async function bumpHabit(habitId: number, date: string, by: number) {
  const entry = await getOrCreateEntry(habitId, date)
  await db.habitEntries.update(entry.id!, { value: Math.max(0, entry.value + by) })
}

export async function setHabitNote(habitId: number, note: string) {
  await db.habits.update(habitId, { note })
}

/** Supprime l'habitude et tout son historique. */
export async function deleteHabit(habitId: number) {
  await db.transaction('rw', db.habits, db.habitEntries, async () => {
    await db.habitEntries.where('habitId').equals(habitId).delete()
    await db.habits.delete(habitId)
  })
}

/**
 * Série en cours : on remonte les jours prévus jusqu'au premier objectif manqué.
 * Le jour même ne casse pas la série tant qu'il n'est pas terminé.
 */
export async function habitStreak(habit: Habit, today: string) {
  const dates = lastNDates(90)
  const entries = await db.habitEntries.where('habitId').equals(habit.id!).toArray()
  const byDate = new Map(entries.map((e) => [e.date, e]))
  let streak = 0
  for (const d of dates.slice().reverse()) {
    if (!isScheduled(habit, d)) continue
    if (isComplete(habit, byDate.get(d))) streak++
    else if (d !== today) break
  }
  return streak
}
