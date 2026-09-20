import { useLiveQuery } from 'dexie-react-hooks'
import { db, GLASS_ML, GOALS } from './db'

/** Informations personnelles, stockées comme réglages clé/valeur. */
export interface Profile {
  name: string
  avatar: string
  waterMl: number
  steps: number
}

export const PROFILE_AVATARS = ['🙂', '😎', '🌸', '🐱', '🦊', '🌿', '⭐', '🔥']

export const DEFAULT_PROFILE: Profile = {
  name: '',
  avatar: '🙂',
  waterMl: GOALS.waterMl,
  steps: GOALS.steps,
}

const KEYS = {
  name: 'profileName',
  avatar: 'profileAvatar',
  waterMl: 'goalWaterMl',
  steps: 'goalSteps',
} as const

function fromRows(rows?: { key: string; value: number | string }[]): Profile {
  if (!rows) return DEFAULT_PROFILE
  const map = new Map(rows.map((r) => [r.key, r.value]))
  const num = (k: string, fallback: number) => {
    const v = Number(map.get(k))
    return Number.isFinite(v) && v > 0 ? v : fallback
  }
  return {
    name: String(map.get(KEYS.name) ?? DEFAULT_PROFILE.name),
    avatar: String(map.get(KEYS.avatar) ?? DEFAULT_PROFILE.avatar),
    waterMl: num(KEYS.waterMl, DEFAULT_PROFILE.waterMl),
    steps: num(KEYS.steps, DEFAULT_PROFILE.steps),
  }
}

/** Lecture réactive : tout écran qui l'utilise se met à jour à l'enregistrement. */
export function useProfile(): Profile {
  const rows = useLiveQuery(() => db.settings.toArray())
  return fromRows(rows)
}

export async function setProfileField<K extends keyof Profile>(field: K, value: Profile[K]) {
  await db.settings.put({ key: KEYS[field], value })
}

/** Nombre de verres correspondant à l'objectif d'eau. */
export function glassesFor(waterMl: number) {
  return Math.max(1, Math.ceil(waterMl / GLASS_ML))
}

/** Litres à la française : 2000 → « 2 », 1500 → « 1,5 ». */
export function formatLitres(ml: number) {
  return (ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1).replace('.', ',')
}
