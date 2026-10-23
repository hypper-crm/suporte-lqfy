type ProgressBarSize = 'thin' | 'medium'

const sizeClassNames: Record<ProgressBarSize, string> = {
  thin: 'h-1',
  medium: 'h-1.5',
}

type ProgressBarProps = {
  value: number
  maximum: number
  label: string
  size?: ProgressBarSize
}

export function ProgressBar({ value, maximum, label, size = 'medium' }: ProgressBarProps) {
  const percentage = maximum > 0 ? Math.min(100, Math.max(0, (value / maximum) * 100)) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={maximum}
      aria-valuenow={value}
      className={`w-full overflow-hidden rounded-full bg-border-strong/60 ${sizeClassNames[size]}`}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300 ease-fluid"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
