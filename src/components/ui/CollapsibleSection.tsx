import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type ReactNode } from 'react'

type CollapsibleSectionProps = {
  title: string
  // A short line under the title, such as the current value, shown while the section is closed.
  preview?: string
  // Keeps the section open, for example while a field inside it has an error.
  isForcedOpen?: boolean
  children: ReactNode
}

// Closed by default.
export function CollapsibleSection({ title, preview, isForcedOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isReducedMotion = useReducedMotion()
  const contentId = useId()
  const isExpanded = isOpen || isForcedOpen
  const collapsedHeight = isReducedMotion ? 'auto' : 0

  return (
    <div className="flex flex-col rounded-card border border-border">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsOpen(!isExpanded)}
        className="flex items-center justify-between gap-3 rounded-card px-4 py-3 text-left outline-none transition-colors duration-200 ease-fluid hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          {preview && !isExpanded && <span className="truncate text-xs text-muted">{preview}</span>}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-fluid ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={contentId}
            initial={{ height: collapsedHeight, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: collapsedHeight, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-border p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
