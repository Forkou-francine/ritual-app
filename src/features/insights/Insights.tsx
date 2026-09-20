import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'
import { habitStats } from '../../db/habits'
import { useProgress, type DayStat } from '../../db/stats'
import { isoDate } from '../../lib/date'
import { XP_PER_LEVEL } from '../../lib/xp'
import Screen from '../../components/Screen'

const WEEKDAY = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' })
const LETTER = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

/** Moyenne des quêtes réussies sur les jours suivis, en %. */
function score(days: DayStat[]) {
  const tracked = days.filter((d) => d.tracked && d.total > 0)
  if (tracked.length === 0) return null
  return Math.round((tracked.reduce((n, d) => n + d.done / d.total, 0) / tracked.length) * 100)
}

export default function Insights() {
  const today = isoDate()
  const progress = useProgress()

  const topHabit = useLiveQuery(async () => {
    const habits = await db.habits.orderBy('order').toArray()
    const all = await Promise.all(habits.map(async (h) => ({ h, s: await habitStats(h, today) })))
    return all.filter((x) => x.s.streak > 0).sort((a, b) => b.s.streak - a.s.streak)[0] ?? null
  }, [today])

  if (!progress) return null

  const { stats } = progress
  const last28 = stats.slice(-28)
  const prev28 = stats.slice(-56, -28)
  const current = score(last28)
  const previous = score(prev28)
  const delta = current !== null && previous !== null ? current - previous : null

  const week = stats.slice(-7)
  const weekXp = week.reduce((n, d) => n + d.xp, 0)
  const maxXp = Math.max(1, ...week.map((d) => d.xp))
  const bestXpDate = week.find((d) => d.xp === maxXp && maxXp > 1)?.date

  // Meilleur et pire jour de la semaine, sur les 4 dernières semaines.
  const byWeekday = Array.from({ length: 7 }, (_, wd) => {
    const days = last28.filter((d) => d.tracked && d.total > 0 && new Date(d.date + 'T12:00:00').getDay() === wd)
    return { wd, days: days.length, pct: score(days) }
  }).filter((x) => x.days > 0 && x.pct !== null)
  const sorted = byWeekday.slice().sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
  const bestDay = sorted[0]
  const worstDay = sorted.length > 1 ? sorted[sorted.length - 1] : undefined
  const dayName = (wd: number) => WEEKDAY.format(new Date(2024, 0, 7 + wd, 12))

  return (
    <Screen title="Bilan" subtitle="4 dernières semaines">
      <section className="rounded-card bg-gradient-to-br from-violet to-violet-light p-5 text-white">
        <p className="text-meta tracking-[0.08em] text-white/85">SCORE DE RÉGULARITÉ</p>
        <div className="mt-1.5 flex items-end gap-2.5">
          <span className="font-display text-[44px] font-bold leading-none">{current ?? '—'}</span>
          {delta !== null && delta !== 0 && (
            <span className="mb-2 text-body text-[#D9F7A8]">
              {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} vs le mois précédent
            </span>
          )}
        </div>
        <p className="mt-3 text-micro text-white/80">
          Niveau {progress.level} · {progress.into} / {XP_PER_LEVEL} XP · {progress.xp} XP au total
        </p>
      </section>

      <section className="card-lg mt-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-body font-bold">XP cette semaine</h2>
          <span className="text-meta font-semibold text-grass">+{weekXp} XP</span>
        </div>
        <div className="mt-4 flex h-24 items-end justify-between gap-2">
          {week.map((d) => {
            const isToday = d.date === today
            const isBest = d.date === bestXpDate
            const wd = new Date(d.date + 'T12:00:00').getDay()
            return (
              <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div
                  className={`w-full rounded-[7px] ${
                    isBest ? 'bg-lime' : isToday ? 'bg-violet' : 'bg-violet-track'
                  }`}
                  style={{ height: `${Math.max(4, Math.round((d.xp / maxXp) * 100))}%` }}
                  title={`${d.xp} XP`}
                />
                <span className={`text-[10px] ${isToday ? 'font-bold text-violet' : 'text-ink-300'}`}>
                  {LETTER[wd]}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-3.5 flex gap-3">
        <div className="tile flex-1">
          <p className="text-micro text-ink-500">Meilleur jour</p>
          <p className="mt-1 font-display text-lead font-bold capitalize">
            {bestDay ? dayName(bestDay.wd) : '—'}
          </p>
          {bestDay && <p className="mt-0.5 text-micro text-grass">{bestDay.pct} % fait</p>}
        </div>
        <div className="tile flex-1">
          <p className="text-micro text-ink-500">Habitude phare</p>
          <p className="mt-1 font-display text-lead font-bold">
            {topHabit ? `${topHabit.h.emoji} ${topHabit.h.name}` : '—'}
          </p>
          {topHabit && <p className="mt-0.5 text-micro text-ink-500">🔥 {topHabit.s.streak} jours</p>}
        </div>
      </div>

      <div className="tile mt-3.5 flex items-center gap-3.5">
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-chip bg-ember-soft text-[22px]">
          💡
        </span>
        <p className="flex-1 text-body text-ink-700">
          {bestDay && worstDay && bestDay.wd !== worstDay.wd && (bestDay.pct ?? 0) - (worstDay.pct ?? 0) >= 15 ? (
            <>
              Vous réussissez <b>{bestDay.pct} %</b> de vos quêtes le {dayName(bestDay.wd)}, mais seulement{' '}
              <b>{worstDay.pct} %</b> le {dayName(worstDay.wd)}. Placez-y un rappel.
            </>
          ) : (
            <>Continuez à cocher vos quêtes : les conseils apparaissent après quelques semaines de données.</>
          )}
        </p>
      </div>

      <h2 className="mt-6 font-display text-lead font-bold">Badges</h2>
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {progress.badges.map((b) => (
          <div
            key={b.id}
            className={`rounded-tile p-2.5 text-center ${
              b.earned ? 'bg-card shadow-soft' : 'border-[1.5px] border-dashed border-ink-200 bg-page'
            }`}
          >
            <div className={`text-[24px] ${b.earned ? '' : 'opacity-35'}`}>{b.earned ? b.emoji : '🔒'}</div>
            <div className={`mt-1 text-[10.5px] leading-tight ${b.earned ? 'font-semibold' : 'text-ink-300'}`}>
              {b.label}
            </div>
          </div>
        ))}
      </div>

      <Link to="/calendrier" className="tile mt-6 flex items-center gap-3.5 !p-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-violet-soft text-[20px]">📅</span>
        <span className="flex-1 text-body font-semibold">Voir le calendrier du mois</span>
        <span className="text-[16px] text-violet">›</span>
      </Link>
      <Link to="/moi" className="mt-4 block text-center text-meta font-semibold text-violet">
        Gérer mes habitudes
      </Link>
    </Screen>
  )
}
