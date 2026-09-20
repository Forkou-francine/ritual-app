import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { seedIfEmpty } from './db/seed'
import TabBar from './components/TabBar'
import Today from './features/today/Today'
import Workouts from './features/workouts/Workouts'
import Remedies from './features/remedies/Remedies'
import CodeRoute from './features/code/CodeRoute'
import Profile from './features/profile/Profile'
import HabitForm from './features/profile/HabitForm'

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    seedIfEmpty()
      .then(() => setReady(true))
      .catch((err: Error) => setError(err?.message ?? String(err)))
  }, [])

  if (error) {
    return (
      <div className="p-6 text-body">
        <p className="font-medium">Impossible de préparer les données.</p>
        <p className="mt-2 text-meta text-ink-500">{error}</p>
      </div>
    )
  }
  if (!ready) return null

  return (
    <>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/seance" element={<Workouts />} />
        <Route path="/soulagement" element={<Remedies />} />
        <Route path="/code" element={<CodeRoute />} />
        <Route path="/moi" element={<Profile />} />
        <Route path="/habitude/:id" element={<HabitForm />} />
      </Routes>
      <TabBar />
    </>
  )
}
