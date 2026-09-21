import type { SignId } from '../components/Sign'

export interface LessonSection {
  emoji: string
  title: string
  points: string[]
}

export interface Lesson {
  theme: string
  /** Une phrase qui donne l'enjeu du thème. */
  intro: string
  /** Panneaux à reconnaître, avec leur légende. */
  signs?: { id: SignId; label: string }[]
  /** Chiffres à connaître par cœur. */
  keyFacts: { value: string; label: string }[]
  sections: LessonSection[]
  remember: string
  /** Lien vers une situation dessinée (voir Scene). */
  scene?: string
  minutes: number
}

/**
 * Fiches rédigées d'après le Code de la route en vigueur. Les règles et les chiffres
 * évoluent : à recouper avec Légifrance ou la sécurité routière avant l'examen.
 */
export const LESSONS: Lesson[] = [
  {
    theme: 'Signalisation',
    intro: 'La forme et la couleur d’un panneau disent déjà l’essentiel, avant même de lire le symbole.',
    signs: [
      { id: 'danger', label: 'Triangle : danger' },
      { id: 'cedez', label: 'Cédez le passage' },
      { id: 'stop', label: 'Arrêt obligatoire' },
      { id: 'sens-interdit', label: 'Sens interdit' },
      { id: 'limite50', label: 'Interdiction : limite de vitesse' },
      { id: 'obligation', label: 'Rond bleu : obligation' },
    ],
    keyFacts: [
      { value: '▲', label: 'triangle = danger' },
      { value: '●', label: 'rond rouge = interdiction' },
      { value: '●', label: 'rond bleu = obligation' },
    ],
    sections: [
      {
        emoji: '🔺',
        title: 'Formes et couleurs',
        points: [
          'Triangle à bordure rouge : un danger est signalé plus loin.',
          'Rond à bordure rouge : une interdiction ou une limitation (vitesse, dépassement, stationnement).',
          'Rond bleu : une obligation (direction à suivre, vitesse minimale).',
          'Carré ou rectangle bleu : une indication (parking, passage pour piétons, agglomération).',
          'Triangle pointe en bas : cédez le passage. Octogone rouge : stop.',
        ],
      },
      {
        emoji: '〰️',
        title: 'Lignes sur la chaussée',
        points: [
          'Ligne continue : il est interdit de la franchir ou de la chevaucher, y compris pour dépasser.',
          'Ligne discontinue : franchissement permis si la manœuvre reste sûre.',
          'Une ligne continue à droite du véhicule marque le bord de la chaussée.',
          'Le stop s’accompagne d’une ligne continue au sol : l’arrêt se fait derrière, pas au-delà.',
        ],
      },
      {
        emoji: '🚦',
        title: 'Feux tricolores',
        points: [
          'Rouge : arrêt derrière la ligne. Vert : passage, en restant attentif aux piétons.',
          'Orange fixe : arrêt, sauf si vous ne pouvez plus vous arrêter dans de bonnes conditions de sécurité.',
          'Orange clignotant : prudence. Les règles de priorité habituelles s’appliquent.',
        ],
      },
      {
        emoji: '👮',
        title: 'Qui a le dernier mot ?',
        points: [
          'Ordre de priorité des consignes : agent de circulation, puis feux, puis panneaux, puis règles générales.',
          'Si un agent vous fait signe de passer alors que le feu est rouge, vous obéissez à l’agent.',
        ],
      },
    ],
    remember: 'Forme = nature du message. Rouge interdit ou prévient, bleu impose ou indique.',
    minutes: 4,
  },
  {
    theme: 'Priorités',
    intro: 'Savoir qui passe en premier évite la majorité des accidents en intersection.',
    signs: [
      { id: 'priorite-droite', label: 'Priorité à droite' },
      { id: 'cedez', label: 'Cédez le passage' },
      { id: 'stop', label: 'Stop' },
      { id: 'route-prioritaire', label: 'Route prioritaire' },
      { id: 'rond-point', label: 'Rond-point' },
    ],
    keyFacts: [
      { value: 'Droite', label: 'sans signalisation' },
      { value: 'Anneau', label: 'prioritaire au rond-point' },
      { value: '4', label: 'niveaux de consignes' },
    ],
    scene: 'carrefour',
    sections: [
      {
        emoji: '➡️',
        title: 'La priorité à droite',
        points: [
          'Sans panneau ni marquage, vous cédez le passage au véhicule qui vient de votre droite.',
          'La règle vaut pour tous les usagers : voitures, deux-roues, cyclistes.',
          'Elle ne s’applique pas si un panneau (cédez le passage, stop, route prioritaire) en décide autrement.',
        ],
      },
      {
        emoji: '🛑',
        title: 'Cédez le passage et stop',
        points: [
          'Cédez le passage : vous ralentissez, vous laissez passer les véhicules de la route prioritaire, et vous vous arrêtez si nécessaire.',
          'Stop : arrêt complet et obligatoire à la ligne, même si la voie paraît libre.',
          'Route prioritaire (losange jaune) : vous n’avez pas à céder aux carrefours jusqu’au panneau de fin.',
        ],
      },
      {
        emoji: '🔄',
        title: 'Rond-point',
        points: [
          'En général, un « cédez le passage » à l’entrée : les véhicules déjà sur l’anneau passent en premier.',
          'Vous entrez sans clignotant, vous le mettez à droite avant la sortie que vous prenez.',
          'Ne vous arrêtez pas sur l’anneau : vous bloqueriez les autres usagers.',
        ],
      },
      {
        emoji: '🚑',
        title: 'Cas particuliers',
        points: [
          'Véhicule de secours avec sirène et gyrophare : vous vous rangez et vous vous arrêtez si nécessaire.',
          'Piéton régulièrement engagé sur la chaussée : vous lui cédez le passage, y compris en tournant.',
          'Tramway : il est prioritaire aux intersections, sauf si la signalisation dit le contraire.',
          'Ne vous engagez jamais dans une intersection si vous risquez d’y rester bloqué.',
        ],
      },
    ],
    remember: 'Un panneau ou un feu remplace toujours la priorité à droite. Sans rien, on cède à droite.',
    minutes: 5,
  },
  {
    theme: 'Vitesse',
    intro: 'La vitesse est la première cause de gravité des accidents. Les limites s’abaissent quand les conditions se dégradent.',
    signs: [
      { id: 'agglo', label: 'Entrée d’agglomération' },
      { id: 'limite80', label: '80 km/h' },
      { id: 'limite130', label: '130 km/h' },
    ],
    keyFacts: [
      { value: '50', label: 'km/h en agglomération' },
      { value: '80', label: 'km/h route à double sens' },
      { value: '130', label: 'km/h autoroute' },
    ],
    sections: [
      {
        emoji: '📏',
        title: 'Limites générales',
        points: [
          'En agglomération : 50 km/h, sauf panneau contraire (zone 30, par exemple).',
          'Hors agglomération, route à double sens sans séparateur central : 80 km/h.',
          'Route à chaussées séparées par un terre-plein : 110 km/h. Autoroute : 130 km/h.',
        ],
      },
      {
        emoji: '🌧️',
        title: 'Pluie, brouillard, permis probatoire',
        points: [
          'Pluie ou autres précipitations : 110 km/h sur autoroute, 100 km/h sur route à chaussées séparées, 70 km/h sur route à double sens.',
          'Visibilité inférieure à 50 mètres : 50 km/h partout.',
          'Permis probatoire : 110 km/h sur autoroute. Ailleurs, les limites générales s’appliquent.',
        ],
      },
      {
        emoji: '🛞',
        title: 'Distance d’arrêt',
        points: [
          'Distance d’arrêt = distance de réaction + distance de freinage.',
          'Pendant la seconde de réaction, vous parcourez environ 14 m à 50 km/h, 25 m à 90 km/h et 36 m à 130 km/h.',
          'Quand la vitesse double, la distance de freinage est multipliée par quatre.',
          'Sur route mouillée, la distance de freinage augmente fortement (jusqu’à doubler).',
        ],
      },
      {
        emoji: '⚠️',
        title: 'Excès de vitesse',
        points: [
          'Les sanctions croissent avec l’excès : amende et retrait jusqu’à 6 points.',
          'À partir de 50 km/h au-dessus de la limite, c’est un délit : suspension voire annulation du permis possibles.',
        ],
      },
    ],
    remember: '50 en ville, 80 sur route, 110 sur voie rapide, 130 sur autoroute, moins quand il pleut.',
    minutes: 4,
  },
  {
    theme: 'Conduite',
    intro: 'Bien conduire, c’est anticiper : regarder loin, signaler, garder de la marge.',
    signs: [
      { id: 'interdit-depasser', label: 'Interdiction de dépasser' },
      { id: 'feux', label: 'Feux tricolores' },
    ],
    keyFacts: [
      { value: '2 s', label: 'distance de sécurité' },
      { value: '1 m', label: 'cycliste, en ville' },
      { value: '1,5 m', label: 'cycliste, hors ville' },
    ],
    scene: 'distance',
    sections: [
      {
        emoji: '↔️',
        title: 'Dépasser',
        points: [
          'On dépasse par la gauche, après avoir contrôlé les rétroviseurs et l’angle mort, et mis le clignotant.',
          'Interdit avant un virage sans visibilité, au sommet d’une côte, à un passage à niveau ou en franchissant une ligne continue.',
          'Cycliste : laissez au moins 1 mètre en agglomération et 1,5 mètre hors agglomération.',
          'Ne serrez pas votre droite en revenant : vous devez avoir assez dépassé pour ne pas gêner.',
        ],
      },
      {
        emoji: '⏱️',
        title: 'Distance de sécurité',
        points: [
          'Gardez au moins 2 secondes entre vous et le véhicule qui précède. Comptez à partir d’un repère fixe.',
          'Sur route mouillée ou de nuit, augmentez cet intervalle.',
        ],
      },
      {
        emoji: '💡',
        title: 'Éclairage',
        points: [
          'Feux de croisement de nuit, et de jour en cas de mauvaise visibilité.',
          'Feux de route uniquement hors agglomération, quand vous ne croisez et ne suivez personne.',
          'Antibrouillard arrière : seulement quand la visibilité est inférieure à 50 mètres.',
        ],
      },
      {
        emoji: '📵',
        title: 'Attention au volant',
        points: [
          'Téléphone tenu en main interdit, écouteurs et casque audio aussi.',
          'Signalez chaque manœuvre à l’avance : clignotant, puis regard, puis mouvement.',
          'Passage à niveau : arrêt aux feux rouges clignotants, et ne vous engagez pas si la sortie est bloquée.',
        ],
      },
    ],
    remember: 'Distance de sécurité de 2 secondes, et jamais de dépassement sans visibilité complète.',
    minutes: 5,
  },
  {
    theme: 'Autres usagers',
    intro: 'La route se partage : piétons, cyclistes et deux-roues sont plus vulnérables que vous.',
    signs: [
      { id: 'passage-pieton', label: 'Passage piéton' },
      { id: 'velo', label: 'Piste cyclable' },
    ],
    keyFacts: [
      { value: '12 ans', label: 'casque vélo obligatoire en dessous' },
      { value: '1 m', label: 'cycliste en agglomération' },
      { value: '1,5 m', label: 'cycliste hors agglomération' },
    ],
    scene: 'pieton',
    sections: [
      {
        emoji: '🚶',
        title: 'Piétons',
        points: [
          'Un piéton engagé sur un passage : vous cédez et vous vous arrêtez à distance suffisante.',
          'Cédez aussi au piéton quand vous tournez et qu’il traverse la rue que vous prenez.',
          'Vigilance aux abords des écoles, arrêts de bus et avec les personnes malvoyantes (canne blanche).',
        ],
      },
      {
        emoji: '🚴',
        title: 'Cyclistes et trottinettes',
        points: [
          'Casque obligatoire pour les moins de 12 ans, conducteur ou passager. Il reste recommandé pour tous.',
          'En dépassant : 1 m en agglomération, 1,5 m hors agglomération.',
          'Un cycliste peut rouler à côté d’un autre, et emprunter des sens interdits signalés « sauf vélos ».',
          'La trottinette électrique est limitée à 25 km/h et interdite sur le trottoir.',
        ],
      },
      {
        emoji: '🚌',
        title: 'Transports en commun',
        points: [
          'En agglomération, un autobus qui quitte son arrêt en signalant sa sortie : vous ralentissez et vous le laissez repartir.',
          'Tramway : distance et vigilance aux arrêts, priorité aux intersections sauf signalisation.',
        ],
      },
      {
        emoji: '🏍️',
        title: 'Deux-roues motorisés',
        points: [
          'Casque et gants homologués obligatoires pour le conducteur et le passager.',
          'Ils sont plus difficiles à voir : contrôlez l’angle mort et ne vous rabattez pas juste devant eux.',
        ],
      },
    ],
    remember: 'Face à un usager vulnérable, vous cédez et vous laissez de la marge.',
    minutes: 4,
  },
  {
    theme: 'Sécurité',
    intro: 'Alcool, fatigue, téléphone : la plupart des accidents graves viennent d’un comportement, pas d’une panne.',
    signs: [{ id: 'triangle-presignalisation', label: 'Triangle de présignalisation' }],
    keyFacts: [
      { value: '0,5', label: 'g/l d’alcool, conducteur confirmé' },
      { value: '0,2', label: 'g/l en permis probatoire' },
      { value: 'PAS', label: 'Protéger, Alerter, Secourir' },
    ],
    sections: [
      {
        emoji: '🍷',
        title: 'Alcool, drogues, médicaments',
        points: [
          'Limite légale : 0,5 g/l de sang (0,25 mg/l d’air expiré). En permis probatoire : 0,2 g/l (0,10 mg/l).',
          'Stupéfiants : aucune tolérance, un test positif suffit.',
          'Certains médicaments altèrent la conduite : cherchez le pictogramme (niveaux 1 à 3) et demandez conseil.',
        ],
      },
      {
        emoji: '😴',
        title: 'Fatigue',
        points: [
          'Faites une pause toutes les deux heures environ, ou au premier signe de somnolence.',
          'Bâillements, paupières lourdes, écarts de trajectoire : arrêtez-vous sans attendre.',
        ],
      },
      {
        emoji: '💺',
        title: 'Ceinture et enfants',
        points: [
          'La ceinture est obligatoire pour tous les passagers, à l’avant comme à l’arrière.',
          'Enfant de moins de 10 ans : dispositif de retenue adapté à sa taille et à son poids.',
          'Un siège dos à la route ne se place à l’avant que si l’airbag passager est désactivé.',
        ],
      },
      {
        emoji: '🚨',
        title: 'En cas d’accident',
        points: [
          'Protéger : gilet, triangle placé à environ 30 mètres, feux de détresse, occupants hors de danger.',
          'Alerter : 112 (numéro européen), 15 (SAMU), 17 (police), 18 (pompiers).',
          'Secourir : ne déplacez pas un blessé sans nécessité, ne retirez pas le casque d’un motard.',
          'Sans blessé : dégagez la chaussée si possible, remplissez un constat amiable, déclarez le sinistre sous 5 jours ouvrés.',
        ],
      },
      {
        emoji: '🛠️',
        title: 'Équipement et véhicule',
        points: [
          'À bord : un gilet de haute visibilité et un triangle de présignalisation. L’éthylotest n’est plus sanctionné.',
          'Pneus : profondeur de sculpture d’au moins 1,6 mm. Vérifiez aussi la pression et l’éclairage.',
          'Aquaplanage : levez le pied, ne freinez pas brusquement et gardez le volant droit.',
        ],
      },
    ],
    remember: 'Alcool et volant ne vont jamais ensemble. Après un accident : protéger, alerter, secourir.',
    minutes: 6,
  },
  {
    theme: 'Administratif',
    intro: 'Points, assurance, contrôle technique : les règles à connaître pour rouler en règle.',
    signs: [{ id: 'disque-a', label: 'Disque A (permis probatoire)' }],
    keyFacts: [
      { value: '12', label: 'points au permis' },
      { value: '6', label: 'points au permis probatoire' },
      { value: '4 ans', label: '1er contrôle technique' },
    ],
    sections: [
      {
        emoji: '🎫',
        title: 'Permis à points',
        points: [
          'Un permis compte 12 points. Une infraction en retire selon sa gravité ; à zéro, le permis est invalidé.',
          'Sans nouvelle infraction, les points reviennent : 6 mois pour une infraction à 1 point, 2 ans pour une contravention, 3 ans pour un délit.',
        ],
      },
      {
        emoji: '🅰️',
        title: 'Permis probatoire',
        points: [
          'Il démarre à 6 points, en gagne 2 par an sans infraction, et atteint 12 points en 3 ans (2 ans avec la conduite accompagnée).',
          'Disque A obligatoire à l’arrière du véhicule pendant cette période.',
          'Limite d’alcool à 0,2 g/l, et 110 km/h sur autoroute.',
        ],
      },
      {
        emoji: '🧾',
        title: 'Documents et assurance',
        points: [
          'À présenter sur demande : permis de conduire, carte grise, attestation d’assurance.',
          'L’assurance responsabilité civile est obligatoire, même pour un véhicule qui ne roule pas.',
        ],
      },
      {
        emoji: '🔧',
        title: 'Contrôle technique',
        points: [
          'Voiture neuve : premier contrôle dans les six mois précédant le 4e anniversaire de la mise en circulation, puis tous les 2 ans.',
          'En cas de défaillance majeure, contre-visite dans un délai de 2 mois.',
        ],
      },
      {
        emoji: '🌱',
        title: 'Environnement',
        points: [
          'Écoconduite : anticiper, éviter les accélérations brusques, respecter les limitations. Moins de carburant, moins de pollution.',
          'Vignette Crit’Air : elle classe les véhicules selon leurs émissions. Certaines zones à faibles émissions en limitent l’accès.',
          'Pics de pollution : des limitations de vitesse ou des restrictions peuvent s’appliquer.',
        ],
      },
    ],
    remember: '6 points au départ, disque A pendant 3 ans, contrôle technique dès 4 ans.',
    minutes: 4,
  },
]

export const lessonFor = (theme: string) => LESSONS.find((l) => l.theme === theme)
