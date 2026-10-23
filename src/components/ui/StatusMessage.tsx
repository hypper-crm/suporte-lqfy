import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { stateTransition } from './motionPresets'

type StatusMessageVariant = 'error' | 'info' | 'success'

const variantClassNames: Record<StatusMessageVariant, string> = {
  error: 'border-danger/25 bg-danger/10 text-danger',
  info: 'border-border-strong bg-elevated text-muted',
  success: 'border-accent/25 bg-accent/10 text-accent',
}

type StatusMessageProps = {
  variant: StatusMessageVariant
  children: ReactNode
}

export function StatusMessage({ variant, children }: StatusMessageProps) {
  return (
    <motion.p
      role={variant === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={stateTransition}
      className={`rounded-card border px-3 py-2 text-sm ${variantClassNames[variant]}`}
    >
      {children}
    </motion.p>
  )
}
