import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { computeDayStats, useProgress } from '../../db/stats'
import { useProfile } from '../../db/profile'
import { isoDate } from '../../lib/date'
import Screen from '../../components/Screen'

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const DAY_LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

/** Toutes les dates ISO d'un mois (`ym` = « 2026-09 »). */
function monthDates(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`)
}

function shiftMonth(ym: string, by: number) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + by, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function Calendar() {
  const today = isoDate()
  const thisMonth = today.slice(0, 7)
  const [month, setMonth] = useState(thisMonth)
  const [selected, setSelected] = useState(today)
  const profile = useProfile()
  const progress = useProgress()

  const dates = monthDates(month)
  const stats = useLiveQuery(
    () => computeDayStats(dates, profile),
    [month, profile.waterMl, profile.steps],
  )

  if (!stats) return null

  // Lundi en premier : getDay() vaut 0 le dimanche.
  const offset = (new Date(dates[0] + 'T12:00:00').getDay() + 6) % 7
  const perfect = stats.filter((s) => s.total > 0 && s.done === s.total).length
  const sel = stats.find((s) => s.date === selected)

  const cellStyle = (done: number, total: number, tracked: boolean) => {
    if (!tracked) return 'text-ink-300'
    if (total > 0 && done === total) return 'bg-violet text-white'
    if (done > 0) return 'bg-violet-pale text-[#4A3D7A]'
    return 'bg-ink-100 text-ink-300'
  }

  return (
    <Screen
      title={MONTH.format(new Date(month + '-01T12:00:00'))}
      action={
        <div className="flex gap-1 text-violet">
          <button
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="Mois précédent"
            className="h-10 w-10 rounded-chip text-[20px]"
          >
            ‹
          </button>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={month >= thisMonth}
            aria-label="Mois suivant"
            className="h-10 w-10 rounded-chip text-[20px] disabled:opacity-30"
          >
            ›
          </button>
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex-1 rounded-tile bg-gradient-to-br from-violet to-violet-light p-4 text-white">
          <p className="font-display text-[22px] font-bold">{perfect}</p>
          <p className="mt-0.5 text-micro text-white/85">journées parfaites</p>
        </div>
        <div className="tile flex-1">
          <p className="font-display text-[22px] font-bold text-ember">🔥{progress?.streak ?? 0}</p>
          <p className="mt-0.5 text-micro text-ink-500">série en cours</p>
        </div>
      </div>

      <section className="mt-5 rounded-card bg-card p-4 shadow-card">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10.5px] font-semibold text-ink-300">
          {WEEK.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-1.5">
          {Array.from({ length: offset }, (_, i) => (
            <div key={`o${i}`} />
          ))}
          {stats.map((s) => {
            const isToday = s.date === today
            const isSel = s.date === selected
            return (
              <button
                key={s.date}
                onClick={() => setSelected(s.date)}
                aria-label={DAY_LONG.format(new Date(s.date + 'T12:00:00'))}
                aria-pressed={isSel}
                className={`flex aspect-square items-center justify-center rounded-[9px] text-meta font-semibold ${cellStyle(
                  s.done,
                  s.total,
                  s.tracked,
                )} ${isToday ? 'outline outline-2 outline-offset-1 outline-lime' : ''} ${
                  isSel ? 'ring-2 ring-ink-900 ring-offset-1' : ''
                }`}
              >
                {Number(s.date.slice(8))}
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-4 flex items-center justify-center gap-4 text-micro text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[5px] bg-violet" />
          Tout fait
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[5px] bg-violet-pale" />
          En partie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[5px] bg-ink-100" />
          Manqué
        </span>
      </div>

      <section className="tile mt-5">
        <p className="label first-letter:uppercase">{DAY_LONG.format(new Date(selected + 'T12:00:00'))}</p>
        {sel && sel.tracked ? (
          <>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {sel.items.map((it, i) => (
                <span
                  key={i}
                  className={`rounded-full px-3 py-1.5 text-meta ${
                    it.done ? 'bg-violet-soft font-semibold text-violet' : 'bg-page text-ink-300'
                  }`}
                >
                  {it.emoji} {it.label}
                  {it.done ? ' ✓' : ''}
                </span>
              ))}
            </div>
            <p className="mt-3 text-micro text-ink-500">
              {sel.done} sur {sel.total} · +{sel.xp} XP
            </p>
          </>
        ) : (
          <p className="mt-2 text-body text-ink-500">Rien à afficher pour ce jour.</p>
        )}
      </section>
    </Screen>
  )
}
