import { db } from './db'
import { exerciseSeed } from '../data/exercises'
import { questionSeed } from '../data/questions'
import { habitSeed } from '../data/habits'
import { isoDate } from '../lib/date'

export async function seedIfEmpty() {
  // Le test « déjà amorcé ? » vit dans la transaction : deux appels concurrents
  // (React StrictMode monte deux fois en dev) sérialisent alors au lieu de semer en double.
  await db.transaction('rw', db.exercises, db.questions, db.settings, async () => {
    const done = await db.settings.get('seeded')
    if (done) return
    await db.exercises.bulkAdd(exerciseSeed)
    await db.questions.bulkAdd(questionSeed(isoDate()))
    await db.settings.put({ key: 'seeded', value: 1 })
  })

  // Complète la banque : les questions ajoutées après le premier lancement arrivent ici.
  await db.transaction('rw', db.questions, async () => {
    const known = new Set((await db.questions.toArray()).map((q) => q.prompt))
    const missing = questionSeed(isoDate()).filter((q) => !known.has(q.prompt))
    if (missing.length) await db.questions.bulkAdd(missing)
  })

  // Amorçage séparé : les bases créées avant les habitudes doivent le recevoir aussi.
  await db.transaction('rw', db.habits, db.settings, async () => {
    const done = await db.settings.get('habitsSeeded')
    if (done) return
    if ((await db.habits.count()) === 0) await db.habits.bulkAdd(habitSeed)
    await db.settings.put({ key: 'habitsSeeded', value: 1 })
  })
}

export async function getOrCreateLog(date: string) {
  // Lecture et création dans une même transaction : IndexedDB sérialise les transactions
  // « rw » de même portée, donc deux appels concurrents ne peuvent pas insérer la même
  // date deux fois. Sans cela, le second `add` échoue sur l'index unique `&date`, et
  // l'écriture avortée casse le suivi optimiste des liveQuery (écran blanc).
  return db.transaction('rw', db.dailyLogs, async () => {
    const existing = await db.dailyLogs.get({ date })
    if (existing) return existing
    const id = await db.dailyLogs.add({ date, waterMl: 0, steps: 0, workoutDone: false })
    return (await db.dailyLogs.get(id))!
  })
}

export async function patchLog(date: string, patch: Partial<{ waterMl: number; steps: number; workoutDone: boolean }>) {
  const log = await getOrCreateLog(date)
  await db.dailyLogs.update(log.id!, patch)
}
