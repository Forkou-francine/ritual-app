import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../../db/db'
import { useProgress } from '../../db/stats'
import { PLAN_WEEKS, PASS_RATIO, passMark, planState } from '../../lib/codePlan'
import { isoDate } from '../../lib/date'
import { haptic } from '../../lib/haptics'
import { schedule } from '../../lib/srs'
import { XP } from '../../lib/xp'
import Scene from '../../components/Scene'
import Sign from '../../components/Sign'
import { visualFor } from '../../data/visuals'
import type { CodeSessionKind, Question } from '../../db/types'

const SIZE: Record<CodeSessionKind, number> = { jour: 20, examen: 40, erreurs: 20, theme: 20 }
/** Comme à l'examen : 30 secondes par question. */
const EXAM_SECONDS = 30

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function buildQueue(kind: CodeSessionKind, theme: string | null, today: string) {
  const all = await db.questions.toArray()

  if (kind === 'examen') return { title: 'Examen blanc', queue: shuffle(all).slice(0, SIZE.examen) }
  if (kind === 'theme' && theme) {
    return { title: theme, queue: shuffle(all.filter((q) => q.theme === theme)).slice(0, SIZE.theme) }
  }
  if (kind === 'erreurs') {
    const attempts = await db.attempts.toArray()
    const last = new Map<number, boolean>()
    for (const a of attempts) last.set(a.questionId, a.correct)
    const errors = all.filter((q) => q.flagged || last.get(q.id!) === false)
    return { title: 'Mes erreurs', queue: shuffle(errors).slice(0, SIZE.erreurs) }
  }

  // Séance du jour : d'abord le thème de la semaine (à revoir en priorité), puis le reste.
  const exam = await db.settings.get('examDate')
  const week = exam ? planState(String(exam.value), today).week : 0
  const meta = week >= 1 ? PLAN_WEEKS[week - 1] : null
  const inTheme = (q: Question) => !!meta?.theme && q.theme === meta.theme
  const due = (q: Question) => q.dueDate <= today
  const ordered = [
    ...shuffle(all.filter((q) => inTheme(q) && due(q))),
    ...shuffle(all.filter((q) => inTheme(q) && !due(q))),
    ...shuffle(all.filter((q) => !inTheme(q) && due(q))),
    ...shuffle(all.filter((q) => !inTheme(q) && !due(q))),
  ]
  return { title: meta?.theme ? meta.title : 'Révision du jour', queue: ordered.slice(0, SIZE.jour) }
}

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

interface Result {
  id: number
  correct: boolean
}

export default function CodeSession() {
  const today = isoDate()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { key: navKey } = useLocation()
  const kind = (params.get('mode') ?? 'jour') as CodeSessionKind
  const themeParam = params.get('t')

  const [loaded, setLoaded] = useState<{ title: string; queue: Question[] } | null>(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [validated, setValidated] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [seconds, setSeconds] = useState(0)
  const [finished, setFinished] = useState(false)

  // Photo des badges au départ : le résultat annonce ceux gagnés pendant la séance.
  const progress = useProgress()
  const badgesBefore = useRef<Set<string> | null>(null)
  useEffect(() => {
    if (progress && !badgesBefore.current) badgesBefore.current = new Set(progress.badges.filter((b) => b.earned).map((b) => b.id))
  }, [progress])

  useEffect(() => {
    setLoaded(null)
    setIndex(0)
    setResults([])
    setFinished(false)
    setSelected(null)
    setValidated(false)
    buildQueue(kind, themeParam, today).then(setLoaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, themeParam, navKey])

  // Chronomètre de la question en cours.
  useEffect(() => {
    setSeconds(0)
    if (validated || finished) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [index, validated, finished, loaded])

  const q = loaded?.queue[index]
  const remaining = EXAM_SECONDS - seconds

  const validate = async (choice: number | null) => {
    if (!q || validated) return
    const ok = choice === q.answer
    setSelected(choice)
    setValidated(true)
    haptic(ok ? 'good' : 'bad')
    setResults((r) => [...r, { id: q.id!, correct: ok }])
    await db.questions.update(q.id!, schedule(q, ok, today))
    await db.attempts.add({ questionId: q.id!, date: today, correct: ok })
  }

  // À l'examen, le temps écoulé compte comme une réponse fausse.
  useEffect(() => {
    if (kind === 'examen' && q && !validated && !finished && remaining <= 0) validate(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, kind, q, validated, finished])

  const toggleFlag = async () => {
    if (!q || !loaded) return
    const flagged = !q.flagged
    await db.questions.update(q.id!, { flagged })
    setLoaded({ ...loaded, queue: loaded.queue.map((x) => (x.id === q.id ? { ...x, flagged } : x)) })
  }

  const next = async () => {
    if (!loaded) return
    if (index + 1 < loaded.queue.length) {
      setIndex(index + 1)
      setSelected(null)
      setValidated(false)
      return
    }
    await db.codeSessions.add({
      date: today,
      kind,
      theme: kind === 'theme' ? themeParam ?? undefined : undefined,
      score: results.filter((r) => r.correct).length,
      total: loaded.queue.length,
    })
    setFinished(true)
  }

  if (!loaded) return null

  if (loaded.queue.length === 0) {
    return (
      <main className="mx-auto max-w-md px-5 pt-[max(3rem,env(safe-area-inset-top))]">
        <div className="card-lg text-center">
          <p className="text-[32px]">{kind === 'erreurs' ? '🎯' : '📭'}</p>
          <p className="mt-2 font-display text-lead font-bold">
            {kind === 'erreurs' ? 'Aucune erreur à revoir' : 'Aucune question disponible'}
          </p>
          <p className="mt-1.5 text-body text-ink-500">
            {kind === 'erreurs'
              ? 'Les questions ratées ou marquées d’un signet apparaîtront ici.'
              : 'Ajoutez des questions dans le fichier de données pour lancer une séance.'}
          </p>
          <Link to="/code" className="btn btn-primary mt-4 flex items-center justify-center">
            Retour au plan
          </Link>
        </div>
      </main>
    )
  }

  const total = loaded.queue.length
  const score = results.filter((r) => r.correct).length

  /* ---------- Résultat ---------- */
  if (finished) {
    const pct = Math.round((score / total) * 100)
    const mark = passMark(total)
    const passed = score >= mark
    const wrong = total - score
    const newBadges = (progress?.badges ?? []).filter((b) => b.earned && badgesBefore.current && !badgesBefore.current.has(b.id))
    const R = 72
    const C = 2 * Math.PI * R

    return (
      <main className="min-h-screen bg-gradient-to-b from-violet via-[#8F6EF2] to-violet-light">
        <div className="mx-auto max-w-md px-6 pb-10 pt-[max(4.5rem,env(safe-area-inset-top))] text-center text-white">
          <div className="text-[44px]">{passed ? '🎉' : '💪'}</div>
          <h1 className="mt-2.5 font-display text-[27px] font-bold">{passed ? 'Séance réussie !' : 'Séance terminée'}</h1>
          <p className="mt-1.5 text-[13.5px] text-white/85">
            {loaded.title}
            {kind === 'examen' ? '' : ' · '}
            {kind === 'jour' ? 'séance du jour' : kind === 'theme' ? 'thème' : kind === 'erreurs' ? 'révision' : ''}
          </p>

          <div className="relative mx-auto mt-6 h-[170px] w-[170px]">
            <svg width="170" height="170" viewBox="0 0 170 170" aria-hidden="true">
              <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="14" />
              <circle
                cx="85"
                cy="85"
                r={R}
                fill="none"
                stroke="#B6F24A"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - score / total)}
                transform="rotate(-90 85 85)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-[46px] font-bold leading-none">
                {score}
                <span className="text-[20px] opacity-75">/{total}</span>
              </p>
              <p className="mt-0.5 text-[11.5px] text-white/85">{pct} % de réussite</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-card bg-white/15 p-3.5 text-left text-[12.5px] leading-snug">
            <span className="text-[20px]">{passed ? '✅' : '🎯'}</span>
            <p>
              {passed ? (
                <>
                  Au-dessus du seuil d’examen : il faut <b>35/40</b> le jour J, soit {(PASS_RATIO * 100).toFixed(1).replace('.', ',')} %.
                </>
              ) : (
                <>
                  Il faut <b>35/40</b> le jour J ({(PASS_RATIO * 100).toFixed(1).replace('.', ',')} %). Sur cette séance, il vous manquait{' '}
                  {mark - score} point{mark - score > 1 ? 's' : ''}.
                </>
              )}
            </p>
          </div>

          <div className="mt-3 flex gap-2.5">
            <div className="flex-1 rounded-card bg-white/15 p-3.5">
              <p className="font-display text-[21px] font-bold text-[#D9F7A8]">+{score * XP.answer}</p>
              <p className="mt-0.5 text-[10.5px] text-white/80">XP gagnée</p>
            </div>
            <div className="flex-1 rounded-card bg-white/15 p-3.5">
              <p className="font-display text-[21px] font-bold">🔥{progress?.streak ?? 0}</p>
              <p className="mt-0.5 text-[10.5px] text-white/80">jours d’affilée</p>
            </div>
            <div className="flex-1 rounded-card bg-white/15 p-3.5">
              <p className="font-display text-[21px] font-bold text-[#FFD08A]">{wrong}</p>
              <p className="mt-0.5 text-[10.5px] text-white/80">à revoir</p>
            </div>
          </div>

          {newBadges.map((b) => (
            <div key={b.id} className="mt-3 flex items-center gap-3 rounded-card bg-white/15 p-3.5 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-lime text-[20px]">{b.emoji}</span>
              <div>
                <p className="text-[13.5px] font-bold">Badge débloqué</p>
                <p className="text-[11.5px] text-white/82">« {b.label} »</p>
              </div>
            </div>
          ))}

          <button
            onClick={() => (wrong > 0 ? navigate('/code/seance?mode=erreurs', { replace: true }) : navigate('/code/seance?mode=jour', { replace: true }))}
            className="mt-6 h-14 w-full rounded-[18px] bg-lime font-display text-[16px] font-bold text-lime-deep"
          >
            {wrong > 0 ? `Revoir mes ${wrong} erreur${wrong > 1 ? 's' : ''}` : 'Nouvelle séance'}
          </button>
          <Link to="/code" className="mt-3.5 block text-[13.5px] font-semibold text-white/88">
            Retour au plan
          </Link>
        </div>
      </main>
    )
  }

  /* ---------- Question / correction ---------- */
  if (!q) return null
  const correct = selected === q.answer
  const timedOut = validated && selected === null
  const visual = visualFor(q.prompt)

  return (
    <main className="mx-auto max-w-md px-5 pb-36 pt-[max(3.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/code')} aria-label="Quitter la séance" className="h-9 w-6 text-[20px] text-ink-500">
          ✕
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet to-lime transition-[width]"
            style={{ width: `${Math.round(((index + (validated ? 1 : 0)) / total) * 100)}%` }}
          />
        </div>
        <span className="font-display text-[12.5px] font-bold">
          {index + 1}/{total}
        </span>
      </div>

      {!validated ? (
        <div className="mt-3.5 flex items-center justify-between">
          <span className="chip bg-violet-soft font-semibold text-violet">{q.theme}</span>
          <span
            className={`font-display text-[13px] font-bold ${kind === 'examen' && remaining <= 10 ? 'text-ember' : 'text-ink-500'}`}
            aria-label="Chronomètre"
          >
            ⏱ {mmss(kind === 'examen' ? Math.max(0, remaining) : seconds)}
          </span>
        </div>
      ) : (
        <div
          className={`mt-4 flex items-center gap-3.5 rounded-card border-[1.5px] p-4 ${
            correct ? 'border-lime bg-[#EEF9D8]' : 'border-ember/40 bg-ember-soft'
          }`}
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-chip text-[20px] font-bold ${
              correct ? 'bg-lime text-lime-deep' : 'bg-ember text-white'
            }`}
          >
            {correct ? '✓' : '✕'}
          </span>
          <div>
            <p className={`font-display text-[17px] font-bold ${correct ? 'text-lime-ink' : 'text-ember'}`}>
              {correct ? 'Bonne réponse !' : timedOut ? 'Temps écoulé' : 'Mauvaise réponse'}
            </p>
            <p className={`text-[12px] ${correct ? 'text-grass' : 'text-ink-500'}`}>
              {correct ? `+${XP.answer} XP · ` : ''}
              {score} bonne{score > 1 ? 's' : ''} sur {results.length}
            </p>
          </div>
        </div>
      )}

      {visual &&
        (visual.kind === 'scene' ? (
          <Scene id={visual.id} note={visual.note} caption={visual.caption} revealed={validated} className="mt-4" />
        ) : (
          <div className="mt-4 flex h-[132px] items-center justify-center rounded-card bg-gradient-to-br from-violet-soft to-white shadow-card">
            <Sign id={visual.id} size={96} />
          </div>
        ))}

      <p className="mt-4 font-display text-[17px] font-bold leading-[1.3]">{q.prompt}</p>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {q.choices.map((c, i) => {
          const isAnswer = i === q.answer
          const isPicked = i === selected
          const state = !validated ? (isPicked ? 'picked' : 'idle') : isAnswer ? 'right' : isPicked ? 'wrong' : 'muted'
          return (
            <button
              key={c}
              onClick={() => {
                if (validated) return
                haptic('tap')
                setSelected(i)
              }}
              disabled={validated}
              aria-pressed={isPicked}
              className={`press flex w-full items-center gap-3 rounded-tile p-3.5 text-left transition-colors ${
                state === 'picked'
                  ? 'border-[1.5px] border-violet bg-card shadow-ring'
                  : state === 'right'
                    ? 'border-[1.5px] border-grass bg-card'
                    : state === 'wrong'
                      ? 'border-[1.5px] border-ember bg-card'
                      : state === 'muted'
                        ? 'bg-card opacity-60'
                        : 'bg-card shadow-soft'
              }`}
            >
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] text-[12px] font-bold ${
                  state === 'picked'
                    ? 'bg-violet text-white'
                    : state === 'right'
                      ? 'bg-grass text-white'
                      : state === 'wrong'
                        ? 'bg-ember text-white'
                        : 'bg-ink-100 text-ink-500'
                }`}
              >
                {state === 'right' ? '✓' : state === 'wrong' ? '✕' : String.fromCharCode(65 + i)}
              </span>
              <span className={`flex-1 text-[14px] ${state === 'picked' || state === 'right' ? 'font-semibold' : ''}`}>{c}</span>
            </button>
          )
        })}
      </div>

      {validated && (
        <section className="mt-4 rounded-card bg-card p-[17px] shadow-card">
          <p className="text-micro font-bold uppercase tracking-[0.1em] text-violet">Explication</p>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-ink-700">{q.explanation}</p>
          <div className="mt-3.5 flex items-start gap-3 border-t border-ink-100 pt-3.5">
            <span className="text-[18px]">📌</span>
            <p className="text-[12.5px] leading-[1.5] text-ink-700">
              <b>Référence :</b> {q.source}
            </p>
          </div>
          <Link
            to={`/code/fiche/${encodeURIComponent(q.theme)}`}
            className="mt-3.5 flex items-center justify-between rounded-chip bg-violet-soft px-3.5 py-2.5 text-[12.5px] font-semibold text-violet"
          >
            <span>📖 Relire la fiche « {q.theme} »</span>
            <span>›</span>
          </Link>
        </section>
      )}

      {/* Barre d'action fixe : le clavier de l'appli ne masque jamais le bouton */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-page from-60% to-transparent px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={toggleFlag}
            aria-label={q.flagged ? 'Retirer le signet' : 'Marquer pour la révision'}
            aria-pressed={!!q.flagged}
            className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-tile text-[19px] shadow-soft ${
              q.flagged ? 'bg-violet-soft' : 'bg-card'
            }`}
          >
            🔖
          </button>
          {!validated ? (
            <button onClick={() => validate(selected)} disabled={selected === null} className="btn btn-violet !h-[52px]">
              Valider
            </button>
          ) : (
            <button onClick={next} className="btn btn-violet !h-[52px]">
              {index + 1 === total ? 'Voir le résultat' : 'Question suivante ▸'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
