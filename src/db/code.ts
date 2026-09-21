import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { THEMES } from '../data/questions'
import { isoDate } from '../lib/date'
import type { CodeSession, Question } from './types'

export interface ThemeStat {
  theme: string
  total: number
  seen: number
  /** Questions dont la dernière réponse est juste. */
  correct: number
  /** Réussite sur les questions déjà vues ; `null` si aucune n'a été vue. */
  pct: number | null
}

export interface CodeStats {
  examDate: string | null
  questions: Question[]
  dueCount: number
  errors: Question[]
  seen: number
  themes: ThemeStat[]
  /** Part des questions de la banque dont la dernière réponse est juste (les non vues comptent 0). */
  readiness: number
  sessions: CodeSession[]
  streak: number
  /** Score moyen ramené à 40 questions, sur les 10 dernières séances. */
  avg40: number | null
}

export async function setExamDate(date: string) {
  await db.settings.put({ key: 'examDate', value: date })
}

/** Toutes les statistiques de la rubrique Code, en une lecture réactive. */
export function useCodeStats(): CodeStats | undefined {
  return useLiveQuery(async () => {
    const today = isoDate()
    const [questions, attempts, sessions, exam] = await Promise.all([
      db.questions.toArray(),
      db.attempts.toArray(),
      db.codeSessions.toArray(),
      db.settings.get('examDate'),
    ])

    // Les identifiants sont croissants : la dernière tentative écrase les précédentes.
    const last = new Map<number, boolean>()
    for (const a of attempts) last.set(a.questionId, a.correct)

    const errors = questions.filter((q) => q.flagged || last.get(q.id!) === false)

    const themes: ThemeStat[] = THEMES.map((theme) => {
      const qs = questions.filter((q) => q.theme === theme)
      const seenQs = qs.filter((q) => last.has(q.id!))
      const correct = seenQs.filter((q) => last.get(q.id!)).length
      return {
        theme,
        total: qs.length,
        seen: seenQs.length,
        correct,
        pct: seenQs.length ? Math.round((correct / seenQs.length) * 100) : null,
      }
    }).filter((t) => t.total > 0)

    const correctAll = questions.filter((q) => last.get(q.id!)).length

    // Série : jours consécutifs avec au moins une réponse ; aujourd'hui ne casse pas la série.
    const days = new Set(attempts.map((a) => a.date))
    let streak = 0
    for (let i = 0; i < 400; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const iso = isoDate(d)
      if (days.has(iso)) streak++
      else if (iso !== today) break
    }

    const recent = sessions.slice(-10).filter((s) => s.total > 0)
    return {
      examDate: exam ? String(exam.value) : null,
      questions,
      dueCount: questions.filter((q) => q.dueDate <= today).length,
      errors,
      seen: last.size,
      themes,
      readiness: questions.length ? Math.round((correctAll / questions.length) * 100) : 0,
      sessions,
      streak,
      avg40: recent.length ? Math.round((recent.reduce((n, s) => n + s.score / s.total, 0) / recent.length) * 40) : null,
    }
  })
}

/** Fiches de cours déjà lues, mémorisées dans les réglages (thèmes séparés par « | »). */
const parse = (v: unknown) => (typeof v === 'string' && v ? v.split('|') : [])

export function useLessonsRead() {
  return useLiveQuery(async () => parse((await db.settings.get('lessonsRead'))?.value), []) ?? []
}

export async function markLessonRead(theme: string) {
  const done = parse((await db.settings.get('lessonsRead'))?.value)
  if (!done.includes(theme)) await db.settings.put({ key: 'lessonsRead', value: [...done, theme].join('|') })
}
