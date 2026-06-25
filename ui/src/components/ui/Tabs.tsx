import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

export interface Tab {
  label: string
  path: string
  end?: boolean
}

export interface TabsProps {
  tabs: Tab[]
}

export function Tabs({ tabs }: TabsProps) {
  return (
    <div className="zanellm-muted-surface mb-6 inline-flex gap-1 rounded-md p-1">
      {tabs.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.end ?? true}
          className={({ isActive }) =>
            cn(
              'rounded px-3 py-1.5 text-sm font-medium no-underline transition-colors duration-150',
              isActive
                ? 'bg-white/[0.08] text-text-primary'
                : 'text-text-tertiary hover:bg-white/[0.045] hover:text-text-secondary'
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
