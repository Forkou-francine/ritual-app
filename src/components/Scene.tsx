import type { ReactNode } from 'react'

/**
 * Schémas de situations vus de dessus, dessinés en SVG pour l'appli.
 * `revealed` affiche la solution (numéros de passage, distance) une fois la réponse validée,
 * pour que l'image n'en dise jamais trop avant.
 */
export type SceneId = 'carrefour' | 'rond-point' | 'cycliste' | 'pieton' | 'secours' | 'bus' | 'ligne' | 'distance'

const ASPHALT = '#4B4770'
const GROUND = '#E7E3FA'
const LINE = '#FFFFFF'
const LIME = '#B6F24A'
const VIOLET = '#7C5CF0'
const EMBER = '#E0662A'

/** Voiture vue de dessus, capot vers le haut avant rotation. */
function Car({ x, y, rot = 0, color = VIOLET, len = 40 }: { x: number; y: number; rot?: number; color?: string; len?: number }) {
  const h = len / 2
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-12} y={-h} width={24} height={len} rx={8} fill="#000" opacity=".14" transform="translate(2 3)" />
      <rect x={-12} y={-h} width={24} height={len} rx={8} fill={color} />
      <rect x={-8.5} y={-h + 9} width={17} height={9} rx={3} fill="#fff" opacity=".85" />
      <rect x={-8.5} y={h - 12} width={17} height={6} rx={2.5} fill="#fff" opacity=".6" />
    </g>
  )
}

function Badge({ x, y, n, color = LIME, text = '#2F4708' }: { x: number; y: number; n: string; color?: string; text?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill={color} stroke="#fff" strokeWidth={2.5} />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill={text} fontFamily="'Space Grotesk', Arial, sans-serif">
        {n}
      </text>
    </g>
  )
}

const Tag = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <text x={x} y={y} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fff" opacity=".9" fontFamily="Arial, sans-serif">
    {children}
  </text>
)

function DashedH({ y, x1 = 0, x2 = 320 }: { y: number; x1?: number; x2?: number }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={LINE} strokeWidth={2} strokeDasharray="12 10" opacity=".85" />
}
function DashedV({ x, y1 = 0, y2 = 170 }: { x: number; y1?: number; y2?: number }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={LINE} strokeWidth={2} strokeDasharray="12 10" opacity=".85" />
}

function Dimension({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  const mid = (y1 + y2) / 2
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={EMBER} strokeWidth={2.5} />
      <path d={`M${x - 4} ${y1 + 5}L${x} ${y1}L${x + 4} ${y1 + 5}M${x - 4} ${y2 - 5}L${x} ${y2}L${x + 4} ${y2 - 5}`} stroke={EMBER} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <rect x={x + 8} y={mid - 10} width={34} height={20} rx={10} fill={EMBER} />
      <text x={x + 25} y={mid + 4.5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff" fontFamily="Arial, sans-serif">
        {label}
      </text>
    </g>
  )
}

function Scenery({ id, revealed, note }: { id: SceneId; revealed: boolean; note?: string }) {
  switch (id) {
    case 'carrefour':
      return (
        <>
          <rect x={130} y={0} width={60} height={170} fill={ASPHALT} />
          <rect x={0} y={55} width={320} height={60} fill={ASPHALT} />
          <DashedV x={160} y2={55} />
          <DashedV x={160} y1={115} />
          <DashedH y={85} x2={130} />
          <DashedH y={85} x1={190} />
          <Car x={175} y={134} color={VIOLET} />
          <Car x={250} y={71} rot={-90} color={LIME} />
          <Tag x={175} y={166}>VOUS</Tag>
          {revealed ? (
            <>
              <Badge x={250} y={44} n="1" />
              <Badge x={175} y={112} n="2" color={VIOLET} text="#fff" />
            </>
          ) : (
            <Badge x={250} y={44} n="?" color="#fff" text={VIOLET} />
          )}
        </>
      )
    case 'rond-point':
      return (
        <>
          <rect x={137} y={0} width={46} height={170} fill={ASPHALT} />
          <rect x={0} y={62} width={320} height={46} fill={ASPHALT} />
          <circle cx={160} cy={85} r={56} fill={ASPHALT} />
          <circle cx={160} cy={85} r={24} fill="#CFEFA0" stroke="#fff" strokeWidth={3} />
          <Car x={172} y={138} color={VIOLET} len={34} />
          <path d="M138 128h14l-7 10Z" fill="none" stroke="#fff" strokeWidth={2} strokeLinejoin="round" opacity=".9" />
          <Car x={202} y={92} rot={-10} color={LIME} len={34} />
          <Tag x={172} y={167}>VOUS</Tag>
          {revealed ? (
            <>
              <Badge x={222} y={66} n="1" />
              <Badge x={196} y={128} n="2" color={VIOLET} text="#fff" />
            </>
          ) : (
            <Badge x={222} y={66} n="?" color="#fff" text={VIOLET} />
          )}
        </>
      )
    case 'cycliste':
      return (
        <>
          <rect x={0} y={45} width={320} height={95} fill={ASPHALT} />
          <DashedH y={90} />
          <line x1={0} y1={135} x2={320} y2={135} stroke={LINE} strokeWidth={2} opacity=".85" />
          <Car x={170} y={88} rot={90} color={VIOLET} />
          {/* cycliste vu de dessus */}
          <g transform="translate(170 124)">
            <rect x={-12} y={-2.5} width={24} height={5} rx={2.5} fill="#fff" />
            <ellipse cx={0} cy={0} rx={6} ry={8} fill={EMBER} />
            <circle cx={1} cy={0} r={4.5} fill="#F6C9A6" />
          </g>
          <line x1={150} y1={100} x2={214} y2={100} stroke="#fff" strokeWidth={1.5} strokeDasharray="3 3" opacity=".8" />
          <line x1={150} y1={116} x2={214} y2={116} stroke="#fff" strokeWidth={1.5} strokeDasharray="3 3" opacity=".8" />
          <Dimension x={205} y1={100} y2={116} label={revealed ? (note ?? '') : '?'} />
        </>
      )
    case 'pieton':
      return (
        <>
          <rect x={0} y={135} width={320} height={35} fill="#F1EEFB" />
          <rect x={0} y={45} width={320} height={90} fill={ASPHALT} />
          <DashedH y={90} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={157 + i * 0} y={50 + i * 10.5} width={46} height={6} rx={1} fill={LINE} opacity=".92" />
          ))}
          <Car x={90} y={112} rot={90} color={VIOLET} />
          <g transform="translate(180 146)">
            <ellipse cx={0} cy={0} rx={11} ry={5} fill={EMBER} />
            <circle cx={0} cy={0} r={5} fill="#F6C9A6" />
          </g>
          <path d="M180 138V116" stroke={EMBER} strokeWidth={2.5} strokeDasharray="4 4" strokeLinecap="round" />
          {revealed && <Badge x={90} y={70} n="!" color={LIME} text="#2F4708" />}
        </>
      )
    case 'secours':
      return (
        <>
          <rect x={0} y={40} width={320} height={110} fill={ASPHALT} />
          <DashedH y={88} />
          <line x1={0} y1={143} x2={320} y2={143} stroke={LINE} strokeWidth={2} opacity=".85" />
          <Car x={210} y={112} rot={90} color={VIOLET} />
          {/* ambulance */}
          <g transform="translate(90 112) rotate(90)">
            <rect x={-13} y={-25} width={26} height={50} rx={7} fill="#fff" />
            <rect x={-13} y={-4} width={26} height={7} fill="#E5484D" />
            <rect x={-9} y={-24} width={18} height={9} rx={3} fill="#9AB8E0" />
            <circle cx={-7} cy={-14} r={0} />
            <rect x={-10} y={-1} width={6} height={3} rx={1.5} fill="#E5484D" />
            <rect x={4} y={-1} width={6} height={3} rx={1.5} fill="#3B82F6" />
          </g>
          <circle cx={100} cy={100} r={22} fill="#E5484D" opacity=".16" />
          <circle cx={100} cy={124} r={22} fill="#3B82F6" opacity=".16" />
          {revealed && (
            <path d="M228 112C246 112 252 126 262 128" stroke={LIME} strokeWidth={4} strokeDasharray="6 6" strokeLinecap="round" fill="none" />
          )}
        </>
      )
    case 'bus':
      return (
        <>
          <rect x={0} y={135} width={320} height={35} fill="#F1EEFB" />
          <rect x={0} y={40} width={320} height={95} fill={ASPHALT} />
          <DashedH y={82} />
          <rect x={200} y={140} width={44} height={14} rx={4} fill={VIOLET} opacity=".25" />
          <Car x={90} y={110} rot={90} color={VIOLET} />
          {/* autobus à l'arrêt */}
          <g transform="translate(200 112) rotate(90)">
            <rect x={-14} y={-38} width={28} height={76} rx={7} fill="#F7C61B" />
            <rect x={-10} y={-33} width={20} height={10} rx={3} fill="#fff" opacity=".85" />
            <rect x={-10} y={-18} width={20} height={44} rx={3} fill="#fff" opacity=".35" />
          </g>
          <circle cx={162} cy={102} r={5} fill="#FFA31A" />
          <circle cx={162} cy={102} r={11} fill="#FFA31A" opacity=".25" />
          {revealed && <Badge x={120} y={72} n="!" color={LIME} text="#2F4708" />}
        </>
      )
    case 'ligne':
      return (
        <>
          <rect x={0} y={40} width={320} height={100} fill={ASPHALT} />
          <line x1={0} y1={90} x2={320} y2={90} stroke={LINE} strokeWidth={4} />
          <Car x={90} y={114} rot={90} color={VIOLET} />
          <Car x={190} y={114} rot={90} color="#9C97B8" />
          <path d="M112 106C132 106 132 70 168 70" stroke="#fff" strokeWidth={3} strokeDasharray="6 6" strokeLinecap="round" fill="none" />
          {revealed && (
            <g>
              <circle cx={140} cy={90} r={13} fill={EMBER} stroke="#fff" strokeWidth={2.5} />
              <path d="M134.5 84.5l11 11M145.5 84.5l-11 11" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
            </g>
          )}
        </>
      )
    case 'distance':
      return (
        <>
          <rect x={0} y={45} width={320} height={80} fill={ASPHALT} />
          <DashedH y={45} />
          <DashedH y={125} />
          <Car x={90} y={92} rot={90} color={VIOLET} />
          <Car x={230} y={92} rot={90} color="#F7C61B" />
          <line x1={112} y1={92} x2={208} y2={92} stroke="#fff" strokeWidth={2.5} />
          <path d="M116 87l-6 5 6 5M204 87l6 5-6 5" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <rect x={144} y={80} width={32} height={22} rx={11} fill={EMBER} />
          <text x={160} y={95} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff" fontFamily="Arial, sans-serif">
            {revealed ? (note ?? '') : '?'}
          </text>
        </>
      )
  }
}

export default function Scene({
  id,
  revealed = false,
  note,
  caption,
  className = '',
}: {
  id: SceneId
  revealed?: boolean
  note?: string
  caption?: string
  className?: string
}) {
  return (
    <figure className={`relative overflow-hidden rounded-card shadow-card ${className}`} style={{ background: GROUND }}>
      <svg viewBox="0 0 320 170" className="block w-full" role="img" aria-label={caption ?? 'Schéma de la situation'}>
        <Scenery id={id} revealed={revealed} note={note} />
      </svg>
      {caption && (
        <figcaption className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink-700">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
