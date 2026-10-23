import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { stateTransition } from './motionPresets'

type MotionProviderProps = {
  children: ReactNode
}

// With reducedMotion set to "user", movement is disabled for people who prefer reduced motion and only opacity animates.
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user" transition={stateTransition}>
      {children}
    </MotionConfig>
  )
}
