import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  isElevated?: boolean
}

export function Card({ isElevated = false, className = '', ...divProps }: CardProps) {
  return (
    <div
      className={`rounded-card border border-border ${isElevated ? 'bg-elevated' : 'bg-surface'} ${className}`}
      {...divProps}
    />
  )
}
