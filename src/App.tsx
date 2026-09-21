import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { db } from './db/db'
import { seedIfEmpty } from './db/seed'
import TabBar from './components/TabBar'
import Today from './features/today/Today'
import Workouts from './features/workouts/Workouts'
import CodeHub from './features/code/CodeHub'
import CodeSession from './features/code/CodeSession'
import CodeProgress from './features/code/CodeProgress'
import CodeLessons from './features/code/CodeLessons'
import CodeLesson from './features/code/CodeLesson'
import Profile from './features/profile/Profile'
import HabitForm from './features/profile/HabitForm'
import HabitDetail from './features/profile/HabitDetail'
import Calendar from './features/calendar/Calendar'
import Insights from './features/insights/Insights'
import Onboarding from './features/onboarding/Onboarding'

export default function App() {
  const [ready, setReady] = useState(false)
  const [welcome, setWelcome] = useState(false)
  const { pathname } = useLocation()
  // Transition façon appli : les écrans « détail » glissent depuis la droite, les onglets fondent.
  const depth = pathname.split('/').filter(Boolean).length
  const prevDepth = useRef(depth)
  const pushed = depth > prevDepth.current
  useEffect(() => {
    prevDepth.current = depth
    window.scrollTo(0, 0)
  }, [pathname, depth])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    seedIfEmpty()
      .then(async () => {
        // Accueil : uniquement à la toute première utilisation (aucun historique).
        const done = await db.settings.get('onboarded')
        const used = (await db.dailyLogs.count()) + (await db.habitEntries.count())
        setWelcome(!done && used === 0)
        setReady(true)
      })
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
  if (!ready)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet to-violet-light">
        <p className="font-display text-[34px] font-bold text-white">Rituel</p>
      </div>
    )
  if (welcome) return <Onboarding onDone={() => setWelcome(false)} />

  return (
    <>
      <div key={pathname} className={pushed ? 'page-push' : 'page-fade'}>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/seance" element={<Workouts />} />
        <Route path="/code" element={<CodeHub />} />
        <Route path="/code/seance" element={<CodeSession />} />
        <Route path="/code/progression" element={<CodeProgress />} />
        <Route path="/code/fiches" element={<CodeLessons />} />
        <Route path="/code/fiche/:theme" element={<CodeLesson />} />
        <Route path="/calendrier" element={<Calendar />} />
        <Route path="/bilan" element={<Insights />} />
        <Route path="/moi" element={<Profile />} />
        <Route path="/habitude/:id" element={<HabitForm />} />
        <Route path="/habitude/:id/suivi" element={<HabitDetail />} />
      </Routes>
      </div>
      {/* Pendant une séance de code, le bouton d'action occupe le bas de l'écran. */}
      {!pathname.startsWith('/code/seance') && !pathname.startsWith('/code/fiche/') && <TabBar />}
    </>
  )
}
