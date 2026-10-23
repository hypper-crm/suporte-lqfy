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
  // Shown next to the close button below the md breakpoint, usually the save button.
  headerAction?: ReactNode
}

// Render inside AnimatePresence so the drawer can animate out.
export function Drawer({ title, description, onClose, children, footer, headerAction }: DrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Overlays opened above the drawer mark the event as handled.
      if (event.key === 'Escape' && !event.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-drawer flex justify-end">
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
        // Below the md breakpoint the drawer is a full-screen sheet.
        className="relative flex h-full w-full flex-col bg-surface md:max-w-xl md:border-l md:border-border md:shadow-[-24px_0_48px_-24px_rgba(0,0,0,0.8)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-3 pl-[max(1rem,env(safe-area-inset-left))] md:gap-4 md:px-6 md:py-5">
          <div className="flex min-w-0 flex-col gap-1 max-md:self-center">
            <h2 className="truncate text-lg font-semibold">{title}</h2>
            {description && <p className="truncate text-sm text-muted">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerAction && <div className="md:hidden">{headerAction}</div>}
            <Button variant="ghost" size="icon" aria-label={common.close} title={common.close} onClick={onClose}>
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain pt-4 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] md:p-6">
          {children}
        </div>
        {footer && (
          <footer className="border-t border-border px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6 md:py-4">{footer}</footer>
        )}
      </motion.aside>
    </div>
  )
}
