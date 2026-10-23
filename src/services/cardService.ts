import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { CardMove, CardRealtimeHandlers, CardUpdateInput, CreatedCard, NewCardInput } from '../types/board'
import type { Board, Card, CardPriority, CardRequestType } from '../types/database'
import { deleteAttachmentRecordsForCard, removeStorageObjects } from './attachmentService'
import { copyStepTemplatesToCard, deleteTasksForCard } from './cardTaskService'
import { subscribeToTableChanges } from './realtimeChannel'

const cardFields =
  'id, board, column_id, title, description, client_id, assignee_id, start_date, position, priority, request_type, created_by, created_at, updated_at'

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
    assignee_id: optionalString(record.assignee_id),
    start_date: optionalString(record.start_date),
    position: Number(record.position),
    priority: optionalOption(record.priority, cardPriorities),
    request_type: optionalOption(record.request_type, cardRequestTypes),
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
export async function createCard({ board, columnId, title, clientId, position, createdBy }: NewCardInput): Promise<CreatedCard> {
  const { data, error } = await supabase
    .from('cards')
    .insert({ board, column_id: columnId, title, client_id: clientId, position, created_by: createdBy })
    .select(cardFields)
    .single()
  if (error) throw new Error(serviceErrors.cardCreate)
  const card = toCard(data)
  if (board !== 'implementation') return { card, tasks: [] }

  try {
    return { card, tasks: await copyStepTemplatesToCard(card.id) }
  } catch {
    // A card without its checklist would be incomplete, so it is removed again.
    await deleteTasksForCard(card.id).catch(() => undefined)
    await supabase.from('cards').delete().eq('id', card.id)
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
  { title, description, startDate, clientId, assigneeId, priority, requestType }: CardUpdateInput,
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update({
      title,
      description,
      start_date: startDate,
      client_id: clientId,
      assignee_id: assigneeId,
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

// Removes the checklist and attachment rows first, then the card, then the stored files.
export async function deleteCard(cardId: string): Promise<void> {
  await deleteTasksForCard(cardId)
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
