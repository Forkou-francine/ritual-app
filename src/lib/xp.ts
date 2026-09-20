export const XP_PER_LEVEL = 500

const LEVEL_TITLES = ['Débutant', 'Régulier', 'Constant', 'Assidu', 'Expert', 'Maître']

/** Niveau, XP dans le niveau courant et titre, à partir du total d'XP. */
export function levelFor(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  return {
    level,
    into: xp % XP_PER_LEVEL,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
  }
}

/** Barème d'XP : tout est dérivé des données existantes, rien n'est stocké. */
export const XP = { habit: 20, workout: 25, water: 15, steps: 15, answer: 2 }
