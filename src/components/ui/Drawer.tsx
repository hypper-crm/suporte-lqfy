import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { common } from '../../i18n/pt-BR'
import { Button } from './Button'
import { overlayTransition } from './motionPresets'

type DrawerProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

// Render inside AnimatePresence so the drawer can animate out.
export function Drawer({ title, description, onClose, children, footer }: DrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Overlays opened above the drawer mark the event as handled.
      if (event.key === 'Escape' && !event.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-20 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={overlayTransition}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onMouseDown={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={overlayTransition}
        className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-[-24px_0_48px_-24px_rgba(0,0,0,0.8)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" aria-label={common.close} title={common.close} onClick={onClose}>
            <X aria-hidden="true" className="size-4" />
          </Button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">{children}</div>
        {footer && <footer className="border-t border-border px-6 py-4">{footer}</footer>}
      </motion.aside>
    </div>
  )
}
