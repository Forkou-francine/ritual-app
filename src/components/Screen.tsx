import type { ReactNode } from 'react'

/**
 * Coquille d'écran. `hero` reprend l'en-tête dégradé violet de la maquette
 * (écran « détail »), sinon on garde l'en-tête clair de l'écran « Aujourd'hui ».
 */
export default function Screen({
  title,
  subtitle,
  eyebrow,
  action,
  hero,
  children,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  action?: ReactNode
  hero?: boolean
  children: ReactNode
}) {
  if (hero) {
    return (
      <main className="mx-auto max-w-md pb-32">
        <header className="rounded-b-[28px] bg-gradient-to-b from-violet to-violet-light px-5 pb-7 pt-[max(2.75rem,env(safe-area-inset-top))] text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-title font-bold first-letter:uppercase">{title}</h1>
              {subtitle && <p className="mt-1 text-body text-white/80">{subtitle}</p>}
            </div>
            {action}
          </div>
        </header>
        <div className="px-5 pt-5">{children}</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-32 pt-[max(2.75rem,env(safe-area-inset-top))]">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="text-body text-ink-500 first-letter:uppercase">{eyebrow}</p>}
          <h1 className="font-display text-title font-bold first-letter:uppercase">{title}</h1>
          {subtitle && <p className="mt-1 text-body text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </main>
  )
}
