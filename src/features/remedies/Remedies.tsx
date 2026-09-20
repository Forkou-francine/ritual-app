import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { SYMPTOMS } from '../../data/remedies'
import Screen from '../../components/Screen'
import Icon from '../../components/Icon'

export default function Remedies() {
  const [query, setQuery] = useState('')
  const [symptom, setSymptom] = useState<string | null>(null)

  const remedies = useLiveQuery(async () => {
    const all = symptom ? await db.remedies.where('symptoms').equals(symptom).toArray() : await db.remedies.toArray()
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((r) => (r.name + r.howTo + r.symptoms.join(' ')).toLowerCase().includes(q))
  }, [symptom, query])

  return (
    <Screen title="Soulagement naturel" subtitle="Méthodes de confort du quotidien">
      <div className="relative mb-3.5">
        <Icon
          name="search"
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="mal de tête, dos, sommeil…"
          className="h-12 w-full rounded-tile bg-card pl-11 pr-4 text-body shadow-soft outline-none placeholder:text-ink-300"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {SYMPTOMS.map((s) => (
          <button
            key={s}
            onClick={() => setSymptom(symptom === s ? null : s)}
            className={`pill capitalize ${symptom === s ? 'pill-on' : ''}`}
            aria-pressed={symptom === s}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {remedies?.map((r) => (
          <article key={r.id} className="flex items-start gap-3.5 rounded-card bg-card p-4 shadow-soft">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-violet-soft font-display text-lead font-bold text-violet">
              {r.name.charAt(0)}
            </span>
            <div className="flex-1">
              <h2 className="text-body font-semibold">{r.name}</h2>
              <p className="mt-1 text-meta leading-relaxed text-ink-500">{r.howTo}</p>
              {r.symptoms.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {r.symptoms.map((s) => (
                    <span key={s} className="chip bg-page capitalize text-ink-500">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
        {remedies?.length === 0 && (
          <p className="rounded-card bg-card p-6 text-center text-body text-ink-500 shadow-soft">
            Aucune méthode pour cette recherche.
          </p>
        )}
      </div>

      <p className="mt-4 flex items-start gap-3 rounded-card bg-ember-soft p-4 text-meta leading-relaxed text-ink-700">
        <span className="text-[18px] leading-none">💡</span>
        <span>
          Ces méthodes ne remplacent pas un avis médical. En cas de douleur intense, inhabituelle ou
          persistante, consultez un professionnel de santé.
        </span>
      </p>
    </Screen>
  )
}
