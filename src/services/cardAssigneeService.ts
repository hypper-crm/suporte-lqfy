import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { CardAssigneeRealtimeHandlers } from '../types/board'
import type { CardAssignee } from '../types/database'

const cardAssigneeFields = 'card_id, profile_id'

// Supabase returns at most 1000 rows per request, so all rows are read page by page.
const pageSize = 1000

function toCardAssignee(record: Record<string, unknown>): CardAssignee | null {
  if (typeof record.card_id !== 'string' || typeof record.profile_id !== 'string') return null
  return { card_id: record.card_id, profile_id: record.profile_id }
}

export async function listAllCardAssignees(): Promise<CardAssignee[]> {
  const assignees: CardAssignee[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('card_assignees')
      .select(cardAssigneeFields)
      .order('card_id', { ascending: true })
      .order('profile_id', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw new Error(serviceErrors.assigneesLoad)
    assignees.push(...data.flatMap((record) => toCardAssignee(record) ?? []))
    if (data.length < pageSize) return assignees
  }
}

// Adds and removes rows so the card ends up with exactly the given assignees.
export async function updateCardAssignees(cardId: string, addedProfileIds: string[], removedProfileIds: string[]): Promise<void> {
  if (addedProfileIds.length > 0) {
    const { error } = await supabase
      .from('card_assignees')
      .insert(addedProfileIds.map((profileId) => ({ card_id: cardId, profile_id: profileId })))
    if (error) throw new Error(serviceErrors.assigneesSave)
  }
  if (removedProfileIds.length > 0) {
    const { error } = await supabase.from('card_assignees').delete().eq('card_id', cardId).in('profile_id', removedProfileIds)
    if (error) throw new Error(serviceErrors.assigneesSave)
  }
}

export async function deleteAssigneesForCard(cardId: string): Promise<void> {
  const { error } = await supabase.from('card_assignees').delete().eq('card_id', cardId)
  if (error) throw new Error(serviceErrors.cardDelete)
}

// The table has no id column, so rows are identified by card and profile instead of the shared realtime helper.
export function subscribeToCardAssigneeChanges(handlers: CardAssigneeRealtimeHandlers): () => void {
  function handleInsert(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    if (payload.eventType !== 'INSERT') return
    const row = toCardAssignee(payload.new)
    if (row) handlers.onInsert(row)
  }

  function handleDelete(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    const row = payload.old ? toCardAssignee(payload.old) : null
    if (row) handlers.onDelete(row)
  }

  const channel = supabase
    .channel(`card_assignees-changes-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'card_assignees' }, handleInsert)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'card_assignees' }, handleDelete)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') handlers.onConnectionChange(true)
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') handlers.onConnectionChange(false)
    })

  return () => {
    void supabase.removeChannel(channel)
  }
}
