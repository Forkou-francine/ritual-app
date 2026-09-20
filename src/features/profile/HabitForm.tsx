import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../db/db'
import { deleteHabit } from '../../db/habits'
import { ALL_DAYS, HABIT_EMOJIS, HABIT_UNITS } from '../../data/habits'
import type { HabitKind, Weekday } from '../../db/types'
import Icon from '../../components/Icon'

const DAY_LABELS: Record<Weekday, string> = { 0: 'D', 1: 'L', 2: 'M', 3: 'M', 4: 'J', 5: 'V', 6: 'S' }
const DAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0]

export default function HabitForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = id !== undefined && id !== 'nouvelle'
  const habitId = editing ? Number(id) : null

  const [loaded, setLoaded] = useState(!editing)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📖')
  const [kind, setKind] = useState<HabitKind>('count')
  const [unit, setUnit] = useState('pages')
  const [goal, setGoal] = useState(20)
  const [step, setStep] = useState(5)
  const [noteLabel, setNoteLabel] = useState('')
  const [days, setDays] = useState<Weekday[]>(ALL_DAYS)

  useEffect(() => {
    if (habitId === null) return
    db.habits.get(habitId).then((h) => {
      if (!h) {
        navigate('/moi', { replace: true })
        return
      }
      setName(h.name)
      setEmoji(h.emoji)
      setKind(h.kind)
      setUnit(h.unit ?? 'pages')
      setGoal(h.goal ?? 20)
      setStep(h.step ?? 1)
      setNoteLabel(h.noteLabel ?? '')
      setDays(h.days)
      setLoaded(true)
    })
  }, [habitId, navigate])

  if (!loaded) return null

  const toggleDay = (d: Weekday) =>
    setDays((cur) => (cur.includes(d) ? (cur.length > 1 ? cur.filter((x) => x !== d) : cur) : [...cur, d]))

  const canSave = name.trim().length > 0 && days.length > 0

  const save = async () => {
    if (!canSave) return
    const payload = {
      name: name.trim(),
      emoji,
      kind,
      days,
      unit: kind === 'count' ? unit.trim() || 'fois' : undefined,
      goal: kind === 'count' ? Math.max(1, goal) : undefined,
      step: kind === 'count' ? Math.max(1, step) : undefined,
      noteLabel: noteLabel.trim() || undefined,
    }
    if (habitId !== null) {
      await db.habits.update(habitId, payload)
    } else {
      const count = await db.habits.count()
      await db.habits.add({ ...payload, note: '', order: count })
    }
    navigate('/moi')
  }

  const remove = async () => {
    if (habitId === null) return
    if (!confirm('Supprimer cette habitude et tout son historique ?')) return
    await deleteHabit(habitId)
    navigate('/moi')
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-[max(2.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/moi')} className="text-body text-ink-500">
          Annuler
        </button>
        <h1 className="font-display text-lead font-bold">
          {editing ? 'Modifier' : 'Nouvelle habitude'}
        </h1>
        <button
          onClick={save}
          disabled={!canSave}
          className={`text-body font-semibold ${canSave ? 'text-violet' : 'text-ink-300'}`}
        >
          Enregistrer
        </button>
      </div>

      {/* Émoji */}
      <div className="mt-6 flex flex-col items-center">
        <span className="flex h-[76px] w-[76px] items-center justify-center rounded-card bg-gradient-to-br from-violet to-violet-light text-[38px]">
          {emoji}
        </span>
        <p className="mt-2.5 text-meta font-semibold text-violet">Choisir une icône</p>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {HABIT_EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            aria-label={`Icône ${e}`}
            aria-pressed={emoji === e}
            className={`flex h-11 w-11 items-center justify-center rounded-chip text-[20px] transition-colors ${
              emoji === e ? 'bg-violet-soft ring-2 ring-violet' : 'bg-card shadow-soft'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Nom */}
      <div className="mt-5 rounded-tile bg-card p-4 shadow-soft">
        <label className="label" htmlFor="name">
          Nom
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lecture"
          className="mt-1.5 w-full bg-transparent text-lead font-semibold outline-none placeholder:text-ink-300"
        />
      </div>

      {/* Type */}
      <div className="mt-3 rounded-tile bg-card p-4 shadow-soft">
        <p className="label">Type de suivi</p>
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() => setKind('check')}
            className={`flex-1 rounded-chip py-2.5 text-meta font-semibold transition-colors ${
              kind === 'check' ? 'bg-violet text-white' : 'bg-page text-ink-500'
            }`}
          >
            À cocher
          </button>
          <button
            onClick={() => setKind('count')}
            className={`flex-1 rounded-chip py-2.5 text-meta font-semibold transition-colors ${
              kind === 'count' ? 'bg-violet text-white' : 'bg-page text-ink-500'
            }`}
          >
            À compter
          </button>
        </div>
      </div>

      {/* Objectif chiffré */}
      {kind === 'count' && (
        <div className="mt-3 rounded-tile bg-card p-4 shadow-soft">
          <p className="label">Objectif du jour</p>
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={goal || ''}
              onChange={(e) => setGoal(Number(e.target.value) || 0)}
              aria-label="Objectif"
              className="h-11 w-24 rounded-chip bg-page px-3 text-center font-display text-lead font-bold text-violet outline-none"
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pages"
              aria-label="Unité"
              className="h-11 flex-1 rounded-chip bg-page px-3.5 text-body outline-none placeholder:text-ink-300"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {HABIT_UNITS.map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`chip ${unit === u ? 'bg-violet-soft text-violet' : 'bg-page text-ink-500'}`}
              >
                {u}
              </button>
            ))}
          </div>

          <p className="label mt-4">Pas du bouton +</p>
          <input
            type="number"
            inputMode="numeric"
            value={step || ''}
            onChange={(e) => setStep(Number(e.target.value) || 0)}
            aria-label="Pas du bouton plus"
            className="mt-1.5 h-11 w-24 rounded-chip bg-page px-3 text-center font-display text-lead font-bold text-violet outline-none"
          />
        </div>
      )}

      {/* Répétition */}
      <div className="mt-3 rounded-tile bg-card p-4 shadow-soft">
        <p className="label">Répéter</p>
        <div className="mt-2.5 flex gap-1.5">
          {DAY_ORDER.map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              aria-label={`Jour ${DAY_LABELS[d]}`}
              aria-pressed={days.includes(d)}
              className={`flex-1 rounded-chip py-2.5 text-meta font-semibold transition-colors ${
                days.includes(d) ? 'bg-violet text-white' : 'bg-ink-100 text-ink-300'
              }`}
            >
              {DAY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Note libre */}
      <div className="mt-3 rounded-tile bg-card p-4 shadow-soft">
        <label className="label" htmlFor="noteLabel">
          Note à suivre (optionnel)
        </label>
        <input
          id="noteLabel"
          type="text"
          value={noteLabel}
          onChange={(e) => setNoteLabel(e.target.value)}
          placeholder="Livre en cours"
          className="mt-1.5 w-full bg-transparent text-lead font-semibold outline-none placeholder:text-ink-300"
        />
        <p className="mt-1.5 text-micro text-ink-500">
          Ajoute un champ texte à l’habitude — par exemple le titre du livre que vous lisez.
        </p>
      </div>

      <button onClick={save} disabled={!canSave} className="btn btn-violet mt-5">
        {editing ? 'Enregistrer' : 'Créer l’habitude'}
      </button>

      {editing && (
        <button
          onClick={remove}
          className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-body font-semibold text-ember"
        >
          <Icon name="trash" size={17} />
          Supprimer l’habitude
        </button>
      )}
    </main>
  )
}
