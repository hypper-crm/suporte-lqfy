type MetricChipProps = {
  label: string
  value: number
  description?: string
  // Shows the value in amber when it is greater than zero.
  isWarning?: boolean
}

// The label truncates on narrow screens so the value always stays visible.
export function MetricChip({ label, value, description, isWarning = false }: MetricChipProps) {
  return (
    <div title={description} className="flex h-12 min-w-0 flex-col justify-center rounded-card border border-border bg-surface px-3">
      <dt className="truncate text-[11px] leading-4 font-medium tracking-[0.08em] text-muted uppercase">{label}</dt>
      <dd className={`text-sm leading-5 font-semibold tabular-nums ${isWarning && value > 0 ? 'text-warning' : ''}`}>{value}</dd>
    </div>
  )
}
