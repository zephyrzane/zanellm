import { useMemo, useState, useSyncExternalStore } from 'react'
import { Avatar } from '../../components/profile/Avatar'
import { useMe } from '../../hooks/useMe'
import { useUsage } from '../../hooks/useUsage'
import type { UsageDataPoint } from '../../hooks/useUsage'
import { getStoredAvatar, subscribeProfileChanges } from '../../lib/profile'
import { cn, formatCost, formatNumber, formatTokens } from '../../lib/utils'

type RangeKey = '1d' | '7d' | '30d' | 'all'

const ranges: { key: RangeKey; label: string; days: number; heatmapDays: number }[] = [
  { key: '1d', label: '1 day', days: 1, heatmapDays: 1 },
  { key: '7d', label: '7 days', days: 7, heatmapDays: 7 },
  { key: '30d', label: '30 days', days: 30, heatmapDays: 30 },
  { key: 'all', label: 'All time', days: 3650, heatmapDays: 365 },
]

function rangeFor(key: RangeKey): { from: string; to: string; label: string; heatmapDays: number } {
  const config = ranges.find((item) => item.key === key) ?? ranges[2]
  const now = new Date()
  const from = new Date(now.getTime() - config.days * 24 * 3_600_000)
  return {
    from: from.toISOString(),
    to: now.toISOString(),
    label: config.label,
    heatmapDays: config.heatmapDays,
  }
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildCalendar(days: number) {
  const today = new Date()
  const count = Math.max(1, Math.min(days, 365))
  const cells: { key: string; month: string; label: string }[] = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    cells.push({
      key: dayKey(day),
      month: day.toLocaleDateString(undefined, { month: 'short' }),
      label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    })
  }
  return cells
}

function intensityClass(value: number, max: number): string {
  if (value <= 0 || max <= 0) return 'bg-white/[0.045]'
  const ratio = value / max
  if (ratio >= 0.75) return 'bg-[#ff8f8f]'
  if (ratio >= 0.45) return 'bg-[#b86262]'
  if (ratio >= 0.2) return 'bg-[#6f3e3e]'
  return 'bg-[#322222]'
}

function weightedAverage(rows: UsageDataPoint[], field: 'avg_duration_ms' | 'avg_ttft_ms' | 'avg_tokens_per_second') {
  const totalRequests = rows.reduce((sum, row) => sum + row.total_requests, 0)
  if (totalRequests === 0) return 0
  return rows.reduce((sum, row) => sum + row[field] * row.total_requests, 0) / totalRequests
}

function collapse(rows: UsageDataPoint[]): UsageDataPoint {
  return rows.reduce<UsageDataPoint>(
    (acc, row) => ({
      group_key: '',
      group_label: '',
      total_requests: acc.total_requests + row.total_requests,
      successful_requests: acc.successful_requests + row.successful_requests,
      errored_requests: acc.errored_requests + row.errored_requests,
      prompt_tokens: acc.prompt_tokens + row.prompt_tokens,
      completion_tokens: acc.completion_tokens + row.completion_tokens,
      cache_read_tokens: acc.cache_read_tokens + row.cache_read_tokens,
      cache_write_tokens: acc.cache_write_tokens + row.cache_write_tokens,
      reasoning_tokens: acc.reasoning_tokens + row.reasoning_tokens,
      total_tokens: acc.total_tokens + row.total_tokens,
      retry_count: acc.retry_count + row.retry_count,
      fallback_count: acc.fallback_count + row.fallback_count,
      cost_estimate: acc.cost_estimate + row.cost_estimate,
      avg_duration_ms: 0,
      avg_ttft_ms: 0,
      avg_tokens_per_second: 0,
    }),
    {
      group_key: '',
      group_label: '',
      total_requests: 0,
      successful_requests: 0,
      errored_requests: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      reasoning_tokens: 0,
      total_tokens: 0,
      retry_count: 0,
      fallback_count: 0,
      cost_estimate: 0,
      avg_duration_ms: 0,
      avg_ttft_ms: 0,
      avg_tokens_per_second: 0,
    },
  )
}

function RangeSwitcher({ value, onChange }: { value: RangeKey; onChange: (value: RangeKey) => void }) {
  return (
    <div className="inline-flex rounded-xl bg-[#202020] p-1">
      {ranges.map((range) => (
        <button
          key={range.key}
          type="button"
          onClick={() => onChange(range.key)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150',
            value === range.key
              ? 'bg-[#303030] text-text-primary'
              : 'text-text-tertiary hover:bg-white/[0.045] hover:text-text-secondary',
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}

function StatStrip({ summary, rangeLabel, activeDays }: { summary: UsageDataPoint; rangeLabel: string; activeDays: number }) {
  const items = [
    { label: `Requests ${rangeLabel}`, value: formatNumber(summary.total_requests) },
    { label: `Tokens ${rangeLabel}`, value: formatTokens(summary.total_tokens) },
    { label: `Cost ${rangeLabel}`, value: formatCost(summary.cost_estimate) },
    { label: 'Active days', value: formatNumber(activeDays) },
  ]

  return (
    <div className="grid overflow-hidden rounded-xl border border-white/[0.08] md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border-b border-white/[0.08] px-6 py-4 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
          <div className="text-base font-medium text-text-primary">{item.value}</div>
          <div className="mt-1 text-base text-text-secondary">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

function DetailGrid({ summary }: { summary: UsageDataPoint }) {
  const items = [
    ['Input tokens', formatTokens(summary.prompt_tokens)],
    ['Output tokens', formatTokens(summary.completion_tokens)],
    ['Cache read', formatTokens(summary.cache_read_tokens)],
    ['Cache write', formatTokens(summary.cache_write_tokens)],
    ['Reasoning tokens', formatTokens(summary.reasoning_tokens)],
    ['Success / errors', `${formatNumber(summary.successful_requests)} / ${formatNumber(summary.errored_requests)}`],
    ['Avg duration', `${Math.round(summary.avg_duration_ms).toLocaleString()} ms`],
    ['Avg TTFT', `${Math.round(summary.avg_ttft_ms).toLocaleString()} ms`],
    ['Tokens / sec', summary.avg_tokens_per_second.toFixed(1)],
    ['Retries / fallbacks', `${formatNumber(summary.retry_count)} / ${formatNumber(summary.fallback_count)}`],
  ]

  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
          <div className="text-sm text-text-tertiary">{label}</div>
          <div className="mt-1 font-mono text-sm text-text-primary">{value}</div>
        </div>
      ))}
    </section>
  )
}

function TokenActivity({ rows, days }: { rows: UsageDataPoint[]; days: number }) {
  const cells = useMemo(() => buildCalendar(days), [days])
  const values = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of rows) {
      map.set(item.group_key.slice(0, 10), item.total_tokens)
    }
    return map
  }, [rows])
  const max = Math.max(...Array.from(values.values()), 0)
  const monthLabels = cells.reduce<{ month: string; index: number }[]>((acc, cell, index) => {
    const previous = acc[acc.length - 1]
    if ((index === 0 || cell.month !== cells[index - 1]?.month) && (!previous || index - previous.index >= 14)) {
      acc.push({ month: cell.month, index })
    }
    return acc
  }, [])

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-lg font-medium text-text-primary">Token activity</h2>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[360px]">
          <div
            className="grid grid-flow-col grid-rows-7 gap-[3px]"
            style={{ width: Math.max(360, Math.ceil(cells.length / 7) * 15) }}
          >
            {cells.map((cell) => {
              const tokens = values.get(cell.key) ?? 0
              return (
                <span
                  key={cell.key}
                  title={`${cell.label}: ${formatTokens(tokens)}`}
                  className={`h-3 w-3 rounded-sm ${intensityClass(tokens, max)}`}
                />
              )
            })}
          </div>
          <div className="relative mt-3 h-5 text-sm text-text-tertiary">
            {monthLabels.map((label) => (
              <span
                key={`${label.month}-${label.index}`}
                className="absolute"
                style={{ left: `${(label.index / Math.max(cells.length - 1, 1)) * 100}%` }}
              >
                {label.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Breakdown({ title, rows }: { title: string; rows: UsageDataPoint[] }) {
  const sorted = [...rows]
    .filter((row) => row.total_requests > 0 || row.total_tokens > 0)
    .sort((a, b) => b.total_tokens - a.total_tokens)
    .slice(0, 6)

  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <div className="border-b border-white/[0.08] px-4 py-3 text-base font-medium text-text-primary">{title}</div>
      <div className="divide-y divide-white/[0.08]">
        {sorted.length === 0 ? (
          <div className="px-4 py-4 text-sm text-text-tertiary">No data</div>
        ) : (
          sorted.map((row) => (
            <div key={row.group_key || title} className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 truncate text-text-primary">{row.group_label || row.group_key || 'unknown'}</div>
              <div className="font-mono text-text-secondary">{formatTokens(row.total_tokens)}</div>
              <div className="font-mono text-text-tertiary">{formatNumber(row.total_requests)} req</div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default function UsageOverviewPage() {
  const { data: me } = useMe()
  const avatar = useSyncExternalStore(subscribeProfileChanges, getStoredAvatar, () => null)
  const orgId = me?.org_id ?? ''
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d')
  const range = useMemo(() => rangeFor(rangeKey), [rangeKey])

  const summaryQuery = useUsage(orgId, range.from, range.to, '')
  const dayQuery = useUsage(orgId, range.from, range.to, 'day')
  const modelQuery = useUsage(orgId, range.from, range.to, 'model')
  const providerQuery = useUsage(orgId, range.from, range.to, 'provider')
  const endpointQuery = useUsage(orgId, range.from, range.to, 'endpoint')

  const summary = useMemo(() => {
    const rows = summaryQuery.data?.data ?? []
    const base = rows[0] ?? collapse([])
    return {
      ...base,
      avg_duration_ms: weightedAverage(rows, 'avg_duration_ms'),
      avg_ttft_ms: weightedAverage(rows, 'avg_ttft_ms'),
      avg_tokens_per_second: weightedAverage(rows, 'avg_tokens_per_second'),
    }
  }, [summaryQuery.data?.data])

  const activeDays = useMemo(
    () => (dayQuery.data?.data ?? []).filter((row) => row.total_requests > 0 || row.total_tokens > 0).length,
    [dayQuery.data?.data],
  )

  return (
    <div className="mx-auto min-h-full max-w-[1120px] pb-16 pt-12">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col items-center lg:items-start">
          <Avatar name={me?.display_name} src={avatar} size="xl" className="mb-5" />
          <h1 className="text-3xl font-medium text-text-primary">Welcome back, {me?.display_name ?? 'user'}</h1>
        </div>
        <RangeSwitcher value={rangeKey} onChange={setRangeKey} />
      </div>

      <StatStrip summary={summary} rangeLabel={range.label} activeDays={activeDays} />
      <DetailGrid summary={summary} />
      <TokenActivity rows={dayQuery.data?.data ?? []} days={range.heatmapDays} />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Breakdown title="Models" rows={modelQuery.data?.data ?? []} />
        <Breakdown title="Providers" rows={providerQuery.data?.data ?? []} />
        <Breakdown title="Endpoints" rows={endpointQuery.data?.data ?? []} />
      </div>
    </div>
  )
}
