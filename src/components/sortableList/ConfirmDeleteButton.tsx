import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { common } from '../../i18n/pt-BR'
import { Button } from '../ui/Button'

type ConfirmDeleteButtonProps = {
  label: string
  confirmationText: string
  note?: string
  onConfirm: () => Promise<void>
}

// A small delete button that asks for confirmation inline before deleting.
export function ConfirmDeleteButton({ label, confirmationText, note, onConfirm }: ConfirmDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function confirm() {
    setIsDeleting(true)
    setErrorMessage(null)
    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : common.unknownError)
      setIsDeleting(false)
    }
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => setIsConfirming(true)}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-subtle outline-none transition-colors duration-200 ease-fluid hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1 text-xs">
      <div className="flex flex-wrap items-center justify-end gap-1">
        <span className="pr-1 text-danger">{confirmationText}</span>
        <Button variant="dangerGhost" size="small" onClick={() => void confirm()} disabled={isDeleting} className="h-7 px-2">
          {isDeleting ? common.deleting : common.yesDelete}
        </Button>
        <Button
          variant="ghost"
          size="small"
          onClick={() => {
            setIsConfirming(false)
            setErrorMessage(null)
          }}
          disabled={isDeleting}
          className="h-7 px-2"
        >
          {common.cancel}
        </Button>
      </div>
      {note && <p className="text-subtle">{note}</p>}
      {errorMessage && (
        <p role="alert" className="text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
