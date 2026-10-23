import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import type { CardDetailsFormState } from '../../hooks/useCardDetailsForm'
import { cardDetails } from '../../i18n/pt-BR'
import { CardDescriptionField, CardTitleField } from './CardFormFields'

const contentId = 'card-title-description-content'

type CardTitleDescriptionSectionProps = {
  form: CardDetailsFormState
  // The title can be left empty when the card has a client, whose name is then saved as the title.
  isTitleRequired: boolean
}

// Closed by default. The header shows the current title, so the user knows what is inside.
export function CardTitleDescriptionSection({ form, isTitleRequired }: CardTitleDescriptionSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isReducedMotion = useReducedMotion()
  // A title error is never hidden inside the closed section.
  const isExpanded = isOpen || Boolean(form.titleErrorMessage)
  const title = form.values.title.trim()
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
          <span className="text-sm font-medium">{cardDetails.titleAndDescription}</span>
          <span className={`truncate text-xs ${title ? 'text-muted' : 'text-subtle'}`}>{title || cardDetails.noTitle}</span>
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
            <div className="flex flex-col gap-4 border-t border-border p-4">
              <CardTitleField form={form} isRequired={isTitleRequired} />
              <CardDescriptionField form={form} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
