import { useState } from 'react'
import { clients, common, serviceErrors } from '../../i18n/pt-BR'
import { Button } from '../ui/Button'
import { StatusMessage } from '../ui/StatusMessage'

type DeleteClientConfirmationProps = {
  clientName: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function DeleteClientConfirmation({ clientName, onConfirm, onCancel }: DeleteClientConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleConfirm() {
    setIsDeleting(true)
    setErrorMessage(null)
    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.clientDelete)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-danger/30 bg-danger/[0.06] p-4">
      <p className="text-sm text-foreground">{clients.deleteConfirmation(clientName)}</p>
      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
      <div className="flex gap-2">
        <Button variant="danger" size="small" onClick={() => void handleConfirm()} disabled={isDeleting}>
          {isDeleting ? common.deleting : clients.confirmDelete}
        </Button>
        <Button variant="ghost" size="small" onClick={onCancel} disabled={isDeleting}>
          {common.cancel}
        </Button>
      </div>
    </div>
  )
}
