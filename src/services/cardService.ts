import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { CardCoverInput, CardMove, CardRealtimeHandlers, CardUpdateInput, CreatedCard, NewCardInput } from '../types/board'
import type { Board, Card, CardPriority, CardRequestType } from '../types/database'
import { deleteAttachmentRecordsForCard, removeStorageObjects } from './attachmentService'
import { deleteAssigneesForCard, updateCardAssignees } from './cardAssigneeService'
import { copyStepTemplatesToCard, deleteTasksForCard } from './cardTaskService'
import { subscribeToTableChanges } from './realtimeChannel'

const cardFields =
  'id, board, column_id, title, description, client_id, start_date, position, priority, request_type, cover_attachment_id, created_by, created_at, updated_at'

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

const cardPriorities: CardPriority[] = ['low', 'medium', 'high', 'urgent']

const cardRequestTypes: CardRequestType[] = ['question', 'bug', 'request', 'other']

function optionalOption<Option extends string>(value: unknown, options: Option[]): Option | null {
  return options.includes(value as Option) ? (value as Option) : null
}

function toCard(record: Record<string, unknown>): Card {
  return {
    id: String(record.id),
    board: record.board as Board,
    column_id: String(record.column_id),
    title: String(record.title ?? ''),
    description: optionalString(record.description),
    client_id: optionalString(record.client_id),
    start_date: optionalString(record.start_date),
    position: Number(record.position),
    priority: optionalOption(record.priority, cardPriorities),
    request_type: optionalOption(record.request_type, cardRequestTypes),
    cover_attachment_id: optionalString(record.cover_attachment_id),
    created_by: optionalString(record.created_by),
    created_at: String(record.created_at),
    updated_at: String(record.updated_at),
  }
}

export async function fetchCards(board: Board): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select(cardFields)
    .eq('board', board)
    .order('position', { ascending: true })
  if (error) throw new Error(serviceErrors.cardsLoad)
  return data.map(toCard)
}

// Implementation cards start with a copy of the current implementation steps as their checklist.
export async function createCard({
  board,
  columnId,
  title,
  clientId,
  startDate = null,
  description = null,
  assigneeIds = [],
  position,
  createdBy,
}: NewCardInput): Promise<CreatedCard> {
  const { data, error } = await supabase
    .from('cards')
    .insert({
      board,
      column_id: columnId,
      title,
      client_id: clientId,
      start_date: startDate,
      description,
      position,
      created_by: createdBy,
    })
    .select(cardFields)
    .single()
  if (error) throw new Error(serviceErrors.cardCreate)
  const card = toCard(data)

  // A card without its assignees or checklist would be incomplete, so it is removed again.
  async function removeIncompleteCard() {
    await deleteTasksForCard(card.id).catch(() => undefined)
    await deleteAssigneesForCard(card.id).catch(() => undefined)
    await supabase.from('cards').delete().eq('id', card.id)
  }

  try {
    await updateCardAssignees(card.id, assigneeIds, [])
  } catch {
    await removeIncompleteCard()
    throw new Error(serviceErrors.cardCreate)
  }

  if (board !== 'implementation') return { card, tasks: [] }

  try {
    return { card, tasks: await copyStepTemplatesToCard(card.id) }
  } catch {
    await removeIncompleteCard()
    throw new Error(serviceErrors.checklistCopy)
  }
}

export async function moveCard(cardId: string, { columnId, position }: CardMove): Promise<void> {
  const { data, error } = await supabase
    .from('cards')
    .update({ column_id: columnId, position })
    .eq('id', cardId)
    .select('id')
  if (error) throw new Error(serviceErrors.cardMove)
  // An update blocked by row level security or on a deleted card returns no rows instead of an error.
  if (data.length === 0) throw new Error(serviceErrors.cardMoveMissing)
}

export async function updateCard(
  cardId: string,
  { title, description, startDate, clientId, priority, requestType }: CardUpdateInput,
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update({
      title,
      description,
      start_date: startDate,
      client_id: clientId,
      priority,
      request_type: requestType,
    })
    .eq('id', cardId)
    .select(cardFields)
    .maybeSingle()
  if (error) throw new Error(serviceErrors.cardSave)
  if (!data) throw new Error(serviceErrors.cardSaveMissing)
  return toCard(data)
}

export async function updateCardCover(cardId: string, { coverAttachmentId }: CardCoverInput): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update({ cover_attachment_id: coverAttachmentId })
    .eq('id', cardId)
    .select(cardFields)
    .maybeSingle()
  if (error) throw new Error(serviceErrors.cardCoverSave)
  if (!data) throw new Error(serviceErrors.cardSaveMissing)
  return toCard(data)
}

// Removes the checklist, assignee and attachment rows first, then the card, then the stored files.
export async function deleteCard(cardId: string): Promise<void> {
  await deleteTasksForCard(cardId)
  await deleteAssigneesForCard(cardId)
  const storagePaths = await deleteAttachmentRecordsForCard(cardId)

  const { data, error } = await supabase.from('cards').delete().eq('id', cardId).select('id')
  if (error) throw new Error(serviceErrors.cardDelete)
  if (data.length === 0) throw new Error(serviceErrors.cardDeleteMissing)

  await removeStorageObjects(storagePaths)
}

export function subscribeToCardChanges(board: Board, handlers: CardRealtimeHandlers): () => void {
  return subscribeToTableChanges({
    table: 'cards',
    filter: `board=eq.${board}`,
    toRow: toCard,
    handlers,
  })
}
