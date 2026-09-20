import Dexie, { type Table } from 'dexie'
import type { Attempt, DailyLog, Exercise, Habit, HabitEntry, Question, Remedy, Setting } from './types'

export class LifestyleDB extends Dexie {
  dailyLogs!: Table<DailyLog, number>
  exercises!: Table<Exercise, number>
  remedies!: Table<Remedy, number>
  questions!: Table<Question, number>
  attempts!: Table<Attempt, number>
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
  }
}

export const db = new LifestyleDB()

export const GOALS = { waterMl: 2000, steps: 8000 }
export const GLASS_ML = 250
