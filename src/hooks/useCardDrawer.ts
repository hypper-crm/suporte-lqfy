import { useCallback, useMemo } from 'react'
import { cardDetails } from '../i18n/pt-BR'
import { isImageAttachment } from '../lib/attachmentFiles'
import type { CardCoverImage } from '../lib/cardCover'
import type { CardCoverInput, CardDetailsInput, SavedCardDetails } from '../types/board'
import type { Card, CardAttachment, Client } from '../types/database'
import { useCardAttachments, type CardAttachmentsState } from './useCardAttachments'
import { useCardDetailsForm, type CardDetailsFormState } from './useCardDetailsForm'

export type CardDrawerProps = {
  card: Card
  // Profile ids of the card's assignees.
  assigneeIds: string[]
  clients: Client[]
  currentUserId: string
  // Undefined when the card has no cover.
  cover: CardCoverImage | undefined
  // Days since the start date, only when the card is overdue.
  overdueDayCount: number | undefined
  onSave: (cardId: string, input: CardDetailsInput) => Promise<SavedCardDetails>
  onUpdateCover: (cardId: string, input: CardCoverInput) => Promise<void>
  onDelete: (cardId: string) => Promise<void>
  onClose: () => void
}

export type CardDrawerState = {
  form: CardDetailsFormState
  linkedClient: Client | undefined
  // Shared by the attachments section and the cover picker.
  attachmentsState: CardAttachmentsState
  imageAttachments: CardAttachment[]
  // Asks before discarding unsaved edits.
  requestClose: () => void
  updateCover: (input: CardCoverInput) => Promise<void>
  deleteCard: () => Promise<void>
}

// Behavior shared by the support and implementation card drawers.
export function useCardDrawer({
  card,
  assigneeIds,
  clients,
  currentUserId,
  onSave,
  onUpdateCover,
  onDelete,
  onClose,
}: CardDrawerProps): CardDrawerState {
  const saveCard = useCallback((input: CardDetailsInput) => onSave(card.id, input), [card.id, onSave])
  // An implementation card is always titled with its client's name.
  const getLinkedTitle = useCallback(
    (clientId: string) => (card.board === 'implementation' ? clients.find((client) => client.id === clientId)?.name : undefined),
    [card.board, clients],
  )
  const form = useCardDetailsForm(card, assigneeIds, saveCard, getLinkedTitle)
  const linkedClient = card.client_id ? clients.find((client) => client.id === card.client_id) : undefined
  const attachmentsState = useCardAttachments(card.id, currentUserId)
  const imageAttachments = useMemo(() => attachmentsState.attachments.filter(isImageAttachment), [attachmentsState.attachments])

  const requestClose = useCallback(() => {
    if (form.isDirty && !window.confirm(cardDetails.unsavedChangesConfirmation)) return
    onClose()
  }, [form.isDirty, onClose])

  const updateCover = useCallback((input: CardCoverInput) => onUpdateCover(card.id, input), [card.id, onUpdateCover])

  const deleteCard = useCallback(async () => {
    await onDelete(card.id)
    onClose()
  }, [card.id, onDelete, onClose])

  return { form, linkedClient, attachmentsState, imageAttachments, requestClose, updateCover, deleteCard }
}
