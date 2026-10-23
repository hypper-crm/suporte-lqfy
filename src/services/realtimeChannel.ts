import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { RealtimeHandlers } from '../types/board'

type TableSubscriptionOptions<Row> = {
  table: string
  // Applied to inserts and updates. Supabase cannot filter delete events, so deletes are always received.
  filter?: string
  toRow: (record: Record<string, unknown>) => Row
  handlers: RealtimeHandlers<Row>
}

// Shared helper for the board and card services. Returns a function that removes the subscription.
export function subscribeToTableChanges<Row>({ table, filter, toRow, handlers }: TableSubscriptionOptions<Row>): () => void {
  const channelName = `${table}-changes-${crypto.randomUUID()}`

  function handleUpsert(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    if (payload.eventType === 'DELETE') return
    handlers.onUpsert(toRow(payload.new))
  }

  function handleDelete(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    const deletedId = payload.old && 'id' in payload.old ? payload.old.id : undefined
    if (typeof deletedId === 'string') handlers.onDelete(deletedId)
  }

  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter }, handleUpsert)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, handleUpsert)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, handleDelete)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') handlers.onConnectionChange(true)
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') handlers.onConnectionChange(false)
    })

  return () => {
    void supabase.removeChannel(channel)
  }
}
