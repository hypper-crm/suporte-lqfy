import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cardDetails, common, serviceErrors } from '../../i18n/pt-BR'
import { Button } from '../../components/ui/Button'
import { StatusMessage } from '../../components/ui/StatusMessage'

type DeleteCardSectionProps = {
  cardTitle: string
  onConfirm: () => Promise<void>
}

export function DeleteCardSection({ cardTitle, onConfirm }: DeleteCardSectionProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleConfirm() {
    setIsDeleting(true)
    setErrorMessage(null)
    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.cardDelete)
      setIsDeleting(false)
    }
  }

  if (!isConfirming) {
    return (
      <Button variant="dangerGhost" onClick={() => setIsConfirming(true)} className="self-start">
        <Trash2 aria-hidden="true" className="size-4" />
        {cardDetails.deleteCard.open}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-danger/30 bg-danger/[0.06] p-4">
      <p className="text-sm text-foreground">{cardDetails.deleteCard.confirmation(cardTitle)}</p>
      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
      <div className="flex gap-2">
        <Button variant="danger" size="small" onClick={() => void handleConfirm()} disabled={isDeleting}>
          {isDeleting ? common.deleting : cardDetails.deleteCard.confirm}
        </Button>
        <Button variant="ghost" size="small" onClick={() => setIsConfirming(false)} disabled={isDeleting}>
          {common.cancel}
        </Button>
      </div>
    </div>
  )
}
