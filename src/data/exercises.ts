import type { Exercise, Weekday } from '../db/types'

export const SESSION_TITLES: Record<Weekday, string> = {
  0: 'Récupération',
  1: 'Haut du corps',
  2: 'Cardio léger',
  3: 'Bas du corps',
  4: 'Dos et mobilité',
  5: 'Corps entier',
  6: 'Endurance et gainage',
}

type Seed = Omit<Exercise, 'id' | 'order'>

const raw: Seed[] = [
  { day: 1, name: 'Pompes inclinées', detail: '3 × 10', equipment: 'aucun' },
  { day: 1, name: 'Dips sur chaise', detail: '3 × 8', equipment: 'aucun' },
  { day: 1, name: 'Gainage', detail: '3 × 40 s', equipment: 'aucun', seconds: 40 },
  { day: 1, name: 'Superman', detail: '3 × 12', equipment: 'aucun' },
  { day: 1, name: 'Développé épaules', detail: '3 × 12', equipment: 'halteres' },
  { day: 1, name: 'Tirage élastique', detail: '3 × 15', equipment: 'elastique' },

  { day: 2, name: 'Montées de genoux', detail: '4 × 45 s', equipment: 'aucun', seconds: 45 },
  { day: 2, name: 'Jumping jacks', detail: '4 × 40 s', equipment: 'aucun', seconds: 40 },
  { day: 2, name: 'Fentes marchées', detail: '3 × 20', equipment: 'aucun' },
  { day: 2, name: 'Mountain climbers', detail: '3 × 30 s', equipment: 'aucun', seconds: 30 },
  { day: 2, name: 'Swings haltère', detail: '3 × 15', equipment: 'halteres' },

  { day: 3, name: 'Squats', detail: '4 × 15', equipment: 'aucun' },
  { day: 3, name: 'Fentes arrière', detail: '3 × 12 par jambe', equipment: 'aucun' },
  { day: 3, name: 'Pont fessier', detail: '3 × 15', equipment: 'aucun' },
  { day: 3, name: 'Mollets debout', detail: '3 × 20', equipment: 'aucun' },
  { day: 3, name: 'Squat goblet', detail: '4 × 12', equipment: 'halteres' },
  { day: 3, name: 'Abduction élastique', detail: '3 × 20', equipment: 'elastique' },

  { day: 4, name: 'Chat-vache', detail: '2 min', equipment: 'aucun', seconds: 120 },
  { day: 4, name: 'Bird dog', detail: '3 × 10 par côté', equipment: 'aucun' },
  { day: 4, name: 'Gainage latéral', detail: '3 × 30 s', equipment: 'aucun', seconds: 30 },
  { day: 4, name: 'Ouverture thoracique', detail: '3 min', equipment: 'aucun', seconds: 180 },
  { day: 4, name: 'Tirage bras tendus', detail: '3 × 15', equipment: 'elastique' },

  { day: 5, name: 'Burpees', detail: '3 × 8', equipment: 'aucun' },
  { day: 5, name: 'Squats sautés', detail: '3 × 12', equipment: 'aucun' },
  { day: 5, name: 'Pompes', detail: '3 × 10', equipment: 'aucun' },
  { day: 5, name: 'Gainage dynamique', detail: '3 × 40 s', equipment: 'aucun', seconds: 40 },
  { day: 5, name: 'Soulevé de terre haltères', detail: '3 × 12', equipment: 'halteres' },

  { day: 6, name: 'Marche rapide', detail: '35 min', equipment: 'aucun', seconds: 2100 },
  { day: 6, name: 'Gainage', detail: '3 × 45 s', equipment: 'aucun', seconds: 45 },
  { day: 6, name: 'Relevés de jambes', detail: '3 × 15', equipment: 'aucun' },
  { day: 6, name: 'Rotation buste élastique', detail: '3 × 15', equipment: 'elastique' },

  { day: 0, name: 'Étirement ischio-jambiers', detail: '3 min', equipment: 'aucun', seconds: 180 },
  { day: 0, name: 'Posture de l\u2019enfant', detail: '2 min', equipment: 'aucun', seconds: 120 },
  { day: 0, name: 'Étirement psoas', detail: '2 min par côté', equipment: 'aucun', seconds: 120 },
  { day: 0, name: 'Respiration 4-7-8', detail: '4 cycles', equipment: 'aucun', seconds: 120 },
]

export const exerciseSeed: Omit<Exercise, 'id'>[] = raw.map((e, i) => ({ ...e, order: i }))
