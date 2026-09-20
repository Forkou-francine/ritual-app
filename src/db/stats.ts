import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { isComplete, isScheduled } from './habits'
import { useProfile } from './profile'
import { isoDate, lastNDates } from '../lib/date'
import { passMark } from '../lib/codePlan'
import { levelFor, XP } from '../lib/xp'

export interface DayItem {
  label: string
  emoji: string
  done: boolean
}

export interface DayStat {
  date: string
  /** Jour suivi : après la première utilisation de l'appli et pas dans le futur. */
  tracked: boolean
  xp: number
  done: number
  total: number
  workout: boolean
  correct: number
  items: DayItem[]
}

/** Une ligne par jour : quêtes faites et XP gagnés (eau, pas, séance, habitudes, réponses). */
export async function computeDayStats(
  dates: string[],
  goals: { waterMl: number; steps: number },
): Promise<DayStat[]> {
  const today = isoDate()
  const [logs, entries, attempts, habits, firstLog, firstEntry] = await Promise.all([
    db.dailyLogs.where('date').anyOf(dates).toArray(),
    db.habitEntries.where('date').anyOf(dates).toArray(),
    db.attempts.where('date').anyOf(dates).toArray(),
    db.habits.orderBy('order').toArray(),
    db.dailyLogs.orderBy('date').first(),
    db.habitEntries.orderBy('date').first(),
  ])
  const firstDate = [firstLog?.date, firstEntry?.date].filter((d): d is string => !!d).sort()[0]

  const logByDate = new Map(logs.map((l) => [l.date, l]))
  const entryByKey = new Map(entries.map((e) => [`${e.habitId}|${e.date}`, e]))
  const correctByDate = new Map<string, number>()
  for (const a of attempts) if (a.correct) correctByDate.set(a.date, (correctByDate.get(a.date) ?? 0) + 1)

  return dates.map((date) => {
    const tracked = !!firstDate && date >= firstDate && date <= today
    if (!tracked) {
      return { date, tracked, xp: 0, done: 0, total: 0, workout: false, correct: 0, items: [] }
    }
    const log = logByDate.get(date)
    const workout = !!log?.workoutDone
    const items: DayItem[] = [
      { label: 'Eau', emoji: '💧', done: !!log && log.waterMl >= goals.waterMl },
      { label: 'Pas', emoji: '👟', done: !!log && log.steps >= goals.steps },
      { label: 'Séance', emoji: '🏃', done: workout },
    ]
    let xp = (items[0].done ? XP.water : 0) + (items[1].done ? XP.steps : 0) + (workout ? XP.workout : 0)
    for (const h of habits) {
      if (!isScheduled(h, date)) continue
      const done = isComplete(h, entryByKey.get(`${h.id}|${date}`))
      items.push({ label: h.name, emoji: h.emoji, done })
      if (done) xp += XP.habit
    }
    const correct = correctByDate.get(date) ?? 0
    xp += correct * XP.answer
    return {
      date,
      tracked,
      xp,
      done: items.filter((i) => i.done).length,
      total: items.length,
      workout,
      correct,
      items,
    }
  })
}

export interface Badge {
  id: string
  emoji: string
  label: string
  earned: boolean
}

/** Progression globale sur les 400 derniers jours : XP, niveau, séries, badges. */
export function useProgress() {
  const profile = useProfile()
  return useLiveQuery(async () => {
    const stats = await computeDayStats(lastNDates(400), profile)
    const codeSessions = await db.codeSessions.toArray()
    const examPassed = codeSessions.some((s) => s.kind === 'examen' && s.total >= 10 && s.score >= passMark(s.total))
    const today = isoDate()

    let streak = 0
    for (const s of stats.slice().reverse()) {
      if (s.done > 0) streak++
      else if (s.date !== today) break
    }
    let best = 0
    let run = 0
    for (const s of stats) {
      run = s.done > 0 ? run + 1 : 0
      best = Math.max(best, run)
    }

    const xp = stats.reduce((n, s) => n + s.xp, 0)
    const lvl = levelFor(xp)
    const totalDone = stats.reduce((n, s) => n + s.done, 0)
    const workouts = stats.filter((s) => s.workout).length
    const correct = stats.reduce((n, s) => n + s.correct, 0)

    const badges: Badge[] = [
      { id: 'first', emoji: '🌱', label: 'Premier pas', earned: totalDone >= 1 },
      { id: 's7', emoji: '🏅', label: '7 jours', earned: best >= 7 },
      { id: 's21', emoji: '⭐', label: '3 semaines', earned: best >= 21 },
      { id: 's30', emoji: '🔥', label: '30 jours', earned: best >= 30 },
      { id: 'q100', emoji: '💎', label: '100 quêtes', earned: totalDone >= 100 },
      { id: 'w10', emoji: '💪', label: '10 séances', earned: workouts >= 10 },
      { id: 'c50', emoji: '🚗', label: '50 bonnes réponses', earned: correct >= 50 },
      { id: 'ex', emoji: '🎓', label: 'Examen blanc réussi', earned: examPassed },
      { id: 'l5', emoji: '👑', label: 'Niveau 5', earned: lvl.level >= 5 },
    ]
    return { stats, xp, ...lvl, streak, best, badges }
  }, [profile.waterMl, profile.steps])
}
