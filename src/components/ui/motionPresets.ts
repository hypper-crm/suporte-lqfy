import type { Transition } from 'motion/react'

export const fluidEase = [0.22, 1, 0.36, 1] as const

export const fluidEaseCss = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Hover and state changes.
export const stateTransition: Transition = { duration: 0.2, ease: fluidEase }

// Drawers, modals and overlays.
export const overlayTransition: Transition = { duration: 0.3, ease: fluidEase }
