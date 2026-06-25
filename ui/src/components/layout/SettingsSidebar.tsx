import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const iconProps = {
  className: 'h-5 w-5 shrink-0',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function IconArrowLeft() {
  return (
    <svg {...iconProps}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function IconGear() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.05V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.05-.4H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.03 3.84l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.05V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.38.55.64 1 .74.2.05.4.06.6.06h.09a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1.2Z" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg {...iconProps}>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 5-7" />
    </svg>
  )
}

function IconGateway() {
  return (
    <svg {...iconProps}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  )
}

const items = [
  { label: 'General', path: '/settings', icon: <IconGear /> },
  { label: 'Profile', path: '/profile', icon: <IconUser /> },
  { label: 'Usage', path: '/usage', icon: <IconChart /> },
  { label: 'API & Accounts', path: '/gateway', icon: <IconGateway /> },
]

export function SettingsSidebar() {
  const [query, setQuery] = useState('')
  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) => item.label.toLowerCase().includes(needle))
  }, [query])

  return (
    <aside aria-label="Settings navigation" className="fixed left-0 top-0 z-40 flex h-screen w-[371px] flex-col bg-bg-primary px-2 py-5">
      <Link to="/gateway" className="mb-5 flex h-8 items-center gap-2 rounded-lg px-3 text-lg text-text-secondary no-underline hover:bg-white/[0.055] hover:text-text-primary">
        <IconArrowLeft />
        <span>Back to app</span>
      </Link>

      <label className="relative mb-6 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
          <IconSearch />
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search settings..."
          className="zanellm-control-surface h-9 w-full rounded-xl border border-white/[0.08] pl-10 pr-3 text-lg text-text-primary outline-none placeholder:text-text-tertiary focus:border-white/20"
        />
      </label>

      <div className="mb-2 px-2 text-lg text-text-tertiary">Personal</div>
      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/settings' || item.path === '/gateway'}
            className={({ isActive }) =>
              [
                'flex h-10 items-center gap-3 rounded-lg px-3 py-2 text-lg no-underline transition-colors',
                isActive
                  ? 'bg-white/[0.08] text-text-primary'
                  : 'text-text-secondary hover:bg-white/[0.055] hover:text-text-primary',
              ].join(' ')
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
