import { Link, useNavigate } from 'react-router-dom'
import { useCodeStats } from '../../db/code'
import { PASS_RATIO, THEME_EMOJI } from '../../lib/codePlan'
import Screen from '../../components/Screen'

const tone = (pct: number | null) =>
  pct === null
    ? { text: 'text-ink-300', bar: 'bg-ink-200' }
    : pct >= 85
      ? { text: 'text-grass', bar: 'bg-lime' }
      : pct >= 60
        ? { text: 'text-violet', bar: 'bg-violet' }
        : pct >= 50
          ? { text: 'text-violet', bar: 'bg-violet-light' }
          : { text: 'text-ember', bar: 'bg-ember' }

export default function CodeProgress() {
  const stats = useCodeStats()
  const navigate = useNavigate()
  if (!stats) return null

  const exams = stats.sessions.filter((s) => s.kind === 'examen' && s.total > 0).slice(-6)
  const themes = stats.themes
  const weak = themes.filter((t) => t.pct !== null && t.pct < 50).sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))
  const untouched = themes.filter((t) => t.pct === null)
  const target = weak[0] ?? untouched[0]
  const thresholdTop = (1 - PASS_RATIO) * 100

  return (
    <Screen title="Ma progression" subtitle={`Prêt·e à ${stats.readiness} % pour l’examen`}>
      <section className="card-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-body font-bold">Examens blancs</h2>
          <span className="text-meta text-ink-500">seuil 35/40</span>
        </div>

        {exams.length === 0 ? (
          <p className="mt-3 text-body text-ink-500">Aucun examen blanc pour l’instant. Le seuil apparaîtra ici dès le premier.</p>
        ) : (
          <div className="relative mt-4 h-[104px]">
            <div className="absolute inset-x-0 border-t-[1.5px] border-dashed border-ember" style={{ top: `${thresholdTop}%` }} />
            <span
              className="absolute right-0 bg-card px-1 text-[10px] font-bold text-ember"
              style={{ top: `calc(${thresholdTop}% - 16px)` }}
            >
              35
            </span>
            <div className="absolute inset-0 flex items-end justify-between gap-2.5">
              {exams.map((s, i) => {
                const pass = s.score / s.total >= PASS_RATIO
                return (
                  <div key={s.id ?? i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <div
                      className={`w-full rounded-[7px] ${pass ? 'bg-lime' : 'bg-violet-track'}`}
                      style={{ height: `${Math.max(6, Math.round((s.score / s.total) * 100))}%` }}
                    />
                    <span className={`text-[10px] ${pass ? 'font-bold text-grass' : 'text-ink-300'}`}>{s.score}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <p className="label mt-6">Maîtrise par thème</p>
      <section className="card mt-3 flex flex-col gap-3.5 !p-4">
        {themes.map((t) => {
          const c = tone(t.pct)
          return (
            <button
              key={t.theme}
              onClick={() => navigate(`/code/seance?mode=theme&t=${encodeURIComponent(t.theme)}`)}
              className="text-left"
              aria-label={`Réviser ${t.theme}`}
            >
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span className="font-semibold">
                  {THEME_EMOJI[t.theme] ?? '•'} {t.theme}
                </span>
                <span className={`font-bold ${c.text}`}>{t.pct === null ? '—' : `${t.pct}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${t.pct === null ? 8 : Math.max(4, t.pct)}%` }} />
              </div>
              <p className="mt-1 text-[10.5px] text-ink-300">
                {t.seen} vue{t.seen > 1 ? 's' : ''} sur {t.total}
              </p>
            </button>
          )
        })}
      </section>

      <div className="mt-3.5 flex items-center gap-3.5 rounded-card bg-ember-soft p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-card text-[20px]">💡</span>
        <p className="flex-1 text-[12.5px] leading-[1.45] text-ink-700">
          {weak.length > 0 ? (
            <>
              {weak.length === 1 ? 'Un thème est' : `${weak.length} thèmes sont`} sous 50 % : commencez par{' '}
              <b>« {weak[0].theme} »</b>.
            </>
          ) : untouched.length > 0 ? (
            <>
              Vous n’avez pas encore abordé <b>« {untouched[0].theme} »</b>
              {untouched.length > 1 ? ` (et ${untouched.length - 1} autre${untouched.length > 2 ? 's' : ''})` : ''}.
            </>
          ) : (
            <>Tous vos thèmes dépassent 50 %. Enchaînez les examens blancs pour viser 35/40.</>
          )}
        </p>
      </div>

      {target && (
        <button
          onClick={() => navigate(`/code/seance?mode=theme&t=${encodeURIComponent(target.theme)}`)}
          className="btn btn-primary mt-3.5"
        >
          Réviser « {target.theme} »
        </button>
      )}
      <Link to="/code" className="mt-4 block text-center text-meta font-semibold text-violet">
        Retour au plan
      </Link>
    </Screen>
  )
}
