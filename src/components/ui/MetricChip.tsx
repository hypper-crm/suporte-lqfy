type MetricChipProps = {
  label: string
  value: number
  description?: string
}

export function MetricChip({ label, value, description }: MetricChipProps) {
  return (
    <div title={description} className="flex h-14 shrink-0 flex-col justify-center gap-0.5 rounded-card border border-border bg-surface px-3.5">
      <dt className="section-label whitespace-nowrap">{label}</dt>
      <dd className="text-sm leading-5 font-semibold">{value}</dd>
    </div>
  )
}
