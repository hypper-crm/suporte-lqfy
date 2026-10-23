import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost' | 'link'

// Below the md breakpoint every size grows to a 44px touch target.
type ButtonSize = 'compact' | 'small' | 'medium' | 'icon'

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-strong',
  secondary: 'border border-border bg-surface text-foreground hover:border-border-strong hover:bg-hover',
  ghost: 'text-muted hover:bg-hover hover:text-foreground',
  danger: 'bg-danger text-white hover:bg-danger/85',
  dangerGhost: 'text-danger hover:bg-danger/10',
  link: 'text-accent hover:text-accent-strong',
}

const sizeClassNames: Record<ButtonSize, string> = {
  compact: 'h-11 px-2 text-xs md:h-7',
  small: 'h-11 px-3 text-xs md:h-8',
  medium: 'h-11 px-4 text-sm md:h-9',
  icon: 'size-11 md:size-8',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'secondary', size = 'medium', type = 'button', className = '', ...buttonProps }: ButtonProps) {
  const sizeClassName = variant === 'link' ? 'h-auto min-h-11 px-0 text-sm md:min-h-0' : sizeClassNames[size]
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap outline-none transition-[background-color,border-color,color,opacity] duration-200 ease-fluid focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 ${variantClassNames[variant]} ${sizeClassName} ${className}`}
      {...buttonProps}
    />
  )
}
