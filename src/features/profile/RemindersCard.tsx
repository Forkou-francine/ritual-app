import { useState } from 'react'
import { setReminder, useReminders } from '../../db/reminders'
import { SESSION_TITLES } from '../../data/exercises'
import { buildIcs, deliverIcs } from '../../lib/ics'
import type { Weekday } from '../../db/types'
import Icon from '../../components/Icon'

const ALL: Weekday[] = [1, 2, 3, 4, 5, 6, 0]

/** Ajoute des minutes à une heure « HH:MM » (sans passer minuit). */
function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = Math.min(23 * 60 + 59, h * 60 + m + minutes)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function RemindersCard() {
  const r = useReminders()
  const [msg, setMsg] = useState('')

  const exportToCalendar = async () => {
    const base = window.location.origin
    const sportEnd = r.sportEnd > r.sportStart ? r.sportEnd : addMinutes(r.sportStart, 60)
    const events = ALL.flatMap((day) => [
      {
        uid: 'seance',
        title: `🏃 Séance : ${SESSION_TITLES[day]}`,
        description: 'Ouvrez Rituel pour la séance du jour.',
        url: `${base}/seance`,
        start: r.sportStart,
        end: sportEnd,
        day,
      },
      {
        uid: 'code',
        title: '🚗 Code de la route',
        description: 'Série de questions du jour dans Rituel.',
        url: `${base}/code`,
        start: r.code,
        end: addMinutes(r.code, 30),
        day,
      },
    ])

    const res = await deliverIcs(buildIcs(events), 'rituel-rappels.ics')
    setMsg(
      res === 'cancelled'
        ? ''
        : res === 'shared'
          ? 'Choisissez « Calendrier » (ou Enregistrer, puis ouvrez le fichier) pour ajouter les rappels.'
          : 'Fichier téléchargé : ouvrez-le pour l’ajouter à votre agenda.',
    )
  }

  const field = (label: string, id: string, value: string, key: 'sportStart' | 'sportEnd' | 'code') => (
    <div className="flex-1">
      <label className="block text-micro text-ink-500" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => setReminder(key, e.target.value)}
        className="mt-1.5 h-11 w-full rounded-chip bg-page px-2 text-center font-display text-body font-bold text-violet outline-none"
      />
    </div>
  )

  return (
    <section className="mt-3.5 rounded-card bg-card p-4 shadow-soft">
      <h2 className="label">Rappels dans mon agenda</h2>
      <p className="mt-1.5 text-micro text-ink-500">
        Sport et code de la route, tous les jours. Les notifications viennent de l’agenda du téléphone.
      </p>
      <div className="mt-3 flex gap-3">
        {field('Sport : début', 'rem-sport-start', r.sportStart, 'sportStart')}
        {field('Sport : fin', 'rem-sport-end', r.sportEnd, 'sportEnd')}
        {field('Code', 'rem-code', r.code, 'code')}
      </div>
      <button onClick={exportToCalendar} className="btn btn-violet mt-3.5 flex items-center justify-center gap-2">
        <Icon name="plus" size={18} />
        Ajouter à mon agenda
      </button>
      {msg && <p className="mt-2.5 text-micro text-ink-500">{msg}</p>}
      <p className="mt-2.5 text-micro text-ink-500">
        Après avoir changé une heure, ajoutez de nouveau à l’agenda : les événements existants sont mis à jour.
      </p>
    </section>
  )
}
