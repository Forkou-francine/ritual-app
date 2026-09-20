import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../../db/db'
import { bumpHabit, isComplete, isScheduled, setHabitNote, setHabitValue, toggleHabit } from '../../db/habits'
import { PROFILE_AVATARS, setProfileField, useProfile } from '../../db/profile'
import { isoDate, lastNDates } from '../../lib/date'
import type { Habit, HabitEntry } from '../../db/types'
import Screen from '../../components/Screen'
import Icon from '../../components/Icon'

export default function Profile() {
  const today = isoDate()
  const profile = useProfile()

  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray())
  const entries = useLiveQuery(() => db.habitEntries.where('date').equals(today).toArray(), [today])

  // Série globale : un jour compte s'il a rempli un objectif quelconque.
  const streak = useLiveQuery(async () => {
    const days = lastNDates(60)
    const logs = await db.dailyLogs.where('date').anyOf(days).toArray()
    const byDate = new Map(logs.map((l) => [l.date, l]))
    let n = 0
    for (const d of days.slice().reverse()) {
      const l = byDate.get(d)
      if (l && (l.workoutDone || l.waterMl >= profile.waterMl || l.steps >= profile.steps)) n++
      else if (d !== today) break
    }
    return n
  }, [today, profile.waterMl, profile.steps])

  if (!habits || !entries) return null

  const entryFor = (h: Habit) => entries.find((e) => e.habitId === h.id)
  const dueToday = habits.filter((h) => isScheduled(h, today))
  const doneToday = dueToday.filter((h) => isComplete(h, entryFor(h))).length

  return (
    <Screen
      title={profile.name ? profile.name : 'Moi'}
      subtitle="Vos informations et vos habitudes"
      action={
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-tile bg-gradient-to-br from-violet to-violet-light text-[24px]">
          {profile.avatar}
        </span>
      }
    >
      {/* Informations personnelles */}
      <section className="rounded-card bg-card p-4 shadow-soft">
        <h2 className="label">Mes informations</h2>

        <label className="mt-3 block text-micro text-ink-500" htmlFor="profile-name">
          Prénom
        </label>
        <input
          id="profile-name"
          type="text"
          value={profile.name}
          placeholder="Votre prénom"
          onChange={(e) => setProfileField('name', e.target.value)}
          className="mt-1.5 h-11 w-full rounded-chip bg-page px-3.5 text-body outline-none placeholder:text-ink-300"
        />

        <p className="mt-3.5 text-micro text-ink-500">Avatar</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {PROFILE_AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setProfileField('avatar', a)}
              aria-label={`Avatar ${a}`}
              aria-pressed={profile.avatar === a}
              className={`flex h-10 w-10 items-center justify-center rounded-chip text-[19px] transition-colors ${
                profile.avatar === a ? 'bg-violet-soft ring-2 ring-violet' : 'bg-page'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1">
            <label className="block text-micro text-ink-500" htmlFor="goal-water">
              Objectif d’eau (L)
            </label>
            <input
              id="goal-water"
              type="number"
              inputMode="decimal"
              step="0.25"
              value={profile.waterMl / 1000}
              onChange={(e) =>
                setProfileField('waterMl', Math.max(250, Math.round((Number(e.target.value) || 0) * 1000)))
              }
              className="mt-1.5 h-11 w-full rounded-chip bg-page px-3.5 text-center font-display text-lead font-bold text-violet outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-micro text-ink-500" htmlFor="goal-steps">
              Objectif de pas
            </label>
            <input
              id="goal-steps"
              type="number"
              inputMode="numeric"
              step="500"
              value={profile.steps}
              onChange={(e) => setProfileField('steps', Math.max(100, Number(e.target.value) || 0))}
              className="mt-1.5 h-11 w-full rounded-chip bg-page px-3.5 text-center font-display text-lead font-bold text-grass outline-none"
            />
          </div>
        </div>
      </section>

      <section className="card-hero mt-3.5">
        <p className="text-meta uppercase tracking-label text-white/85">Aujourd’hui</p>
        <div className="mt-1.5 flex items-end gap-2.5">
          <span className="font-display text-[40px] font-bold leading-none">{doneToday}</span>
          <span className="mb-1.5 text-body text-white/80">sur {dueToday.length} habitudes</span>
        </div>
        <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-lime transition-[width]"
            style={{ width: `${dueToday.length ? Math.round((doneToday / dueToday.length) * 100) : 0}%` }}
          />
        </div>
      </section>

      <div className="mt-3.5 flex gap-3">
        <div className="tile flex-1">
          <p className="font-display text-stat font-bold text-ember">{streak ?? 0}</p>
          <p className="mt-0.5 text-micro text-ink-500">jours de série</p>
        </div>
        <div className="tile flex-1">
          <p className="font-display text-stat font-bold text-violet">{habits.length}</p>
          <p className="mt-0.5 text-micro text-ink-500">habitudes</p>
        </div>
        <div className="tile flex-1">
          <p className="font-display text-stat font-bold text-grass">{doneToday}</p>
          <p className="mt-0.5 text-micro text-ink-500">faites ce jour</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lead font-bold">Mes rubriques</h2>
        <Link to="/habitude/nouvelle" className="text-meta font-semibold text-violet">
          + Ajouter
        </Link>
      </div>

      <div className="mt-3.5 flex flex-col gap-3">
        {habits.map((h) => (
          <HabitCard key={h.id} habit={h} entry={entryFor(h)} today={today} />
        ))}

        {habits.length === 0 && (
          <div className="rounded-card bg-card p-6 text-center shadow-soft">
            <p className="text-[28px]">🌱</p>
            <p className="mt-2 font-display text-lead font-bold">Aucune habitude</p>
            <p className="mt-1.5 text-body text-ink-500">
              Créez votre première rubrique : lecture, méditation, marche…
            </p>
          </div>
        )}
      </div>

      <Link to="/habitude/nouvelle" className="btn btn-violet mt-4 flex items-center justify-center gap-2">
        <Icon name="plus" size={18} />
        Nouvelle habitude
      </Link>
    </Screen>
  )
}

function HabitCard({ habit, entry, today }: { habit: Habit; entry?: HabitEntry; today: string }) {
  const scheduled = isScheduled(habit, today)
  const complete = isComplete(habit, entry)
  const value = entry?.value ?? 0
  const goal = habit.goal ?? 1
  const pct = habit.kind === 'count' ? Math.min(100, Math.round((value / goal) * 100)) : complete ? 100 : 0

  return (
    <article className={`rounded-card bg-card p-4 shadow-soft ${complete ? '' : scheduled ? 'border-[1.5px] border-violet shadow-ring' : ''}`}>
      <div className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-violet-soft text-[22px]">
          {habit.emoji}
        </span>
        <div className="flex-1">
          <h3 className="text-body font-semibold">{habit.name}</h3>
          <p className="text-micro text-ink-500">
            {!scheduled
              ? 'pas prévue aujourd’hui'
              : habit.kind === 'count'
                ? `${value} / ${goal} ${habit.unit ?? ''}`.trim()
                : complete
                  ? 'faite aujourd’hui'
                  : 'à faire aujourd’hui'}
          </p>
        </div>
        <Link
          to={`/habitude/${habit.id}`}
          className="chip bg-page text-ink-500"
          aria-label={`Modifier ${habit.name}`}
        >
          Modifier
        </Link>
      </div>

      {scheduled && (
        <>
          <div className="mt-3 h-2 rounded-full bg-ink-100">
            <div className="h-2 rounded-full bg-lime transition-[width]" style={{ width: `${pct}%` }} />
          </div>

          {habit.kind === 'count' ? (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => bumpHabit(habit.id!, today, -(habit.step ?? 1))}
                className="flex h-10 w-10 items-center justify-center rounded-chip bg-page text-ink-700"
                aria-label={`Retirer ${habit.step ?? 1}`}
              >
                <Icon name="minus" size={18} />
              </button>
              <label className="sr-only" htmlFor={`val-${habit.id}`}>
                {habit.name} — valeur du jour
              </label>
              <input
                id={`val-${habit.id}`}
                type="number"
                inputMode="numeric"
                value={value || ''}
                placeholder="0"
                onChange={(e) => setHabitValue(habit.id!, today, Number(e.target.value) || 0)}
                className="h-10 flex-1 rounded-chip bg-page px-3 text-center font-display text-lead font-bold text-violet outline-none"
              />
              <button
                onClick={() => bumpHabit(habit.id!, today, habit.step ?? 1)}
                className="flex h-10 w-10 items-center justify-center rounded-chip bg-violet text-white"
                aria-label={`Ajouter ${habit.step ?? 1}`}
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => toggleHabit(habit.id!, today)}
              className={`btn mt-3 ${complete ? '' : 'btn-primary'}`}
              aria-pressed={complete}
            >
              {complete ? 'Annuler' : 'Marquer comme fait'}
            </button>
          )}

          {habit.noteLabel && (
            <div className="mt-3">
              <label className="label" htmlFor={`note-${habit.id}`}>
                {habit.noteLabel}
              </label>
              <input
                id={`note-${habit.id}`}
                type="text"
                value={habit.note ?? ''}
                placeholder="—"
                onChange={(e) => setHabitNote(habit.id!, e.target.value)}
                className="mt-1.5 h-11 w-full rounded-chip bg-page px-3.5 text-body outline-none placeholder:text-ink-300"
              />
            </div>
          )}
        </>
      )}
    </article>
  )
}
