import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import { toUniqueStorageFileName } from '../lib/attachmentFiles'
import type { AttachmentRealtimeHandlers, NewAttachmentInput } from '../types/attachment'
import type { CardAttachment } from '../types/database'
import { subscribeToTableChanges } from './realtimeChannel'

const bucketName = 'card-attachments'

const attachmentFields = 'id, card_id, storage_path, file_name, mime_type, file_size, uploaded_by, created_at'

// Links used to open or download a file are generated on demand and expire quickly.
const signedUrlExpiryInSeconds = 60

// Thumbnails stay on screen while the panel is open, so their links live a little longer.
const thumbnailUrlExpiryInSeconds = 600

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toAttachment(record: Record<string, unknown>): CardAttachment {
  return {
    id: String(record.id),
    card_id: String(record.card_id),
    storage_path: String(record.storage_path),
    file_name: String(record.file_name ?? ''),
    mime_type: optionalString(record.mime_type),
    file_size: optionalNumber(record.file_size),
    uploaded_by: optionalString(record.uploaded_by),
    created_at: String(record.created_at),
  }
}

export async function listAttachments(cardId: string): Promise<CardAttachment[]> {
  const { data, error } = await supabase
    .from('card_attachments')
    .select(attachmentFields)
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(serviceErrors.attachmentsLoad)
  return data.map(toAttachment)
}

export async function uploadAttachment({ cardId, file, mimeType, uploadedBy }: NewAttachmentInput): Promise<CardAttachment> {
  const storagePath = `${cardId}/${toUniqueStorageFileName(file.name)}`

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, file, { contentType: mimeType, upsert: false })
  if (uploadError) throw new Error(serviceErrors.attachmentUpload(file.name))

  const { data, error } = await supabase
    .from('card_attachments')
    .insert({
      card_id: cardId,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: mimeType,
      file_size: file.size,
      uploaded_by: uploadedBy,
    })
    .select(attachmentFields)
    .single()
  if (error) {
    // Without its row the file would be unreachable, so the uploaded object is removed.
    await supabase.storage.from(bucketName).remove([storagePath])
    throw new Error(serviceErrors.attachmentRecord(file.name))
  }
  return toAttachment(data)
}

export async function deleteAttachment(attachment: CardAttachment): Promise<void> {
  const { error: storageError } = await supabase.storage.from(bucketName).remove([attachment.storage_path])
  if (storageError) throw new Error(serviceErrors.attachmentDelete)

  const { data, error } = await supabase.from('card_attachments').delete().eq('id', attachment.id).select('id')
  if (error) throw new Error(serviceErrors.attachmentDelete)
  if (data.length === 0) throw new Error(serviceErrors.attachmentDeleteMissing)
}

// Removes every attachment row of a card and returns their storage paths, so the files can be removed afterwards.
export async function deleteAttachmentRecordsForCard(cardId: string): Promise<string[]> {
  const { data, error } = await supabase.from('card_attachments').delete().eq('card_id', cardId).select('storage_path')
  if (error) throw new Error(serviceErrors.cardAttachmentsDelete)
  return data.map((record) => String(record.storage_path))
}

// Best effort: a file left behind is not reachable from the app anymore, so a failure here is not reported.
export async function removeStorageObjects(storagePaths: string[]): Promise<void> {
  if (storagePaths.length === 0) return
  await supabase.storage.from(bucketName).remove(storagePaths)
}

// Pass a file name to get a link that downloads the file under that name instead of opening it.
export async function getAttachmentUrl(storagePath: string, downloadFileName?: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(storagePath, signedUrlExpiryInSeconds, downloadFileName ? { download: downloadFileName } : undefined)
  if (error) throw new Error(serviceErrors.attachmentLink)
  return data.signedUrl
}

// Returns signed URLs keyed by storage path.
export async function getThumbnailUrls(storagePaths: string[]): Promise<Record<string, string>> {
  const { data, error } = await supabase.storage.from(bucketName).createSignedUrls(storagePaths, thumbnailUrlExpiryInSeconds)
  if (error) throw new Error(serviceErrors.thumbnailsLoad)
  return Object.fromEntries(
    data.flatMap((entry) => (entry.path && entry.signedUrl && !entry.error ? [[entry.path, entry.signedUrl]] : [])),
  )
}

export function subscribeToAttachmentChanges(cardId: string, handlers: AttachmentRealtimeHandlers): () => void {
  return subscribeToTableChanges({
    table: 'card_attachments',
    filter: `card_id=eq.${cardId}`,
    toRow: toAttachment,
    handlers,
  })
}
