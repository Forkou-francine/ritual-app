import Dexie, { type Table } from 'dexie'
import type { Attempt, CodeSession, DailyLog, Exercise, Habit, HabitEntry, Question, Setting } from './types'

export class LifestyleDB extends Dexie {
  dailyLogs!: Table<DailyLog, number>
  exercises!: Table<Exercise, number>
  questions!: Table<Question, number>
  attempts!: Table<Attempt, number>
  codeSessions!: Table<CodeSession, number>
  settings!: Table<Setting, string>
  habits!: Table<Habit, number>
  habitEntries!: Table<HabitEntry, number>

  constructor() {
    super('lifestyle')
    this.version(1).stores({
      dailyLogs: '++id, &date',
      exercises: '++id, day, equipment',
      meals: '++id, category, *tags',
      remedies: '++id, *symptoms',
      questions: '++id, theme, dueDate',
      attempts: '++id, questionId, date',
      settings: '&key',
    })
    // v2 : les recettes disparaissent, les habitudes personnalisées arrivent.
    this.version(2).stores({
      meals: null,
      habits: '++id, order',
      habitEntries: '++id, &[habitId+date], habitId, date',
    })
    // v3 : la rubrique « soulagement » disparaît, on purge sa table.
    this.version(3).stores({ remedies: null })
    // v4 : historique des séances de code (examens blancs, plan de 8 semaines).
    this.version(4).stores({ codeSessions: '++id, date, kind' })
  }
}

export const db = new LifestyleDB()

export const GOALS = { waterMl: 2000, steps: 8000 }
export const GLASS_ML = 250
