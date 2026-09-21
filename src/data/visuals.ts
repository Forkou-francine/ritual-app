import type { SceneId } from '../components/Scene'
import type { SignId } from '../components/Sign'

export type Visual =
  | { kind: 'scene'; id: SceneId; note?: string; caption?: string }
  | { kind: 'sign'; id: SignId; caption?: string }

/** Illustration de chaque question, repérée par un extrait de son énoncé. */
const RULES: [string, Visual][] = [
  ['À une intersection sans panneau', { kind: 'scene', id: 'carrefour', caption: 'Vue de dessus' }],
  ['rond-point', { kind: 'scene', id: 'rond-point', caption: 'Vue de dessus' }],
  ['véhicule de secours approche', { kind: 'scene', id: 'secours', caption: 'Vue de dessus' }],
  ['sirène d’un véhicule prioritaire', { kind: 'scene', id: 'secours', caption: 'Vue de dessus' }],
  ['Un panneau triangulaire', { kind: 'sign', id: 'danger' }],
  ['Une ligne continue', { kind: 'scene', id: 'ligne', caption: 'Vue de dessus' }],
  ['En agglomération, la vitesse maximale', { kind: 'sign', id: 'agglo' }],
  ['Sur autoroute par temps de pluie', { kind: 'sign', id: 'limite130' }],
  ['permis probatoire. Sur route', { kind: 'sign', id: 'disque-a' }],
  ['Hors agglomération, quel écart latéral', { kind: 'scene', id: 'cycliste', note: '1,5 m', caption: 'Vue de dessus' }],
  ['Hors agglomération, quelle distance latérale', { kind: 'scene', id: 'cycliste', note: '1,5 m', caption: 'Vue de dessus' }],
  ['En agglomération, quelle distance latérale', { kind: 'scene', id: 'cycliste', note: '1 m', caption: 'Vue de dessus' }],
  ['distance de sécurité minimale', { kind: 'scene', id: 'distance', note: '2 s', caption: 'Vue de dessus' }],
  ['piéton s’engage', { kind: 'scene', id: 'pieton', caption: 'Vue de dessus' }],
  ['autobus quitte son arrêt', { kind: 'scene', id: 'bus', caption: 'Vue de dessus' }],
  ['Combien de points compte le permis probatoire', { kind: 'sign', id: 'disque-a' }],
  ['équipement de sécurité obligatoire', { kind: 'sign', id: 'triangle-presignalisation' }],
  ['moins de 12 ans fait du vélo', { kind: 'sign', id: 'velo' }],
]

export function visualFor(prompt: string): Visual | null {
  return RULES.find(([needle]) => prompt.includes(needle))?.[1] ?? null
}
