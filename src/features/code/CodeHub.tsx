import { useState } from 'react'
import { Link } from 'react-router-dom'
import { setExamDate, useCodeStats } from '../../db/code'
import { PLAN_WEEKS, planState } from '../../lib/codePlan'
import { addDays, isoDate } from '../../lib/date'
import { XP } from '../../lib/xp'

const SHORT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const shortDate = (iso: string) => SHORT.format(new Date(iso + 'T12:00:00'))
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

export default function CodeHub() {
  const today = isoDate()
  const stats = useCodeStats()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(addDays(today, 56))

  if (!stats) return null

  const plan = stats.examDate ? planState(stats.examDate, today) : null
  const total = stats.questions.length
  const sessionSize = Math.min(20, total)
  const weekMeta = plan && plan.week >= 1 ? PLAN_WEEKS[plan.week - 1] : null

  // Séances par semaine du plan, pour la progression et le score de chaque semaine.
  const sessionsOfWeek = (n: number) => {
    if (!plan) return []
    const from = plan.weekStart(n)
    const to = addDays(from, 6)
    return stats.sessions.filter((s) => s.date >= from && s.date <= to)
  }

  const headline = !plan
    ? 'Préparez votre examen'
    : plan.daysLeft > 0
      ? `Examen dans ${plural(plan.daysLeft, 'jour', 'jours')}`
      : plan.daysLeft === 0
        ? 'C’est le jour J !'
        : 'Examen passé'

  const subline = !plan
    ? 'Choisissez la date pour construire votre plan de 8 semaines.'
    : plan.week === 0
      ? `Le plan démarre le ${shortDate(plan.start)}`
      : `Semaine ${plan.week} sur 8 · ${plural(sessionsOfWeek(plan.week).length, 'séance', 'séances')} cette semaine`

  const saveDate = async () => {
    await setExamDate(draft)
    setEditing(false)
  }

  return (
    <main className="mx-auto max-w-md pb-32">
      <header className="rounded-b-[28px] bg-gradient-to-b from-violet to-violet-light px-5 pb-6 pt-[max(2.75rem,env(safe-area-inset-top))] text-white">
        <div className="flex items-center justify-between">
          <p className="text-meta font-semibold uppercase tracking-label text-white/80">Code de la route</p>
          {plan && (
            <button onClick={() => setEditing((e) => !e)} className="text-meta font-semibold text-white/85">
              {editing ? 'Fermer' : 'Date d’examen'}
            </button>
          )}
        </div>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.15]">{headline}</h1>
        <p className="mt-1.5 text-body text-white/82">{subline}</p>

        {(!plan || editing) && (
          <div className="mt-4 flex gap-2.5">
            <label className="sr-only" htmlFor="exam-date">
              Date de l’examen
            </label>
            <input
              id="exam-date"
              type="date"
              value={draft}
              min={today}
              onChange={(e) => setDraft(e.target.value)}
              className="h-11 flex-1 rounded-chip bg-white/20 px-3.5 text-body text-white outline-none [color-scheme:dark]"
            />
            <button
              onClick={saveDate}
              disabled={!draft}
              className="h-11 rounded-chip bg-lime px-4 font-display text-body font-bold text-lime-deep disabled:opacity-50"
            >
              {plan ? 'Enregistrer' : 'Créer mon plan'}
            </button>
          </div>
        )}

        {plan && (
          <div className="mt-4 h-[9px] overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-lime" style={{ width: `${Math.round(plan.progress * 100)}%` }} />
          </div>
        )}

        <div className="mt-4 flex gap-2.5">
          {[
            { v: stats.avg40 === null ? '—' : `${stats.avg40}/40`, l: 'score moyen' },
            { v: `🔥${stats.streak}`, l: 'jours d’affilée' },
            { v: String(stats.seen), l: 'questions vues' },
          ].map((s) => (
            <div key={s.l} className="flex-1 rounded-tile bg-white/15 p-3">
              <p className="font-display text-[21px] font-bold">{s.v}</p>
              <p className="text-[10.5px] text-white/80">{s.l}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="px-5 pt-5">
        {/* Séance du jour */}
        <section className="rounded-card border-[1.5px] border-violet bg-card p-[18px] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-micro font-bold uppercase tracking-[0.1em] text-violet">Séance du jour</span>
            <span className="chip bg-violet-soft font-semibold text-violet">+{sessionSize * XP.answer} XP</span>
          </div>
          <h2 className="mt-2 font-display text-[19px] font-bold">
            {weekMeta && weekMeta.theme ? weekMeta.title : 'Révision du jour'}
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-500">
            {sessionSize > 0
              ? `${plural(sessionSize, 'question', 'questions')} · environ ${Math.max(1, Math.round(sessionSize * 0.6))} min · ${stats.dueCount} à revoir`
              : 'Aucune question dans la banque.'}
          </p>
          <Link
            to="/code/seance?mode=jour"
            className="btn btn-violet mt-3.5 flex items-center justify-center"
            aria-disabled={sessionSize === 0}
          >
            Commencer ▸
          </Link>
        </section>

        <div className="mt-3.5 flex gap-3">
          <Link to="/code/seance?mode=examen" className="tile flex flex-1 items-center gap-2.5 !p-3.5">
            <span className="text-[20px]">📝</span>
            <span>
              <span className="block text-[13px] font-bold">Examen blanc</span>
              <span className="block text-[10.5px] text-ink-500">{Math.min(40, total)} questions</span>
            </span>
          </Link>
          <Link
            to={stats.errors.length ? '/code/seance?mode=erreurs' : '/code'}
            className={`tile flex flex-1 items-center gap-2.5 !p-3.5 ${stats.errors.length ? '' : 'opacity-60'}`}
          >
            <span className="text-[20px]">🎯</span>
            <span>
              <span className="block text-[13px] font-bold">Mes erreurs</span>
              <span className={`block text-[10.5px] ${stats.errors.length ? 'text-ember' : 'text-ink-500'}`}>
                {stats.errors.length ? `${stats.errors.length} à revoir` : 'aucune pour l’instant'}
              </span>
            </span>
          </Link>
        </div>

        <Link to="/code/progression" className="tile mt-3.5 flex items-center gap-3.5 !p-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-violet-soft text-[20px]">📈</span>
          <span className="flex-1">
            <span className="block text-[13px] font-bold">Ma progression</span>
            <span className="block text-[10.5px] text-ink-500">Prêt·e à {stats.readiness} % pour l’examen</span>
          </span>
          <span className="text-[16px] text-violet">›</span>
        </Link>

        {/* Plan sur 8 semaines */}
        <p className="label mt-6">Plan sur 8 semaines</p>
        <div className="mt-3 flex flex-col gap-2.5">
          {PLAN_WEEKS.map((w) => {
            const state = !plan ? 'later' : w.n < plan.week ? 'done' : w.n === plan.week ? 'now' : 'later'
            const done = plan ? sessionsOfWeek(w.n) : []
            const avg = done.length ? Math.round((done.reduce((n, s) => n + s.score / s.total, 0) / done.length) * 100) : null
            const to = w.theme ? `/code/seance?mode=theme&t=${encodeURIComponent(w.theme)}` : '/code/seance?mode=examen'

            if (w.n === 8) {
              return (
                <Link key={w.n} to={to} className="flex items-center gap-3.5 rounded-tile bg-ink-900 p-3.5 text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-chip bg-lime text-[16px]">🏁</span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-bold">S8 · {w.title}</span>
                    <span className="block text-[11px] text-white/60">
                      {plan ? `jour J le ${shortDate(stats.examDate!)}` : 'à vous de fixer le jour J'}
                    </span>
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={w.n}
                to={to}
                className={`flex items-center gap-3.5 rounded-tile bg-card p-3.5 shadow-soft ${
                  state === 'now' ? 'border-[1.5px] border-violet shadow-ring' : ''
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-chip font-display text-[13px] font-bold ${
                    state === 'done'
                      ? 'bg-lime text-lime-ink'
                      : state === 'now'
                        ? 'bg-violet text-white'
                        : 'bg-ink-100 text-ink-300'
                  }`}
                >
                  {state === 'done' ? '✓' : w.n}
                </span>
                <span className="flex-1">
                  <span
                    className={`block text-[14px] ${
                      state === 'done' ? 'font-semibold text-ink-300 line-through' : state === 'now' ? 'font-bold' : 'font-semibold'
                    }`}
                  >
                    S{w.n} · {w.title}
                  </span>
                  <span
                    className={`block text-[11px] ${
                      state === 'done' ? 'text-grass' : state === 'now' ? 'text-ink-500' : 'text-ink-300'
                    }`}
                  >
                    {state === 'done'
                      ? avg === null
                        ? 'Terminée · aucune séance'
                        : `Terminée · ${avg} % de réussite`
                      : state === 'now'
                        ? `${done.length} séance${done.length > 1 ? 's' : ''} sur 7`
                        : plan
                          ? `Débute le ${shortDate(plan.weekStart(w.n))}`
                          : 'Fixez votre date d’examen'}
                  </span>
                </span>
                {state === 'now' && (
                  <span className="text-[11px] font-bold text-violet">{Math.min(100, Math.round((done.length / 7) * 100))} %</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
