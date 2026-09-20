import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { patchLog } from '../../db/seed'
import { isoDate, formatShort, lastNDates } from '../../lib/date'
import { SESSION_TITLES } from '../../data/exercises'
import type { Equipment, Weekday } from '../../db/types'
import Screen from '../../components/Screen'

const KIT: { id: Equipment; label: string }[] = [
  { id: 'aucun', label: 'Sans matériel' },
  { id: 'halteres', label: 'Haltères' },
  { id: 'elastique', label: 'Élastique' },
]

export default function Workouts() {
  const today = isoDate()
  const [day, setDay] = useState<Weekday>(new Date().getDay() as Weekday)
  const [kit, setKit] = useState<Equipment[]>(['aucun'])
  const [done, setDone] = useState<Set<number>>(new Set())

  const exercises = useLiveQuery(
    async () => (await db.exercises.where('day').equals(day).sortBy('order')).filter((e) => kit.includes(e.equipment)),
    [day, kit],
  )
  const log = useLiveQuery(() => db.dailyLogs.get({ date: today }), [today])

  const toggleKit = (id: Equipment) =>
    setKit((k) => (k.includes(id) ? (k.length > 1 ? k.filter((x) => x !== id) : k) : [...k, id]))

  const toggleDone = (id: number) =>
    setDone((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const week = lastNDates(7)
  const total = exercises?.length ?? 0
  const doneCount = exercises?.filter((e) => done.has(e.id!)).length ?? 0

  return (
    <Screen
      hero
      title={SESSION_TITLES[day]}
      subtitle={`${total} exercice${total > 1 ? 's' : ''}`}
      action={
        <span className="chip shrink-0 bg-white/20 font-display font-bold text-white">
          {doneCount}/{total}
        </span>
      }
    >
      <div className="mb-4 flex gap-1.5">
        {week.map((d) => {
          const wd = new Date(d + 'T12:00:00').getDay() as Weekday
          return (
            <button
              key={d}
              onClick={() => setDay(wd)}
              className={`flex-1 rounded-chip py-2.5 text-micro capitalize transition-colors ${
                wd === day
                  ? 'bg-violet font-semibold text-white shadow-ring'
                  : 'bg-card text-ink-500 shadow-soft'
              }`}
            >
              {formatShort(d)}
            </button>
          )
        })}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {KIT.map((k) => (
          <button
            key={k.id}
            onClick={() => toggleKit(k.id)}
            className={`pill ${kit.includes(k.id) ? 'pill-on' : ''}`}
            aria-pressed={kit.includes(k.id)}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {exercises?.map((e) => {
          const isDone = done.has(e.id!)
          return (
            <button
              key={e.id}
              onClick={() => toggleDone(e.id!)}
              className="flex w-full items-center gap-3.5 rounded-card bg-card p-4 text-left shadow-soft"
              aria-pressed={isDone}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-chip font-bold ${
                  isDone ? 'bg-lime text-lime-ink' : 'border-2 border-ink-200'
                }`}
              >
                {isDone && '✓'}
              </span>
              <span className="flex-1">
                <span className={`block text-body font-semibold ${isDone ? 'text-ink-300 line-through' : ''}`}>
                  {e.name}
                </span>
                <span className={`block text-micro ${isDone ? 'text-grass' : 'text-ink-500'}`}>{e.detail}</span>
              </span>
              {e.seconds && (
                <span className="chip bg-page text-ink-500">{Math.round(e.seconds / 60) || 1} min</span>
              )}
            </button>
          )
        })}
        {total === 0 && (
          <p className="rounded-card bg-card p-6 text-center text-body text-ink-500 shadow-soft">
            Ajoutez du matériel pour voir des exercices.
          </p>
        )}
      </div>

      <button
        className={`btn mt-5 ${log?.workoutDone ? '' : 'btn-primary'}`}
        onClick={() => patchLog(today, { workoutDone: !log?.workoutDone })}
      >
        {log?.workoutDone ? 'Annuler la séance' : 'Terminer la séance'}
      </button>
    </Screen>
  )
}
