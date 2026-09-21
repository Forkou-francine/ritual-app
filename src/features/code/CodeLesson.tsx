import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { markLessonRead } from '../../db/code'
import { LESSONS, lessonFor } from '../../data/lessons'
import { THEME_EMOJI } from '../../lib/codePlan'
import Scene from '../../components/Scene'
import Sign from '../../components/Sign'
import { haptic } from '../../lib/haptics'

export default function CodeLesson() {
  const { theme = '' } = useParams()
  const navigate = useNavigate()
  const lesson = lessonFor(decodeURIComponent(theme))

  useEffect(() => {
    // « Lue » = ouverte quelques secondes : une fiche survolée par erreur ne compte pas.
    if (!lesson) return
    const t = setTimeout(() => markLessonRead(lesson.theme), 4000)
    return () => clearTimeout(t)
  }, [lesson])

  if (!lesson) return <Navigate to="/code/fiches" replace />
  const index = LESSONS.findIndex((l) => l.theme === lesson.theme)
  const nextLesson = LESSONS[index + 1]

  return (
    <main className="mx-auto max-w-md pb-40">
      <header className="rounded-b-[28px] bg-gradient-to-b from-violet to-violet-light px-5 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full active:bg-white/15"
        >
          <span className="text-[26px] leading-none">‹</span>
        </button>
        <p className="mt-2 text-meta font-semibold uppercase tracking-label text-white/80">
          Fiche {index + 1} sur {LESSONS.length} · {lesson.minutes} min
        </p>
        <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.1]">
          {THEME_EMOJI[lesson.theme]} {lesson.theme}
        </h1>
        <p className="mt-2 text-body text-white/85">{lesson.intro}</p>
      </header>

      <div className="px-5 pt-5">
        <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 no-scrollbar">
          {lesson.keyFacts.map((k) => (
            <div key={k.label} className="min-w-[112px] flex-1 rounded-tile bg-card p-3.5 shadow-soft">
              <p className="font-display text-[24px] font-bold leading-none text-violet">{k.value}</p>
              <p className="mt-1.5 text-[11px] leading-tight text-ink-500">{k.label}</p>
            </div>
          ))}
        </div>

        {lesson.signs && (
          <section className="mt-4 rounded-card bg-card p-4 shadow-card">
            <p className="label">À reconnaître</p>
            <div className="mt-3 grid grid-cols-3 gap-y-4">
              {lesson.signs.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
                  <Sign id={s.id} size={58} />
                  <span className="px-1 text-[10.5px] leading-tight text-ink-500">{s.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {lesson.scene === 'carrefour' && <Scene id="carrefour" revealed caption="Priorité à droite" className="mt-4" />}
        {lesson.scene === 'distance' && <Scene id="distance" revealed note="2 s" caption="Distance de sécurité" className="mt-4" />}
        {lesson.scene === 'pieton' && <Scene id="pieton" revealed caption="Piéton engagé : on cède" className="mt-4" />}

        {lesson.sections.map((s) => (
          <section key={s.title} className="mt-4 rounded-card bg-card p-[18px] shadow-card">
            <h2 className="flex items-center gap-2.5 font-display text-[16px] font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-chip bg-violet-soft text-[16px]">{s.emoji}</span>
              {s.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-[13.5px] leading-[1.55] text-ink-700">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-4 rounded-card bg-ink-900 p-[18px] text-white">
          <p className="text-micro font-bold uppercase tracking-[0.1em] text-lime">À retenir</p>
          <p className="mt-2 font-display text-[16px] font-bold leading-snug">{lesson.remember}</p>
        </section>

        <p className="mt-4 text-center text-[11px] leading-snug text-ink-300">
          Fiche de révision non officielle. Recoupez avec Légifrance avant l’examen.
        </p>

        {nextLesson && (
          <Link
            to={`/code/fiche/${encodeURIComponent(nextLesson.theme)}`}
            replace
            className="press mt-4 flex items-center justify-between rounded-tile bg-card p-3.5 shadow-soft"
          >
            <span>
              <span className="block text-[11px] text-ink-500">Fiche suivante</span>
              <span className="block font-display text-[14px] font-bold">
                {THEME_EMOJI[nextLesson.theme]} {nextLesson.theme}
              </span>
            </span>
            <span className="text-[20px] text-violet">›</span>
          </Link>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-page from-60% to-transparent px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto max-w-md">
          <Link
            to={`/code/seance?mode=theme&t=${encodeURIComponent(lesson.theme)}`}
            onClick={() => haptic('tap')}
            className="btn btn-violet flex items-center justify-center !h-[52px]"
          >
            S’entraîner sur ce thème ▸
          </Link>
        </div>
      </div>
    </main>
  )
}
