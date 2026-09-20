export type Equipment = 'aucun' | 'halteres' | 'elastique'
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface DailyLog {
  id?: number
  date: string
  waterMl: number
  steps: number
  workoutDone: boolean
}

export interface Exercise {
  id?: number
  day: Weekday
  order: number
  name: string
  detail: string
  equipment: Equipment
  seconds?: number
}

/** Une habitude se coche (`check`) ou se compte (`count`, avec objectif et unité). */
export type HabitKind = 'check' | 'count'

export interface Habit {
  id?: number
  name: string
  emoji: string
  kind: HabitKind
  /** `count` uniquement : unité affichée, objectif du jour, pas du bouton « + ». */
  unit?: string
  goal?: number
  step?: number
  /** Note libre en cours (le titre du livre, par exemple) et son libellé. */
  note?: string
  noteLabel?: string
  /** Jours de la semaine où l'habitude est active. */
  days: Weekday[]
  order: number
}

/** Une ligne par habitude et par jour. */
export interface HabitEntry {
  id?: number
  habitId: number
  date: string
  value: number
  done: boolean
}

export interface Remedy {
  id?: number
  name: string
  symptoms: string[]
  howTo: string
  icon: string
}

export interface Question {
  id?: number
  theme: string
  prompt: string
  choices: string[]
  answer: number
  explanation: string
  source: string
  ease: number
  intervalDays: number
  dueDate: string
}

export interface Attempt {
  id?: number
  questionId: number
  date: string
  correct: boolean
}

export interface Setting {
  key: string
  value: number | string
}
