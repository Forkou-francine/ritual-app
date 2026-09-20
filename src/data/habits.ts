import type { Habit, Weekday } from '../db/types'

export const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

/** Émojis proposés dans le formulaire. */
export const HABIT_EMOJIS = [
  '📖', '🧘', '🏃', '💧', '🥗', '🌙', '✍️', '🎧',
  '🧹', '💊', '🚶', '🎸', '🧠', '☀️', '🤸', '📵',
]

/** Unités suggérées pour une habitude comptée. */
export const HABIT_UNITS = ['pages', 'min', 'km', 'verres', 'fois', 'séries']

type Seed = Omit<Habit, 'id'>

/** Deux habitudes de départ, modifiables ou supprimables. */
export const habitSeed: Seed[] = [
  {
    name: 'Lecture',
    emoji: '📖',
    kind: 'count',
    unit: 'pages',
    goal: 20,
    step: 5,
    note: '',
    noteLabel: 'Livre en cours',
    days: ALL_DAYS,
    order: 0,
  },
  {
    name: 'Méditation',
    emoji: '🧘',
    kind: 'check',
    days: ALL_DAYS,
    order: 1,
  },
]
