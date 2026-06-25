import React from 'react'
import { cn } from '../../lib/utils'

// Map of named colors to Tailwind bg/text utility pairs
const iconColorMap: Record<string, { bg: string; text: string }> = {
  purple: { bg: 'bg-white/[0.06]', text: 'text-text-primary' },
  green:  { bg: 'bg-success/10', text: 'text-success' },
  pink:   { bg: 'bg-info/10', text: 'text-info' },
  blue:   { bg: 'bg-info/10', text: 'text-info' },
  yellow: { bg: 'bg-warning/10', text: 'text-warning' },
  red:    { bg: 'bg-error/10', text: 'text-error' },
}

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; label?: string }
  /** Optional color name for the icon bubble. E.g. "purple", "green", "pink" */
  iconColor?: string
}

function trendPrefix(value: number): string {
  if (value > 0) return '▲'
  if (value < 0) return '▼'
  return '—'
}

function trendColorClass(value: number): string {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-error'
  return 'text-text-tertiary'
}

export function StatCard({ label, value, icon, trend, iconColor, className, ...rest }: StatCardProps) {
  const colorClasses = iconColor != null ? (iconColorMap[iconColor] ?? null) : null

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'zanellm-muted-surface relative overflow-hidden rounded-xl p-4',
        className,
      )}
      {...rest}
    >
      <div className="relative">
        {icon != null ? (
          <span
            className={cn(
              'shrink-0 mb-3 block w-fit',
              colorClasses != null
                ? cn('p-2 rounded-full border border-white/[0.06]', colorClasses.bg, colorClasses.text)
                : 'text-text-tertiary',
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}

        <div className="text-xl font-medium text-text-primary">{value}</div>
        <div className="mt-1 text-xs text-text-tertiary">{label}</div>

        {trend != null ? (
          <div className={cn('text-sm mt-2', trendColorClass(trend.value))}>
            {trendPrefix(trend.value)}{trend.label != null ? ` ${trend.label}` : ` ${Math.abs(trend.value)}`}
          </div>
        ) : null}
      </div>
    </div>
  )
}
