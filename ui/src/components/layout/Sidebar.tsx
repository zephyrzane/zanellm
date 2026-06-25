import { NavLink } from 'react-router-dom'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  end?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const iconProps = {
  className: 'h-5 w-5 shrink-0',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function IconDashboard() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconLayers() {
  return (
    <svg {...iconProps}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  )
}

function IconTerminal() {
  return (
    <svg {...iconProps}>
      <path d="m4 7 5 5-5 5" />
      <path d="M12 19h8" />
    </svg>
  )
}

function IconGuide() {
  return (
    <svg {...iconProps}>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5Z" />
      <path d="M8 7h6" />
      <path d="M8 11h7" />
    </svg>
  )
}

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.49 0-.24-.01-1.04-.02-1.89-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.13-4.55-5.03 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.04A9.3 9.3 0 0 1 12 6.91c.85 0 1.7.12 2.5.35 1.91-1.32 2.75-1.04 2.75-1.04.55 1.4.2 2.44.1 2.7.64.71 1.03 1.62 1.03 2.73 0 3.91-2.34 4.76-4.57 5.02.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.04 10.04 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  )
}

function buildNavigation(): NavGroup[] {
  return [
    {
      label: '',
      items: [
        { label: 'Dashboard', path: '/', icon: <IconDashboard /> },
        { label: 'API & Accounts', path: '/gateway', icon: <IconLayers /> },
        { label: 'Playground', path: '/playground', icon: <IconTerminal /> },
        { label: 'Guide', path: '/guide', icon: <IconGuide /> },
      ],
    },
  ]
}

export function Sidebar() {
  const visibleGroups = buildNavigation()

  return (
    <aside
      aria-label="Main navigation"
      className="fixed left-0 top-0 z-40 flex h-screen w-[300px] flex-col bg-bg-primary"
    >
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-4 py-5">
        {visibleGroups.map((group, groupIndex) => (
            <div key={group.label || `group-${groupIndex}`}>
              {groupIndex > 0 && (
                <div className="my-3 h-px bg-white/[0.07]" />
              )}
              {group.label && (
                <div className="px-0 pb-2 pt-4 text-sm text-text-tertiary/70">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end !== undefined ? item.end : item.path === '/'}
                    className={({ isActive }) =>
                      [
                        'flex h-10 items-center gap-2.5 rounded-lg px-3 text-lg no-underline transition-colors duration-150',
                        isActive
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:bg-white/[0.055] hover:text-text-primary',
                      ].join(' ')
                    }
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
              ))}
            </div>
          ))}
      </nav>

      <div className="shrink-0 px-4 pb-5">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
          <p className="text-sm text-text-tertiary">Found an issue?</p>
          <a
            href="https://github.com/zephyrzane/zanellm/pulls"
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-2 text-sm font-medium text-text-secondary no-underline hover:text-text-primary"
            aria-label="Open a pull request on GitHub"
          >
            <IconGitHub />
            <span>Open a PR on GitHub</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
