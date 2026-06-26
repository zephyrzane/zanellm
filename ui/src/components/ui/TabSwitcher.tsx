import { cn } from '../../lib/utils'

export interface Tab {
  key: string
  label: string
}

export interface TabSwitcherProps {
  tabs: Tab[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export default function TabSwitcher({ tabs, activeKey, onChange, className }: TabSwitcherProps) {
  return (
    <div role="tablist" className={cn('inline-flex gap-1 rounded-xl bg-bg-tertiary p-1', className ?? 'mb-6')}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === activeKey}
          onClick={() => onChange(tab.key)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150',
            tab.key === activeKey
              ? 'bg-bg-secondary text-text-primary'
              : 'text-text-tertiary hover:bg-bg-secondary hover:text-text-secondary'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
