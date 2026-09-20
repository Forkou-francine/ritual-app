import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../../db/db'
import { bumpHabit, habitStats, isComplete, toggleHabit } from '../../db/habits'
import { isoDate } from '../../lib/date'
import { XP } from '../../lib/xp'
import type { Weekday } from '../../db/types'

const SHADES = ['bg-ink-100', 'bg-violet-pale', 'bg-violet-mid', 'bg-violet']
const DAY_SHORT: Record<Weekday, string> = { 0: 'dim', 1: 'lun', 2: 'mar', 3: 'mer', 4: 'jeu', 5: 'ven', 6: 'sam' }
const DAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0]

export default function HabitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const today = isoDate()
  const habitId = Number(id)

  const habit = useLiveQuery(() => db.habits.get(habitId), [habitId])
  const stats = useLiveQuery(async () => {
    const h = await db.habits.get(habitId)
    return h ? habitStats(h, today) : undefined
  }, [habitId, today])
  const entry = useLiveQuery(() => db.habitEntries.get({ habitId, date: today }), [habitId, today])

  if (!habit || !stats) return null

  const complete = isComplete(habit, entry)
  const schedule =
    habit.days.length === 7 ? 'Tous les jours' : DAY_ORDER.filter((d) => habit.days.includes(d)).map((d) => DAY_SHORT[d]).join(' · ')

  const badges = [
    { emoji: '🏅', label: '7 jours', earned: stats.best >= 7 },
    { emoji: '⭐', label: '3 semaines', earned: stats.best >= 21 },
    { emoji: '💎', label: '100 faites', earned: stats.total >= 100 },
    { emoji: '🔥', label: '30 jours', earned: stats.best >= 30 },
  ]

  const act = () => (habit.kind === 'check' ? toggleHabit(habitId, today) : bumpHabit(habitId, today, habit.step ?? 1))

  return (
    <main className="mx-auto max-w-md pb-32">
      <header className="rounded-b-[28px] bg-gradient-to-b from-violet to-violet-light px-5 pb-6 pt-[max(2.75rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} aria-label="Retour" className="h-10 w-10 text-[24px]">
            ‹
          </button>
          <span className="text-meta tracking-[0.1em] opacity-85">HABITUDE</span>
          <Link to={`/habitude/${habitId}`} className="text-meta font-semibold">
            Modifier
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-3.5">
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-tile bg-white/20 text-[26px]">
            {habit.emoji}
          </span>
          <div>
            <h1 className="font-display text-title font-bold">{habit.name}</h1>
            <p className="text-meta text-white/80">
              {schedule}
              {habit.kind === 'count' ? ` · ${habit.goal} ${habit.unit ?? ''}`.trimEnd() : ''}
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-2.5">
          {[
            { v: `🔥${stats.streak}`, l: 'en cours' },
            { v: String(stats.best), l: 'record' },
            { v: `${stats.rate}%`, l: 'réussite' },
          ].map((s) => (
            <div key={s.l} className="flex-1 rounded-tile bg-white/15 p-3">
              <p className="font-display text-[22px] font-bold">{s.v}</p>
              <p className="text-micro text-white/80">{s.l}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="px-5 pt-5">
        <p className="label">90 derniers jours</p>
        <div className="mt-3 grid grid-cols-[repeat(15,1fr)] gap-[5px]">
          {stats.days.map((d) => (
            <div
              key={d.date}
              title={d.date}
              className={`aspect-square rounded-[4px] ${SHADES[d.level]} ${d.scheduled ? '' : 'opacity-40'}`}
            />
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-micro text-ink-500">
          Moins
          {SHADES.map((s) => (
            <span key={s} className={`h-[11px] w-[11px] rounded-[3px] ${s}`} />
          ))}
          Plus
        </div>

        <p className="label mt-6">Badges</p>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {badges.map((b) => (
            <div
              key={b.label}
              className={`rounded-tile p-2.5 text-center ${
                b.earned ? 'bg-card shadow-soft' : 'border-[1.5px] border-dashed border-ink-200 bg-page'
              }`}
            >
              <div className={`text-[24px] ${b.earned ? '' : 'opacity-35'}`}>{b.earned ? b.emoji : '🔒'}</div>
              <div className={`mt-1 text-[10.5px] ${b.earned ? 'font-semibold' : 'text-ink-300'}`}>{b.label}</div>
            </div>
          ))}
        </div>

        <div className="tile mt-5 text-body">
          <div className="flex justify-between">
            <span className="text-ink-500">Ce mois-ci</span>
            <span className="font-semibold">
              {stats.monthDone} sur {stats.monthScheduled} jours
            </span>
          </div>
          <div className="mt-2.5 flex justify-between">
            <span className="text-ink-500">Total réalisé</span>
            <span className="font-semibold text-violet">
              {stats.total} fois · {stats.total * XP.habit} XP
            </span>
          </div>
        </div>

        <button onClick={act} className={`btn mt-4 ${complete ? '' : 'btn-primary'}`}>
          {habit.kind === 'check'
            ? complete
              ? 'Annuler pour aujourd’hui'
              : `Marquer comme fait · +${XP.habit} XP`
            : `+${habit.step ?? 1} ${habit.unit ?? ''}${complete ? ' · objectif atteint' : ''}`.trim()}
        </button>
      </div>
    </main>
  )
}
