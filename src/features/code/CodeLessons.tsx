import { Link, useNavigate } from 'react-router-dom'
import { useLessonsRead } from '../../db/code'
import { LESSONS } from '../../data/lessons'
import { THEME_EMOJI } from '../../lib/codePlan'
import Sign from '../../components/Sign'

export default function CodeLessons() {
  const navigate = useNavigate()
  const read = useLessonsRead()

  return (
    <main className="mx-auto max-w-md pb-32">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-page/85 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <button
          onClick={() => navigate('/code')}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full text-violet active:bg-violet-soft"
        >
          <span className="text-[26px] leading-none">‹</span>
        </button>
        <span className="font-display text-[15px] font-bold">Code</span>
      </header>

      <div className="px-5">
        <h1 className="font-display text-[30px] font-bold leading-[1.1]">Fiches de cours</h1>
        <p className="mt-1.5 text-body text-ink-500">
          {read.length} sur {LESSONS.length} lues · à lire avant chaque semaine du plan
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {LESSONS.map((l) => {
            const done = read.includes(l.theme)
            return (
              <Link
                key={l.theme}
                to={`/code/fiche/${encodeURIComponent(l.theme)}`}
                className="press flex items-center gap-3.5 rounded-card bg-card p-3.5 shadow-card"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-soft to-white">
                  {l.signs?.[0] ? <Sign id={l.signs[0].id} size={46} /> : <span className="text-[28px]">{THEME_EMOJI[l.theme]}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[16px] font-bold">{l.theme}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-ink-500">{l.intro}</span>
                  <span className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold">
                    <span className="text-ink-300">{l.minutes} min</span>
                    {done && <span className="text-grass">✓ Lue</span>}
                  </span>
                </span>
                <span className="text-[20px] text-ink-300">›</span>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
