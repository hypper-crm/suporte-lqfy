import { motion } from 'motion/react'
import { stateTransition } from './motionPresets'

export type TabOption<Value extends string> = {
  value: Value
  label: string
}

type TabsProps<Value extends string> = {
  options: TabOption<Value>[]
  value: Value
  // Shared by the sliding indicator, so it must be unique per tab bar on screen.
  layoutId: string
  ariaLabel: string
  isDisabled?: boolean
  isFullWidth?: boolean
  onChange: (value: Value) => void
}

export function Tabs<Value extends string>({
  options,
  value,
  layoutId,
  ariaLabel,
  isDisabled = false,
  isFullWidth = false,
  onChange,
}: TabsProps<Value>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`${isFullWidth ? 'grid auto-cols-fr grid-flow-col' : 'inline-flex'} rounded-full border border-border bg-surface p-1`}
    >
      {options.map((option) => {
        const isSelected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={isDisabled}
            onClick={() => onChange(option.value)}
            className={`relative h-11 rounded-full px-4 whitespace-nowrap md:h-8 text-sm font-medium outline-none transition-colors duration-200 ease-fluid focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60 ${
              isSelected ? 'text-on-accent' : 'text-muted hover:text-foreground'
            }`}
          >
            {isSelected && (
              <motion.span layoutId={layoutId} transition={{ ...stateTransition, duration: 0.25 }} className="absolute inset-0 rounded-full bg-accent" />
            )}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
