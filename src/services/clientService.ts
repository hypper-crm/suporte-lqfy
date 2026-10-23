import type { PostgrestError } from '@supabase/supabase-js'
import { serviceErrors } from '../i18n/pt-BR'
import { toUniqueStorageFileName } from '../lib/attachmentFiles'
import { supabase } from '../lib/supabase'
import type { ClientCoverChange, ClientInput, ClientRealtimeHandlers } from '../types/client'
import type { Client } from '../types/database'
import { getPublicUrl, removePublicFiles, toStoragePath } from './publicStorage'
import { subscribeToTableChanges } from './realtimeChannel'

const clientFields = 'id, name, email, niche, pay_in_rate, pay_out_rate, website, cover_image_url, created_at, updated_at'

const coverBucketName = 'client-covers'

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
    website: optionalString(record.website),
    cover_image_url: optionalString(record.cover_image_url),
    created_at: String(record.created_at),
    updated_at: String(record.updated_at),
  }
}

function toClientRecord({ name, email, niche, payInRate, payOutRate, website }: ClientInput) {
  return { name, email, niche, pay_in_rate: payInRate, pay_out_rate: payOutRate, website }
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

// Uploads a cover image to "<client_id>/<unique_file_name>" and returns its storage path.
async function uploadCover(clientId: string, file: File, mimeType: string): Promise<string> {
  const storagePath = `${clientId}/${toUniqueStorageFileName(file.name)}`
  const { error } = await supabase.storage.from(coverBucketName).upload(storagePath, file, { contentType: mimeType, upsert: false })
  if (error) throw new Error(serviceErrors.clientCoverUpload)
  return storagePath
}

function coverPathOf(coverImageUrl: string | null): string[] {
  const storagePath = coverImageUrl ? toStoragePath(coverBucketName, coverImageUrl) : null
  return storagePath ? [storagePath] : []
}

// The id is generated here so the cover can be uploaded into the client's folder before the row exists.
export async function createClient(input: ClientInput, coverChange: ClientCoverChange): Promise<Client> {
  const clientId = crypto.randomUUID()
  const coverPath = coverChange.kind === 'replace' ? await uploadCover(clientId, coverChange.file, coverChange.mimeType) : null

  const { data, error } = await supabase
    .from('clients')
    .insert({ id: clientId, ...toClientRecord(input), cover_image_url: coverPath ? getPublicUrl(coverBucketName, coverPath) : null })
    .select(clientFields)
    .single()
  if (error) {
    await removePublicFiles(coverBucketName, coverPath ? [coverPath] : [])
    throw toSaveError(error, serviceErrors.clientCreate)
  }
  return toClient(data)
}

export async function updateClient(client: Client, input: ClientInput, coverChange: ClientCoverChange): Promise<Client> {
  const newCoverPath = coverChange.kind === 'replace' ? await uploadCover(client.id, coverChange.file, coverChange.mimeType) : null
  const coverValues =
    coverChange.kind === 'keep' ? {} : { cover_image_url: newCoverPath ? getPublicUrl(coverBucketName, newCoverPath) : null }

  const { data, error } = await supabase
    .from('clients')
    .update({ ...toClientRecord(input), ...coverValues })
    .eq('id', client.id)
    .select(clientFields)
    .maybeSingle()
  if (error || !data) {
    await removePublicFiles(coverBucketName, newCoverPath ? [newCoverPath] : [])
    if (error) throw toSaveError(error, serviceErrors.clientSave)
    // An update blocked by row level security or on a deleted client returns no row instead of an error.
    throw new Error(serviceErrors.clientSaveMissing)
  }

  // The previous cover is no longer referenced once it was replaced or removed.
  if (coverChange.kind !== 'keep') await removePublicFiles(coverBucketName, coverPathOf(client.cover_image_url))
  return toClient(data)
}

export async function deleteClient(client: Client): Promise<void> {
  const { data, error } = await supabase.from('clients').delete().eq('id', client.id).select('id')
  if (error) throw new Error(serviceErrors.clientDelete)
  if (data.length === 0) throw new Error(serviceErrors.clientDeleteMissing)
  await removePublicFiles(coverBucketName, coverPathOf(client.cover_image_url))
}

export function subscribeToClientChanges(handlers: ClientRealtimeHandlers): () => void {
  return subscribeToTableChanges({ table: 'clients', toRow: toClient, handlers })
}
