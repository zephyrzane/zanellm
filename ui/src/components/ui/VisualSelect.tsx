import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export interface VisualSelectOption {
  value: string
  label: string
  description?: string
  searchText?: string
  icon?: React.ReactNode
}

export interface VisualSelectProps {
  label?: string
  options: VisualSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function VisualSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  disabled = false,
  error,
  className,
}: VisualSelectProps) {
  const id = useId()
  const labelId = `${id}-label`
  const listboxId = `${id}-listbox`
  const errorId = `${id}-error`
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((option) => option.value === value) ?? null
  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!searchable || !needle) return options
    return options.filter((option) =>
      `${option.label} ${option.description ?? ''} ${option.searchText ?? ''}`.toLowerCase().includes(needle),
    )
  }, [options, query, searchable])

  useEffect(() => {
    if (!open) return
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open && searchable) {
      searchInputRef.current?.focus()
    }
  }, [open, searchable])

  function choose(next: string) {
    onChange(next)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label != null && (
        <label id={labelId} className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label != null ? labelId : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((current) => !current)
        }}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-lg border border-border bg-bg-tertiary px-3 text-left text-sm',
          'transition-colors hover:brightness-95 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-error focus:border-error focus:ring-error/40',
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected?.icon ?? (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-bg-secondary text-xs font-semibold text-text-primary">
              Aa
            </span>
          )}
          <span className="min-w-0">
            <span className={cn('block truncate font-medium', selected ? 'text-text-primary' : 'text-text-tertiary')}>
              {selected?.label ?? placeholder}
            </span>
            {selected?.description ? (
              <span className="block truncate text-xs text-text-tertiary">{selected.description}</span>
            ) : null}
          </span>
        </span>
        <svg
          aria-hidden="true"
          className={cn('ml-3 h-4 w-4 shrink-0 text-text-tertiary transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-hidden rounded-xl border border-border bg-bg-secondary/95 shadow-2xl backdrop-blur-xl"
        >
          {searchable && (
            <div className="border-b border-border p-2">
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="h-9 w-full rounded-md border border-border bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
              />
            </div>
          )}
          <div className="max-h-72 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const active = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                      active ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
                    )}
                  >
                    {option.icon ?? (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-bg-tertiary text-xs font-semibold">
                        Aa
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{option.label}</span>
                      {option.description ? (
                        <span className="block truncate text-xs text-text-tertiary">{option.description}</span>
                      ) : null}
                    </span>
                    {active && (
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-2 text-sm text-text-tertiary">No results</div>
            )}
          </div>
        </div>
      )}
      {error != null && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}
