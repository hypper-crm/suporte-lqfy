type SwitchProps = {
  id?: string
  label: string
  isChecked: boolean
  isDisabled?: boolean
  onChange: (isChecked: boolean) => void
}

export function Switch({ id, label, isChecked, isDisabled = false, onChange }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={isDisabled}
      onClick={() => onChange(!isChecked)}
      className="flex min-h-11 items-center gap-3 rounded-card text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 md:min-h-8"
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200 ease-fluid ${
          isChecked ? 'border-accent/60 bg-accent' : 'border-border-strong bg-elevated'
        }`}
      >
        <span
          className={`size-3.5 rounded-full shadow-sm transition-transform duration-200 ease-fluid motion-reduce:transition-none ${
            isChecked ? 'translate-x-[18px] bg-on-accent' : 'translate-x-[2px] bg-muted'
          }`}
        />
      </span>
      <span>{label}</span>
    </button>
  )
}
