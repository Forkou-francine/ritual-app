import type { ReactNode } from 'react'

/**
 * Panneaux dessinés en SVG : formes et couleurs de la signalisation française,
 * créés pour l'appli (aucune image externe, donc aucun droit à respecter).
 */
export type SignId =
  | 'danger'
  | 'cedez'
  | 'stop'
  | 'sens-interdit'
  | 'limite50'
  | 'limite80'
  | 'limite130'
  | 'obligation'
  | 'priorite-droite'
  | 'route-prioritaire'
  | 'rond-point'
  | 'agglo'
  | 'interdit-depasser'
  | 'feux'
  | 'passage-pieton'
  | 'velo'
  | 'triangle-presignalisation'
  | 'disque-a'

const RED = '#D6262B'
const BLUE = '#1B5BB5'
const INK = '#1B1830'
const YELLOW = '#F7C61B'

const Triangle = ({ children }: { children?: ReactNode }) => (
  <>
    <polygon points="50,9 94,86 6,86" fill="#fff" stroke={RED} strokeWidth="10" strokeLinejoin="round" />
    {children}
  </>
)

const RedRing = ({ children }: { children?: ReactNode }) => (
  <>
    <circle cx="50" cy="50" r="43" fill="#fff" stroke={RED} strokeWidth="10" />
    {children}
  </>
)

const BlueRound = ({ children }: { children?: ReactNode }) => (
  <>
    <circle cx="50" cy="50" r="45" fill={BLUE} stroke="#fff" strokeWidth="3" />
    {children}
  </>
)

const BlueSquare = ({ children }: { children?: ReactNode }) => (
  <>
    <rect x="7" y="7" width="86" height="86" rx="10" fill={BLUE} stroke="#fff" strokeWidth="3" />
    {children}
  </>
)

const Car = ({ x, y, fill }: { x: number; y: number; fill: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width="11" height="22" rx="4" fill={fill} />
    <rect x="2" y="5" width="7" height="5" rx="1.5" fill="#fff" opacity=".85" />
  </g>
)

function art(id: SignId): ReactNode {
  switch (id) {
    case 'danger':
      return (
        <Triangle>
          <rect x="46" y="34" width="8" height="26" rx="3" fill={INK} />
          <circle cx="50" cy="70" r="4.6" fill={INK} />
        </Triangle>
      )
    case 'priorite-droite':
      return (
        <Triangle>
          <rect x="47" y="30" width="6" height="46" fill={INK} />
          <rect x="24" y="47" width="52" height="6" fill={INK} />
        </Triangle>
      )
    case 'cedez':
      return <polygon points="6,14 94,14 50,91" fill="#fff" stroke={RED} strokeWidth="10" strokeLinejoin="round" />
    case 'stop':
      return (
        <>
          <polygon
            points="67.6,6 94,32.4 94,67.6 67.6,94 32.4,94 6,67.6 6,32.4 32.4,6"
            fill={RED}
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points="66,12 88,34 88,66 66,88 34,88 12,66 12,34 34,12"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          />
          <text x="50" y="59" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">
            STOP
          </text>
        </>
      )
    case 'sens-interdit':
      return (
        <>
          <circle cx="50" cy="50" r="45" fill={RED} stroke="#fff" strokeWidth="3" />
          <rect x="20" y="42" width="60" height="16" rx="2" fill="#fff" />
        </>
      )
    case 'limite50':
    case 'limite80':
    case 'limite130': {
      const n = id === 'limite50' ? '50' : id === 'limite80' ? '80' : '130'
      return (
        <RedRing>
          <text
            x="50"
            y={n.length === 3 ? 60 : 63}
            textAnchor="middle"
            fontSize={n.length === 3 ? 30 : 38}
            fontWeight="800"
            fill={INK}
            fontFamily="Arial, sans-serif"
          >
            {n}
          </text>
        </RedRing>
      )
    }
    case 'obligation':
      return (
        <BlueRound>
          <path d="M50 78V38M50 24 33 44h34Z" fill="#fff" stroke="#fff" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M50 78V40" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
        </BlueRound>
      )
    case 'route-prioritaire':
      return (
        <>
          <polygon points="50,3 97,50 50,97 3,50" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <polygon points="50,12 88,50 50,88 12,50" fill={YELLOW} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      )
    case 'rond-point':
      return (
        <BlueRound>
          {[0, 120, 240].map((r) => (
            <g key={r} transform={`rotate(${r} 50 50)`}>
              <path d="M50 24a26 26 0 0 1 22 12" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
              <path d="M76 30 72 42 62 36Z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
            </g>
          ))}
        </BlueRound>
      )
    case 'agglo':
      return (
        <>
          <rect x="4" y="22" width="92" height="56" rx="6" fill="#fff" stroke={RED} strokeWidth="6" />
          <text x="50" y="58" textAnchor="middle" fontSize="20" fontWeight="800" fill={INK} fontFamily="Arial, sans-serif">
            VILLE
          </text>
        </>
      )
    case 'interdit-depasser':
      return (
        <RedRing>
          <Car x={30} y={30} fill={RED} />
          <Car x={57} y={30} fill={INK} />
        </RedRing>
      )
    case 'feux':
      return (
        <>
          <rect x="30" y="4" width="40" height="92" rx="14" fill={INK} />
          <circle cx="50" cy="26" r="11" fill="#E5484D" />
          <circle cx="50" cy="50" r="11" fill="#F5A623" opacity=".35" />
          <circle cx="50" cy="74" r="11" fill="#5AA832" opacity=".35" />
        </>
      )
    case 'passage-pieton':
      return (
        <BlueSquare>
          <polygon points="50,20 80,74 20,74" fill="#fff" />
          <circle cx="50" cy="38" r="4.5" fill={INK} />
          <path d="M50 44v13M50 48l-7 7M50 48l7 5M50 57l-5 10M50 57l5 10" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
        </BlueSquare>
      )
    case 'velo':
      return (
        <BlueRound>
          <circle cx="34" cy="60" r="11" fill="none" stroke="#fff" strokeWidth="4" />
          <circle cx="68" cy="60" r="11" fill="none" stroke="#fff" strokeWidth="4" />
          <path d="M34 60 46 40h14l8 20M46 40l10 20h-22M42 34h8" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </BlueRound>
      )
    case 'triangle-presignalisation':
      return (
        <>
          <polygon points="50,8 94,86 6,86" fill={RED} stroke={RED} strokeWidth="6" strokeLinejoin="round" />
          <polygon points="50,30 76,76 24,76" fill="#fff" opacity=".92" />
          <polygon points="50,44 63,68 37,68" fill={RED} opacity=".85" />
        </>
      )
    case 'disque-a':
      return (
        <>
          <circle cx="50" cy="50" r="45" fill="#fff" stroke={RED} strokeWidth="6" />
          <text x="50" y="68" textAnchor="middle" fontSize="56" fontWeight="800" fill={RED} fontFamily="Arial, sans-serif">
            A
          </text>
        </>
      )
  }
}

export default function Sign({ id, size = 64, className = '' }: { id: SignId; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(27,24,48,.18))' }}
    >
      {art(id)}
    </svg>
  )
}
