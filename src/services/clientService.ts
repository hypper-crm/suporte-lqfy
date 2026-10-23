import type { PostgrestError } from '@supabase/supabase-js'
import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { ClientInput, ClientRealtimeHandlers } from '../types/client'
import type { Client } from '../types/database'
import { subscribeToTableChanges } from './realtimeChannel'

const clientFields = 'id, name, email, niche, pay_in_rate, pay_out_rate, created_at, updated_at'

const uniqueViolationCode = '23505'

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

// Numeric columns may arrive as strings, so they are converted explicitly.
function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toClient(record: Record<string, unknown>): Client {
  return {
    id: String(record.id),
    name: String(record.name ?? ''),
    email: optionalString(record.email),
    niche: optionalString(record.niche),
    pay_in_rate: optionalNumber(record.pay_in_rate),
    pay_out_rate: optionalNumber(record.pay_out_rate),
    created_at: String(record.created_at),
    updated_at: String(record.updated_at),
  }
}

function toClientRecord({ name, email, niche, payInRate, payOutRate }: ClientInput) {
  return { name, email, niche, pay_in_rate: payInRate, pay_out_rate: payOutRate }
}

function toSaveError(error: PostgrestError, fallbackMessage: string): Error {
  if (error.code === uniqueViolationCode) return new Error(serviceErrors.clientDuplicate)
  return new Error(fallbackMessage)
}

export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select(clientFields).order('name', { ascending: true })
  if (error) throw new Error(serviceErrors.clientsLoad)
  return data.map(toClient)
}

export async function createClient(input: ClientInput): Promise<Client> {
  const { data, error } = await supabase.from('clients').insert(toClientRecord(input)).select(clientFields).single()
  if (error) throw toSaveError(error, serviceErrors.clientCreate)
  return toClient(data)
}

export async function updateClient(clientId: string, input: ClientInput): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(toClientRecord(input))
    .eq('id', clientId)
    .select(clientFields)
    .maybeSingle()
  if (error) throw toSaveError(error, serviceErrors.clientSave)
  // An update blocked by row level security or on a deleted client returns no row instead of an error.
  if (!data) throw new Error(serviceErrors.clientSaveMissing)
  return toClient(data)
}

export async function deleteClient(clientId: string): Promise<void> {
  const { data, error } = await supabase.from('clients').delete().eq('id', clientId).select('id')
  if (error) throw new Error(serviceErrors.clientDelete)
  if (data.length === 0) throw new Error(serviceErrors.clientDeleteMissing)
}

export function subscribeToClientChanges(handlers: ClientRealtimeHandlers): () => void {
  return subscribeToTableChanges({ table: 'clients', toRow: toClient, handlers })
}
