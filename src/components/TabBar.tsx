import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const tabs = [
  { to: '/', icon: 'home', label: 'Aujourd’hui' },
  { to: '/seance', icon: 'barbell', label: 'Séance' },
  { to: '/soulagement', icon: 'leaf', label: 'Soulagement' },
  { to: '/code', icon: 'car', label: 'Code' },
  { to: '/moi', icon: 'user', label: 'Moi' },
]

export default function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-page/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 pb-3 pt-3 text-[10px] transition-colors ${
                  isActive ? 'font-semibold text-violet' : 'text-ink-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-chip transition-colors ${
                      isActive ? 'bg-violet-soft' : ''
                    }`}
                  >
                    <Icon name={t.icon} size={20} />
                  </span>
                  {t.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
