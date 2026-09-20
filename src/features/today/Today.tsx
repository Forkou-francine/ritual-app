import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db, GLASS_ML } from '../../db/db'
import { getOrCreateLog, patchLog } from '../../db/seed'
import { bumpHabit, isComplete, isScheduled, toggleHabit } from '../../db/habits'
import { formatLitres, glassesFor, useProfile } from '../../db/profile'
import { formatLong, isoDate, lastNDates } from '../../lib/date'
import { SESSION_TITLES } from '../../data/exercises'
import type { Weekday } from '../../db/types'
import Screen from '../../components/Screen'
import Icon from '../../components/Icon'

export default function Today() {
  const today = isoDate()
  const weekday = new Date().getDay() as Weekday
  const profile = useProfile()
  const GLASSES = glassesFor(profile.waterMl)

  // Dexie interdit d'écrire dans un liveQuery : on lit ici, on crée la ligne dans l'effet.
  const log = useLiveQuery(() => db.dailyLogs.get({ date: today }), [today])
  useEffect(() => {
    getOrCreateLog(today)
  }, [today])

  const streak = useLiveQuery(async () => {
    const logs = await db.dailyLogs.where('date').anyOf(lastNDates(60)).toArray()
    const byDate = new Map(logs.map((l) => [l.date, l]))
    let n = 0
    for (const d of lastNDates(60).reverse()) {
      const l = byDate.get(d)
      if (l && (l.workoutDone || l.waterMl >= profile.waterMl || l.steps >= profile.steps)) n++
      else if (d !== today) break
    }
    return n
  }, [today, profile.waterMl, profile.steps])
  const dueCount = useLiveQuery(() => db.questions.where('dueDate').belowOrEqual(today).count(), [today])
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray())
  const habitEntries = useLiveQuery(() => db.habitEntries.where('date').equals(today).toArray(), [today])

  if (!log) return null

  const todayHabits = (habits ?? []).filter((h) => isScheduled(h, today))
  const entryFor = (habitId: number) => (habitEntries ?? []).find((e) => e.habitId === habitId)
  const habitsDone = todayHabits.filter((h) => isComplete(h, entryFor(h.id!))).length

  const glassesDrunk = Math.round(log.waterMl / GLASS_ML)
  const setGlasses = (n: number) => patchLog(today, { waterMl: Math.max(0, n) * GLASS_ML })

  const goals = [log.waterMl >= profile.waterMl, log.steps >= profile.steps, log.workoutDone]
  const goalsDone = goals.filter(Boolean).length
  const goalsPct = Math.round((goalsDone / goals.length) * 100)

  return (
    <Screen
      eyebrow={formatLong(today)}
      title={profile.name ? `Bonjour ${profile.name} 👋` : 'Bonjour 👋'}
      action={
        <Link
          to="/moi"
          aria-label="Mon profil"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-tile bg-gradient-to-br from-violet to-violet-light text-[24px]"
        >
          {profile.avatar}
        </Link>
      }
    >
      {/* Carte d'objectifs : équivalent de la barre d'XP de la maquette */}
      <section className="card-hero">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-white/20 font-display text-[17px] font-bold">
              {goalsDone}
            </span>
            <div>
              <p className="font-display text-lead font-bold">
                {goalsDone === 3 ? 'Journée complète' : 'Objectifs du jour'}
              </p>
              <p className="text-meta text-white/80">{goalsDone} sur 3 · eau, pas, séance</p>
            </div>
          </div>
          <span className="text-[20px]">{goalsDone === 3 ? '🎉' : '🔥'}</span>
        </div>
        <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-lime transition-[width]"
            style={{ width: `${goalsPct}%` }}
          />
        </div>
      </section>

      {/* Trio de statistiques */}
      <div className="mt-3.5 flex gap-3">
        <div className="tile flex-1">
          <p className="font-display text-stat font-bold text-ember">{streak ?? 0}</p>
          <p className="mt-0.5 text-micro text-ink-500">jours de série</p>
        </div>
        <div className="tile flex-1">
          <p className="font-display text-stat font-bold text-violet">
            {glassesDrunk}
            <span className="text-meta text-ink-300">/{GLASSES}</span>
          </p>
          <p className="mt-0.5 text-micro text-ink-500">verres bus</p>
        </div>
        <div className="tile flex-1">
          <p className="font-display text-stat font-bold text-grass">{dueCount ?? 0}</p>
          <p className="mt-0.5 text-micro text-ink-500">à réviser</p>
        </div>
      </div>

      {/* Suivi saisissable */}
      <div className="mt-3.5 grid grid-cols-2 gap-3">
        <section className="tile">
          <h2 className="text-micro text-ink-500">Eau</h2>
          <p className="mt-0.5 font-display text-stat font-bold text-violet">
            {(log.waterMl / 1000).toFixed(1).replace('.', ',')}
            <span className="text-meta text-ink-300"> / {formatLitres(profile.waterMl)} L</span>
          </p>
          <div className="mt-2.5 flex gap-1" role="group" aria-label="Verres bus">
            {Array.from({ length: GLASSES }, (_, i) => (
              <button
                key={i}
                aria-label={`Marquer ${i + 1} verre${i > 0 ? 's' : ''}`}
                onClick={() => setGlasses(glassesDrunk === i + 1 ? i : i + 1)}
                className={`h-2.5 flex-1 rounded-full transition-colors ${
                  i < glassesDrunk ? 'bg-violet' : 'bg-ink-100'
                }`}
              />
            ))}
          </div>
        </section>

        <section className="tile">
          <h2 className="text-micro text-ink-500">Pas</h2>
          <label className="sr-only" htmlFor="steps">
            Nombre de pas
          </label>
          <input
            id="steps"
            type="number"
            inputMode="numeric"
            value={log.steps || ''}
            placeholder="0"
            onChange={(e) => patchLog(today, { steps: Number(e.target.value) || 0 })}
            className="mt-0.5 w-full bg-transparent font-display text-stat font-bold text-grass outline-none placeholder:text-ink-300"
          />
          <div className="mt-2.5 h-2.5 rounded-full bg-ink-100">
            <div
              className="h-2.5 rounded-full bg-lime transition-[width]"
              style={{ width: `${Math.min(100, Math.round((log.steps / profile.steps) * 100))}%` }}
            />
          </div>
        </section>
      </div>

      {/* Quêtes du jour */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lead font-bold">Quêtes du jour</h2>
        <span className="text-meta text-violet">
          {goalsDone + habitsDone} sur {3 + todayHabits.length}
        </span>
      </div>

      <div className="mt-3.5 flex flex-col gap-3">
        <Link
          to="/seance"
          className={`flex items-center gap-3.5 rounded-card bg-card p-4 shadow-soft ${
            log.workoutDone ? '' : 'border-[1.5px] border-violet shadow-ring'
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-chip font-bold ${
              log.workoutDone ? 'bg-lime text-lime-ink' : 'border-2 border-violet'
            }`}
          >
            {log.workoutDone ? '✓' : <Icon name="barbell" size={16} />}
          </span>
          <span className="flex-1">
            <span
              className={`block text-body font-semibold ${
                log.workoutDone ? 'text-ink-300 line-through' : ''
              }`}
            >
              {SESSION_TITLES[weekday]}
            </span>
            <span className={`block text-micro ${log.workoutDone ? 'text-grass' : 'text-ink-500'}`}>
              {log.workoutDone ? 'séance terminée' : 'séance du jour · à faire'}
            </span>
          </span>
          <span className="chip bg-page text-ink-500">🔥{streak ?? 0}</span>
        </Link>

        <Link to="/code" className="flex items-center gap-3.5 rounded-card bg-card p-4 shadow-soft">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-violet-soft text-violet">
            <Icon name="car" size={16} />
          </span>
          <span className="flex-1">
            <span className="block text-body font-semibold">Code de la route</span>
            <span className="block text-micro text-ink-500">révision espacée</span>
          </span>
          <span className="chip bg-violet-soft text-violet">{dueCount ?? 0} à revoir</span>
        </Link>

        {todayHabits.map((h) => {
          const entry = entryFor(h.id!)
          const complete = isComplete(h, entry)
          const value = entry?.value ?? 0
          return (
            <div
              key={h.id}
              className={`flex items-center gap-3.5 rounded-card bg-card p-4 shadow-soft ${
                complete ? '' : 'border-[1.5px] border-violet shadow-ring'
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-violet-soft text-[17px]">
                {h.emoji}
              </span>
              <Link to="/moi" className="flex-1">
                <span className={`block text-body font-semibold ${complete ? 'text-ink-300 line-through' : ''}`}>
                  {h.name}
                </span>
                <span className={`block text-micro ${complete ? 'text-grass' : 'text-ink-500'}`}>
                  {h.kind === 'count'
                    ? `${value} / ${h.goal ?? 1} ${h.unit ?? ''}`.trim()
                    : complete
                      ? 'fait aujourd’hui'
                      : 'à faire'}
                  {h.note ? ` · ${h.note}` : ''}
                </span>
              </Link>
              {h.kind === 'count' ? (
                <button
                  onClick={() => bumpHabit(h.id!, today, h.step ?? 1)}
                  aria-label={`Ajouter ${h.step ?? 1} ${h.unit ?? ''} à ${h.name}`}
                  className="flex h-9 shrink-0 items-center gap-1 rounded-chip bg-violet px-3 text-micro font-semibold text-white"
                >
                  <Icon name="plus" size={14} />
                  {h.step ?? 1}
                </button>
              ) : (
                <button
                  onClick={() => toggleHabit(h.id!, today)}
                  aria-label={`Marquer ${h.name}`}
                  aria-pressed={complete}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-chip font-bold ${
                    complete ? 'bg-lime text-lime-ink' : 'border-2 border-violet text-violet'
                  }`}
                >
                  {complete ? '✓' : ''}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </Screen>
  )
}
