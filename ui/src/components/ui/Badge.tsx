import React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted'
  icon?: React.ReactNode
}

const baseClasses = 'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium'

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'border-border bg-bg-tertiary text-text-primary',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  error: 'border-error/20 bg-error/10 text-error',
  info: 'border-info/20 bg-info/10 text-info',
  muted: 'border-border bg-bg-tertiary text-text-tertiary font-mono',
}

export function Badge({ children, variant = 'default', icon, className, ...rest }: BadgeProps) {
  return (
    <span className={cn(baseClasses, variantClasses[variant], className)} {...rest}>
      {icon != null ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </span>
  )
}
