import type { RealtimeHandlers } from './board'
import type { CardAttachment } from './database'

export type NewAttachmentInput = {
  cardId: string
  file: File
  mimeType: string
  uploadedBy: string
}

export type AttachmentRealtimeHandlers = RealtimeHandlers<CardAttachment>

export type AttachmentUploadStatus = 'uploading' | 'failed'

// A file the user picked that is still uploading, or that failed to upload.
export type AttachmentUpload = {
  id: string
  fileName: string
  fileSize: number
  status: AttachmentUploadStatus
  errorMessage: string | null
}
