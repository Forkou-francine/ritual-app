import { useEffect, useState } from 'react'
import { db } from '../../db/db'
import { setProfileField } from '../../db/profile'
import { ALL_DAYS, habitSuggestions } from '../../data/habits'

/** Accueil du premier lancement : prénom + premières habitudes. */
export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  // Pré-sélection : les habitudes déjà créées par l'amorçage.
  useEffect(() => {
    db.habits.toArray().then((hs) => setPicked(new Set(hs.map((h) => h.name))))
  }, [])

  const toggle = (n: string) =>
    setPicked((cur) => {
      const next = new Set(cur)
      next.has(n) ? next.delete(n) : next.add(n)
      return next
    })

  const start = async () => {
    setSaving(true)
    const existing = await db.habits.toArray()
    let order = existing.reduce((m, h) => Math.max(m, h.order), -1) + 1
    for (const s of habitSuggestions) {
      const has = existing.find((h) => h.name === s.name)
      if (picked.has(s.name) && !has) {
        await db.habits.add({ ...s, note: '', days: ALL_DAYS, order: order++ })
      } else if (!picked.has(s.name) && has) {
        // On ne retire une habitude de départ que si elle n'a aucun historique.
        if ((await db.habitEntries.where('habitId').equals(has.id!).count()) === 0) await db.habits.delete(has.id!)
      }
    }
    if (name.trim()) await setProfileField('name', name.trim())
    await db.settings.put({ key: 'onboarded', value: 1 })
    onDone()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet to-violet-light">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-8 pt-[max(4.5rem,env(safe-area-inset-top))] text-white">
        <span className="flex h-[60px] w-[60px] items-center justify-center rounded-[20px] bg-white/15 text-[30px] backdrop-blur">
          ◈
        </span>
        <h1 className="mt-6 font-display text-[36px] font-bold leading-[1.05] tracking-tight">
          Construisez les jours
          <br />
          que vous voulez.
        </h1>
        <p className="mt-3.5 text-lead text-white/85">
          Rituel transforme de petites habitudes quotidiennes en séries, XP et niveaux — pour que revenir chaque jour
          fasse vraiment plaisir.
        </p>

        <label htmlFor="ob-name" className="mt-7 block text-meta font-semibold uppercase tracking-label text-white/70">
          Votre prénom
        </label>
        <input
          id="ob-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Comment vous appelle-t-on ?"
          className="mt-2 h-12 w-full rounded-tile bg-white/15 px-4 text-lead text-white outline-none placeholder:text-white/50"
        />

        <p className="mt-7 text-meta font-semibold uppercase tracking-label text-white/70">Vos premières habitudes</p>
        <div className="mt-3.5 flex flex-wrap gap-2.5">
          {habitSuggestions.map((s) => {
            const on = picked.has(s.name)
            return (
              <button
                key={s.name}
                onClick={() => toggle(s.name)}
                aria-pressed={on}
                className={`rounded-chip px-4 py-2.5 text-body transition-colors ${
                  on ? 'bg-white font-semibold text-violet' : 'bg-white/15 text-white'
                }`}
              >
                {s.emoji} {s.name}
                {on ? ' ✓' : ''}
              </button>
            )
          })}
        </div>

        <div className="flex-1" />
        <button
          onClick={start}
          disabled={saving}
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-lime font-display text-[16px] font-bold text-lime-deep transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          Commencer →
        </button>
        <p className="mt-3 text-center text-meta text-white/70">
          Vos données restent sur cet appareil. Tout se modifie plus tard dans « Moi ».
        </p>
      </div>
    </main>
  )
}
