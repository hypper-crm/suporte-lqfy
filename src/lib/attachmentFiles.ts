import { attachments } from '../i18n/pt-BR'
import type { CardAttachment } from '../types/database'

export const maximumAttachmentSizeInBytes = 20 * 1024 * 1024

// Files are accepted by file extension. The mime type saved and sent to storage comes from this map,
// because browsers report inconsistent or empty types for some files (CSV and ZIP in particular).
const mimeTypesByExtension: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  txt: 'text/plain',
  zip: 'application/zip',
}

const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif']

export const acceptedFileExtensions = Object.keys(mimeTypesByExtension)
  .map((extension) => `.${extension}`)
  .join(',')

export const acceptedCoverImageExtensions = imageExtensions.map((extension) => `.${extension}`).join(',')

const maximumStorageFileNameLength = 100

export type AttachmentFileCheck = { isAccepted: true; mimeType: string } | { isAccepted: false; errorMessage: string }

export function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : ''
}

export function checkAttachmentFile(file: File): AttachmentFileCheck {
  const mimeType = mimeTypesByExtension[getFileExtension(file.name)]
  if (!mimeType) {
    return { isAccepted: false, errorMessage: attachments.rejectedType }
  }
  if (file.size > maximumAttachmentSizeInBytes) {
    return { isAccepted: false, errorMessage: attachments.rejectedSize }
  }
  return { isAccepted: true, mimeType }
}

// Card covers accept only the image types of the attachments.
export function checkCoverImageFile(file: File): AttachmentFileCheck {
  if (!imageExtensions.includes(getFileExtension(file.name))) return { isAccepted: false, errorMessage: attachments.rejectedType }
  return checkAttachmentFile(file)
}

export function isImageAttachment(attachment: CardAttachment): boolean {
  if (attachment.mime_type) return attachment.mime_type.startsWith('image/')
  return imageExtensions.includes(getFileExtension(attachment.file_name))
}

export function getFileTypeLabel(fileName: string): string {
  return getFileExtension(fileName).toUpperCase() || attachments.fileTypeFallback
}

// A random prefix keeps names unique inside the card folder. Unsafe characters are replaced for the storage key.
export function toUniqueStorageFileName(fileName: string): string {
  const safeFileName = fileName.replace(/[^A-Za-z0-9._-]/g, '_').slice(-maximumStorageFileNameLength)
  return `${crypto.randomUUID()}-${safeFileName}`
}
