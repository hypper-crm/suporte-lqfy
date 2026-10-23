import type { ReactNode } from 'react'

type BadgeVariant = 'muted' | 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const variantClassNames: Record<BadgeVariant, string> = {
  muted: 'border-border bg-transparent text-subtle',
  neutral: 'border-border-strong bg-elevated text-muted',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
}

type BadgeProps = {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}

export function Badge({ variant = 'neutral', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[11px] leading-none font-medium ${variantClassNames[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
