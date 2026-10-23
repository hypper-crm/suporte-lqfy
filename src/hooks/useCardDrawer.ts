import { useCallback } from 'react'
import { cardDetails } from '../i18n/pt-BR'
import type { CardUpdateInput } from '../types/board'
import type { Card, Client } from '../types/database'
import { useCardDetailsForm, type CardDetailsFormState } from './useCardDetailsForm'

export type CardDrawerProps = {
  card: Card
  clients: Client[]
  onSave: (cardId: string, input: CardUpdateInput) => Promise<Card>
  onDelete: (cardId: string) => Promise<void>
  onClose: () => void
}

export type CardDrawerState = {
  form: CardDetailsFormState
  linkedClient: Client | undefined
  // Asks before discarding unsaved edits.
  requestClose: () => void
  deleteCard: () => Promise<void>
}

// Behavior shared by the support and implementation card drawers.
export function useCardDrawer({ card, clients, onSave, onDelete, onClose }: CardDrawerProps): CardDrawerState {
  const saveCard = useCallback((input: CardUpdateInput) => onSave(card.id, input), [card.id, onSave])
  const form = useCardDetailsForm(card, saveCard)
  const linkedClient = card.client_id ? clients.find((client) => client.id === card.client_id) : undefined

  const requestClose = useCallback(() => {
    if (form.isDirty && !window.confirm(cardDetails.unsavedChangesConfirmation)) return
    onClose()
  }, [form.isDirty, onClose])

  const deleteCard = useCallback(async () => {
    await onDelete(card.id)
    onClose()
  }, [card.id, onDelete, onClose])

  return { form, linkedClient, requestClose, deleteCard }
}
