/** Petit retour tactile (Android/Chrome). iOS ignore navigator.vibrate : sans effet, sans erreur. */
const PATTERNS = { tap: 8, good: [10, 40, 14], bad: [30, 40, 30] } as const

export function haptic(kind: keyof typeof PATTERNS = 'tap') {
  try {
    navigator.vibrate?.(PATTERNS[kind] as number | number[])
  } catch {
    /* non supporté */
  }
}
