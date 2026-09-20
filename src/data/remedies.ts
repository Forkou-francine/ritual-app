import type { Remedy } from '../db/types'

export const remedySeed: Omit<Remedy, 'id'>[] = [
  { name: 'Hydratation', symptoms: ['tête', 'fatigue'], howTo: 'Un grand verre d\u2019eau, puis 20 minutes au calme avant de reprendre.', icon: 'droplet' },
  { name: 'Compresse froide', symptoms: ['tête', 'muscles'], howTo: 'Sur le front ou la nuque, 15 minutes maximum, jamais à même la peau.', icon: 'snow' },
  { name: 'Bouillotte chaude', symptoms: ['dos', 'digestion', 'muscles'], howTo: 'Chaleur douce 20 minutes sur la zone tendue, en position allongée.', icon: 'flame' },
  { name: 'Respiration 4-7-8', symptoms: ['tête', 'sommeil', 'stress'], howTo: 'Inspirer 4 s, retenir 7 s, expirer 8 s. Quatre cycles, pas davantage au début.', icon: 'wind' },
  { name: 'Auto-massage des tempes', symptoms: ['tête', 'stress'], howTo: 'Mouvements circulaires lents du bout des doigts pendant 2 minutes.', icon: 'hand' },
  { name: 'Infusion gingembre-citron', symptoms: ['digestion', 'gorge'], howTo: 'Quelques rondelles de gingembre frais infusées 10 minutes, jus de citron ajouté hors du feu.', icon: 'cup' },
  { name: 'Étirement du psoas', symptoms: ['dos'], howTo: 'Fente genou au sol, bassin poussé vers l\u2019avant, 2 minutes de chaque côté.', icon: 'stretch' },
  { name: 'Marche lente', symptoms: ['digestion', 'stress', 'dos'], howTo: 'Dix à quinze minutes après le repas, rythme confortable.', icon: 'walk' },
  { name: 'Écran coupé et lumière tamisée', symptoms: ['sommeil', 'tête'], howTo: 'Une heure avant le coucher, baisser la lumière et poser le téléphone hors de la chambre.', icon: 'moon' },
  { name: 'Bain de pieds tiède', symptoms: ['sommeil', 'muscles'], howTo: 'Dix minutes, eau à environ 37 °C, une poignée de sel d\u2019Epsom si disponible.', icon: 'bath' },
]

export const SYMPTOMS = ['tête', 'dos', 'digestion', 'sommeil', 'muscles', 'stress', 'gorge', 'fatigue']
