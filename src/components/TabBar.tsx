import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'

const left = [
  { to: '/', icon: 'home', label: 'Aujourd’hui' },
  { to: '/code', icon: 'car', label: 'Code' },
]
const right = [
  { to: '/bilan', icon: 'chart', label: 'Bilan' },
  { to: '/moi', icon: 'user', label: 'Moi' },
]

function Tab({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <li className="flex-1">
      <NavLink
        to={to}
        end={to === '/'}
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
              <Icon name={icon} size={20} />
            </span>
            {label}
          </>
        )}
      </NavLink>
    </li>
  )
}

export default function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-page/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-start">
        {left.map((t) => (
          <Tab key={t.to} {...t} />
        ))}
        <li className="flex flex-1 justify-center">
          <Link
            to="/habitude/nouvelle"
            aria-label="Nouvelle habitude"
            className="-mt-3 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-violet to-violet-light text-white shadow-lift transition-transform active:scale-95"
          >
            <Icon name="plus" size={26} />
          </Link>
        </li>
        {right.map((t) => (
          <Tab key={t.to} {...t} />
        ))}
      </ul>
    </nav>
  )
}
