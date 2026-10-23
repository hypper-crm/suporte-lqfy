import { Plus } from 'lucide-react'
import { boards } from '../../i18n/pt-BR'

type AddCardOpenButtonProps = {
  onClick: () => void
}

// Shown at the bottom of a column while the add card form is closed.
export function AddCardOpenButton({ onClick }: AddCardOpenButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center gap-2 md:h-9 rounded-card px-2.5 text-left text-sm font-medium text-muted outline-none transition-colors duration-200 ease-fluid hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <Plus aria-hidden="true" className="size-4" />
      {boards.addCard.open}
    </button>
  )
}
