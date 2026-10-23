import type { PostgrestError } from '@supabase/supabase-js'
import { serviceErrors } from '../i18n/pt-BR'
import { toUniqueStorageFileName } from '../lib/attachmentFiles'
import { supabase } from '../lib/supabase'
import type {
  ClientCoverChange,
  ClientEmailInput,
  ClientEmailRealtimeHandlers,
  ClientInput,
  ClientRealtimeHandlers,
} from '../types/client'
import type { Client, ClientEmail, ClientRow } from '../types/database'
import { getPublicUrl, removePublicFiles, toStoragePath } from './publicStorage'
import { subscribeToTableChanges } from './realtimeChannel'

const clientRowFields = 'id, name, niche, pay_in_rate, pay_out_rate, website, cover_image_url, created_at, updated_at'

const clientEmailFields = 'id, client_id, email, position, created_at'

// Emails are loaded in the same request as their clients.
const clientFields = `${clientRowFields}, client_emails(${clientEmailFields})`

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

function toClientRow(record: Record<string, unknown>): ClientRow {
  return {
    id: String(record.id),
    name: String(record.name ?? ''),
    niche: optionalString(record.niche),
    pay_in_rate: optionalNumber(record.pay_in_rate),
    pay_out_rate: optionalNumber(record.pay_out_rate),
    website: optionalString(record.website),
    cover_image_url: optionalString(record.cover_image_url),
    created_at: String(record.created_at),
    updated_at: String(record.updated_at),
  }
}

function toClientEmail(record: Record<string, unknown>): ClientEmail {
  return {
    id: String(record.id),
    client_id: String(record.client_id),
    email: String(record.email ?? ''),
    position: Number(record.position ?? 0),
    created_at: String(record.created_at),
  }
}

export function sortClientEmails(emails: ClientEmail[]): ClientEmail[] {
  return [...emails].sort((first, second) => first.position - second.position)
}

function toClient(record: Record<string, unknown>): Client {
  const emailRecords = Array.isArray(record.client_emails) ? (record.client_emails as Record<string, unknown>[]) : []
  return { ...toClientRow(record), emails: sortClientEmails(emailRecords.map(toClientEmail)) }
}

function toClientValues({ name, niche, payInRate, payOutRate, website }: ClientInput) {
  return { name, niche, pay_in_rate: payInRate, pay_out_rate: payOutRate, website }
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

async function getClient(clientId: string, fallbackMessage: string): Promise<Client> {
  const { data, error } = await supabase.from('clients').select(clientFields).eq('id', clientId).maybeSingle()
  if (error || !data) throw new Error(fallbackMessage)
  return toClient(data)
}

type SavedEmailRow = Pick<ClientEmail, 'id' | 'email' | 'position'>

type EmailSyncPlan = {
  deletedIds: string[]
  updatedRows: SavedEmailRow[]
  insertedRows: { email: string; position: number }[]
}

// Rows already holding a wanted email are kept first, so no update or insert collides with the unique (client_id, email) rule.
function planEmailSync(savedRows: SavedEmailRow[], emails: ClientEmailInput[]): EmailSyncPlan {
  const rowIdByIndex = new Map<number, string>()
  const claimedIds = new Set<string>()

  emails.forEach(({ email }, index) => {
    const row = savedRows.find((current) => current.email === email && !claimedIds.has(current.id))
    if (!row) return
    rowIdByIndex.set(index, row.id)
    claimedIds.add(row.id)
  })

  emails.forEach(({ id }, index) => {
    if (rowIdByIndex.has(index) || !id || claimedIds.has(id) || !savedRows.some((row) => row.id === id)) return
    rowIdByIndex.set(index, id)
    claimedIds.add(id)
  })

  const savedRowsById = new Map(savedRows.map((row) => [row.id, row]))
  const updatedRows: SavedEmailRow[] = []
  const insertedRows: EmailSyncPlan['insertedRows'] = []

  emails.forEach(({ email }, index) => {
    const rowId = rowIdByIndex.get(index)
    const savedRow = rowId ? savedRowsById.get(rowId) : undefined
    if (!savedRow) {
      insertedRows.push({ email, position: index })
    } else if (savedRow.email !== email || savedRow.position !== index) {
      updatedRows.push({ id: savedRow.id, email, position: index })
    }
  })

  return { deletedIds: savedRows.filter((row) => !claimedIds.has(row.id)).map((row) => row.id), updatedRows, insertedRows }
}

// Makes the rows of `client_emails` match the list: removed emails are deleted, changed ones updated and new ones inserted.
async function syncClientEmails(clientId: string, emails: ClientEmailInput[]): Promise<void> {
  const { data: savedRows, error: loadError } = await supabase.from('client_emails').select('id, email, position').eq('client_id', clientId)
  if (loadError) throw new Error(serviceErrors.clientEmailsSave)

  const { deletedIds, updatedRows, insertedRows } = planEmailSync(
    savedRows.map((row) => ({ id: String(row.id), email: String(row.email), position: Number(row.position) })),
    emails,
  )

  if (deletedIds.length > 0) {
    const { error } = await supabase.from('client_emails').delete().in('id', deletedIds)
    if (error) throw new Error(serviceErrors.clientEmailsSave)
  }

  const updateResults = await Promise.all(
    updatedRows.map(({ id, email, position }) => supabase.from('client_emails').update({ email, position }).eq('id', id)),
  )
  if (updateResults.some(({ error }) => error)) throw new Error(serviceErrors.clientEmailsSave)

  if (insertedRows.length > 0) {
    const { error } = await supabase.from('client_emails').insert(insertedRows.map((row) => ({ client_id: clientId, ...row })))
    if (error) throw new Error(serviceErrors.clientEmailsSave)
  }
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
  const coverPaths = coverChange.kind === 'replace' ? [await uploadCover(clientId, coverChange.file, coverChange.mimeType)] : []

  const { error } = await supabase
    .from('clients')
    .insert({ id: clientId, ...toClientValues(input), cover_image_url: coverPaths[0] ? getPublicUrl(coverBucketName, coverPaths[0]) : null })
  if (error) {
    await removePublicFiles(coverBucketName, coverPaths)
    throw toSaveError(error, serviceErrors.clientCreate)
  }

  try {
    await syncClientEmails(clientId, input.emails)
  } catch {
    // A client without its emails is removed, so trying again does not create a duplicate.
    await supabase.from('clients').delete().eq('id', clientId)
    await removePublicFiles(coverBucketName, coverPaths)
    throw new Error(serviceErrors.clientCreate)
  }

  return getClient(clientId, serviceErrors.clientCreate)
}

// Implementation cards are titled with their client's name, so the stored title follows the name.
async function renameImplementationCards(clientId: string, name: string): Promise<void> {
  const { error } = await supabase.from('cards').update({ title: name }).eq('board', 'implementation').eq('client_id', clientId)
  if (error) throw new Error(serviceErrors.implementationCardsRename)
}

export async function updateClient(client: Client, input: ClientInput, coverChange: ClientCoverChange): Promise<Client> {
  const newCoverPath = coverChange.kind === 'replace' ? await uploadCover(client.id, coverChange.file, coverChange.mimeType) : null
  const coverValues =
    coverChange.kind === 'keep' ? {} : { cover_image_url: newCoverPath ? getPublicUrl(coverBucketName, newCoverPath) : null }

  const { data, error } = await supabase
    .from('clients')
    .update({ ...toClientValues(input), ...coverValues })
    .eq('id', client.id)
    .select('id')
    .maybeSingle()
  if (error || !data) {
    await removePublicFiles(coverBucketName, newCoverPath ? [newCoverPath] : [])
    if (error) throw toSaveError(error, serviceErrors.clientSave)
    // An update blocked by row level security or on a deleted client returns no row instead of an error.
    throw new Error(serviceErrors.clientSaveMissing)
  }

  // The previous cover is no longer referenced once it was replaced or removed.
  if (coverChange.kind !== 'keep') await removePublicFiles(coverBucketName, coverPathOf(client.cover_image_url))

  if (input.name !== client.name) await renameImplementationCards(client.id, input.name)

  try {
    await syncClientEmails(client.id, input.emails)
  } catch {
    throw new Error(serviceErrors.clientEmailsSavePartial)
  }

  return getClient(client.id, serviceErrors.clientSave)
}

export async function deleteClient(client: Client): Promise<void> {
  const { data, error } = await supabase.from('clients').delete().eq('id', client.id).select('id')
  if (error) throw new Error(serviceErrors.clientDelete)
  if (data.length === 0) throw new Error(serviceErrors.clientDeleteMissing)
  await removePublicFiles(coverBucketName, coverPathOf(client.cover_image_url))
}

export function subscribeToClientChanges(handlers: ClientRealtimeHandlers): () => void {
  return subscribeToTableChanges({ table: 'clients', toRow: toClientRow, handlers })
}

export function subscribeToClientEmailChanges(handlers: ClientEmailRealtimeHandlers): () => void {
  return subscribeToTableChanges({ table: 'client_emails', toRow: toClientEmail, handlers })
}
