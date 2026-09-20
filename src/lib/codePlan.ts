import { addDays, daysBetween } from './date'

export interface PlanWeek {
  n: number
  title: string
  /** Thème de la banque de questions travaillé cette semaine ; `null` pour les examens blancs. */
  theme: string | null
  emoji: string
}

export const PLAN_LENGTH_DAYS = 56
/** Seuil de l'examen officiel : 35 bonnes réponses sur 40. */
export const PASS_RATIO = 35 / 40

export const PLAN_WEEKS: PlanWeek[] = [
  { n: 1, title: 'Signalisation', theme: 'Signalisation', emoji: '🚸' },
  { n: 2, title: 'Priorités & croisements', theme: 'Priorités', emoji: '🔀' },
  { n: 3, title: 'Vitesse & distances', theme: 'Vitesse', emoji: '⚡' },
  { n: 4, title: 'Conduite & manœuvres', theme: 'Conduite', emoji: '🚗' },
  { n: 5, title: 'Autres usagers & partage', theme: 'Autres usagers', emoji: '🚴' },
  { n: 6, title: 'Sécurité, secours, mécanique', theme: 'Sécurité', emoji: '🛠' },
  { n: 7, title: 'Environnement & réglementation', theme: 'Administratif', emoji: '📄' },
  { n: 8, title: 'Examens blancs', theme: null, emoji: '🏁' },
]

export const THEME_EMOJI: Record<string, string> = Object.fromEntries(
  PLAN_WEEKS.filter((w) => w.theme).map((w) => [w.theme!, w.emoji]),
)

/** Le plan se termine le jour de l'examen : 8 semaines de 7 jours avant cette date. */
export function planState(examDate: string, today: string) {
  const start = addDays(examDate, -PLAN_LENGTH_DAYS)
  const elapsed = daysBetween(start, today)
  return {
    start,
    daysLeft: daysBetween(today, examDate),
    /** 0 = le plan n'a pas commencé, 1 à 8 = semaine en cours. */
    week: elapsed < 0 ? 0 : Math.min(8, Math.floor(elapsed / 7) + 1),
    progress: Math.max(0, Math.min(1, elapsed / PLAN_LENGTH_DAYS)),
    weekStart: (n: number) => addDays(start, 7 * (n - 1)),
  }
}

/** Nombre de bonnes réponses exigé pour un total donné (35 sur 40, proportionnel sinon). */
export const passMark = (total: number) => Math.ceil(total * PASS_RATIO)
