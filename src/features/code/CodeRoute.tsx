import { useEffect, useState } from 'react'
import { db } from '../../db/db'
import { isoDate } from '../../lib/date'
import { dueLabel, schedule } from '../../lib/srs'
import type { Question } from '../../db/types'
import Screen from '../../components/Screen'
import Icon from '../../components/Icon'

const SESSION_SIZE = 10

export default function CodeRoute() {
  const today = isoDate()
  const [queue, setQueue] = useState<Question[] | null>(null)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [lastInterval, setLastInterval] = useState(0)

  useEffect(() => {
    db.questions
      .where('dueDate')
      .belowOrEqual(today)
      .toArray()
      .then((qs) => setQueue(qs.sort(() => Math.random() - 0.5).slice(0, SESSION_SIZE)))
  }, [today])

  if (!queue) return null

  if (queue.length === 0) {
    return (
      <Screen title="Code de la route" subtitle="Rien à réviser aujourd’hui">
        <div className="card-lg text-center">
          <p className="text-[32px]">🎉</p>
          <p className="mt-2 font-display text-lead font-bold">Tout est à jour</p>
          <p className="mt-1.5 text-body text-ink-500">
            Toutes vos questions sont planifiées pour plus tard. Revenez demain, ou ajoutez de
            nouvelles questions au fichier de données.
          </p>
        </div>
      </Screen>
    )
  }

  if (index >= queue.length) {
    const pct = Math.round((score / queue.length) * 100)
    return (
      <Screen title="Session terminée" subtitle={`${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${queue.length}`}>
        <section className="card-hero text-center">
          <p className="text-meta uppercase tracking-label text-white/85">Score de la session</p>
          <p className="mt-1.5 font-display text-[44px] font-bold leading-none">{pct}</p>
          <p className="mt-1.5 text-meta text-white/80">
            {score} sur {queue.length} · {pct >= 80 ? 'excellent' : pct >= 50 ? 'à consolider' : 'à retravailler'}
          </p>
        </section>

        <p className="mt-3.5 rounded-card bg-card p-4 text-body text-ink-700 shadow-soft">
          Les questions ratées reviendront dès la prochaine session ; les autres sont replanifiées
          automatiquement.
        </p>

        <button className="btn btn-primary mt-4" onClick={() => location.reload()}>
          Nouvelle session
        </button>
      </Screen>
    )
  }

  const q = queue[index]
  const answered = picked !== null
  const correct = picked === q.answer

  const answer = async (choice: number) => {
    if (answered) return
    setPicked(choice)
    const ok = choice === q.answer
    if (ok) setScore((s) => s + 1)
    const next = schedule(q, ok, today)
    setLastInterval(next.intervalDays)
    await db.questions.update(q.id!, next)
    await db.attempts.add({ questionId: q.id!, date: today, correct: ok })
  }

  const advance = () => {
    setPicked(null)
    setIndex((i) => i + 1)
  }

  return (
    <Screen
      hero
      title={q.theme}
      subtitle={`Question ${index + 1} sur ${queue.length}`}
      action={
        <span className="chip shrink-0 bg-white/20 font-display font-bold text-white">{score} ✓</span>
      }
    >
      {/* La barre de progression chevauche le bas de l'en-tête dégradé */}
      <div className="-mt-9 mb-5 h-2 rounded-full bg-white/30">
        <div
          className="h-2 rounded-full bg-lime transition-[width]"
          style={{ width: `${Math.round((index / queue.length) * 100)}%` }}
        />
      </div>

      <p className="font-display text-lead font-bold leading-snug">{q.prompt}</p>

      <div className="mt-4 flex flex-col gap-2.5">
        {q.choices.map((c, i) => {
          const isAnswer = i === q.answer
          const state = !answered ? 'idle' : isAnswer ? 'right' : i === picked ? 'wrong' : 'muted'
          return (
            <button
              key={c}
              onClick={() => answer(i)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-tile p-3.5 text-left text-body shadow-soft transition-colors
                ${state === 'right' ? 'bg-lime text-lime-deep' : ''}
                ${state === 'wrong' ? 'bg-ember-soft text-ember' : ''}
                ${state === 'idle' ? 'bg-card' : ''}
                ${state === 'muted' ? 'bg-card text-ink-300' : ''}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-chip font-display text-micro font-bold
                  ${state === 'right' ? 'bg-lime-deep text-lime' : ''}
                  ${state === 'wrong' ? 'bg-ember text-white' : ''}
                  ${state === 'idle' ? 'bg-violet-soft text-violet' : ''}
                  ${state === 'muted' ? 'bg-page text-ink-300' : ''}`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{c}</span>
              {state === 'right' && <Icon name="check" size={18} />}
            </button>
          )
        })}
      </div>

      {answered && (
        <>
          <div className="mt-4 rounded-card bg-violet-soft p-4">
            <p className="label text-violet">{correct ? 'Bonne réponse' : 'À retenir'}</p>
            <p className="mt-1.5 text-body text-ink-700">{q.explanation}</p>
            <p className="mt-2 text-micro text-ink-500">{q.source}</p>
          </div>
          <button className="btn btn-primary mt-4" onClick={advance}>
            {index + 1 === queue.length ? 'Voir le résultat' : 'Question suivante'}
          </button>
          <p className="mt-2.5 text-center text-micro text-ink-300">
            {correct ? dueLabel(lastInterval) : 'à revoir dans cette session'}
          </p>
        </>
      )}
    </Screen>
  )
}
