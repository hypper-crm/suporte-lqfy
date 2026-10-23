import { useCallback, useEffect, useState } from 'react'
import { serviceErrors } from '../i18n/pt-BR'
import { checkAttachmentFile, checkCoverImageFile } from '../lib/attachmentFiles'
import {
  deleteAttachment as deleteAttachmentRequest,
  listAttachments,
  subscribeToAttachmentChanges,
  uploadAttachment,
} from '../services/attachmentService'
import type { AttachmentUpload } from '../types/attachment'
import type { CardAttachment } from '../types/database'

// A refused file is reported for this long.
const rejectionMessageDurationInMilliseconds = 4000

type RejectionMessage = {
  // Changes on every refusal, so a repeated message restarts its timer.
  id: string
  text: string
}

export type CardAttachmentsState = {
  attachments: CardAttachment[]
  uploads: AttachmentUpload[]
  // Why the last picked file was refused, cleared after a few seconds.
  rejectionMessage: string | null
  isLoading: boolean
  loadErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  uploadFiles: (files: File[]) => void
  // Uploads an image to use as the card's cover. Rejects with the reason when the file is refused or fails.
  uploadCoverImage: (file: File) => Promise<CardAttachment>
  dismissUpload: (uploadId: string) => void
  deleteAttachment: (attachment: CardAttachment) => Promise<void>
}

function sortByCreationDate(attachments: CardAttachment[]): CardAttachment[] {
  return [...attachments].sort((first, second) => first.created_at.localeCompare(second.created_at))
}

function upsertAttachment(attachments: CardAttachment[], attachment: CardAttachment): CardAttachment[] {
  const exists = attachments.some((current) => current.id === attachment.id)
  return sortByCreationDate(
    exists ? attachments.map((current) => (current.id === attachment.id ? attachment : current)) : [...attachments, attachment],
  )
}

function removeAttachment(attachments: CardAttachment[], attachmentId: string): CardAttachment[] {
  return attachments.filter((attachment) => attachment.id !== attachmentId)
}

export function useCardAttachments(cardId: string, currentUserId: string): CardAttachmentsState {
  const [attachments, setAttachments] = useState<CardAttachment[]>([])
  const [uploads, setUploads] = useState<AttachmentUpload[]>([])
  const [rejectionMessage, setRejectionMessage] = useState<RejectionMessage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null)
  const [isRealtimeDisconnected, setIsRealtimeDisconnected] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    return subscribeToAttachmentChanges(cardId, {
      onUpsert: (attachment) =>
        setAttachments((current) =>
          attachment.card_id === cardId ? upsertAttachment(current, attachment) : removeAttachment(current, attachment.id),
        ),
      onDelete: (attachmentId) => setAttachments((current) => removeAttachment(current, attachmentId)),
      onConnectionChange: (isConnected) => setIsRealtimeDisconnected(!isConnected),
    })
  }, [cardId])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setLoadErrorMessage(null)

    listAttachments(cardId)
      .then((loadedAttachments) => {
        if (isActive) setAttachments(sortByCreationDate(loadedAttachments))
      })
      .catch((error: Error) => {
        if (isActive) setLoadErrorMessage(error.message)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [cardId, reloadCount])

  useEffect(() => {
    if (!rejectionMessage) return
    const timeoutId = window.setTimeout(() => setRejectionMessage(null), rejectionMessageDurationInMilliseconds)
    return () => window.clearTimeout(timeoutId)
  }, [rejectionMessage])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  const uploadFile = useCallback(
    async (file: File) => {
      const upload: AttachmentUpload = {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileSize: file.size,
        status: 'uploading',
        errorMessage: null,
      }
      const check = checkAttachmentFile(file)
      if (!check.isAccepted) {
        setRejectionMessage({ id: upload.id, text: check.errorMessage })
        return
      }

      setUploads((current) => [...current, upload])
      try {
        const attachment = await uploadAttachment({ cardId, file, mimeType: check.mimeType, uploadedBy: currentUserId })
        setAttachments((current) => upsertAttachment(current, attachment))
        setUploads((current) => current.filter((currentUpload) => currentUpload.id !== upload.id))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : serviceErrors.attachmentUpload(file.name)
        setUploads((current) =>
          current.map((currentUpload) =>
            currentUpload.id === upload.id ? { ...currentUpload, status: 'failed', errorMessage } : currentUpload,
          ),
        )
      }
    },
    [cardId, currentUserId],
  )

  const uploadFiles = useCallback(
    (files: File[]) => {
      for (const file of files) void uploadFile(file)
    },
    [uploadFile],
  )

  const uploadCoverImage = useCallback(
    async (file: File) => {
      const check = checkCoverImageFile(file)
      if (!check.isAccepted) throw new Error(check.errorMessage)
      const attachment = await uploadAttachment({ cardId, file, mimeType: check.mimeType, uploadedBy: currentUserId })
      setAttachments((current) => upsertAttachment(current, attachment))
      return attachment
    },
    [cardId, currentUserId],
  )

  const dismissUpload = useCallback((uploadId: string) => {
    setUploads((current) => current.filter((upload) => upload.id !== uploadId))
  }, [])

  const deleteAttachment = useCallback(async (attachment: CardAttachment) => {
    await deleteAttachmentRequest(attachment)
    setAttachments((current) => removeAttachment(current, attachment.id))
  }, [])

  return {
    attachments,
    uploads,
    rejectionMessage: rejectionMessage?.text ?? null,
    isLoading,
    loadErrorMessage,
    isRealtimeDisconnected,
    reload,
    uploadFiles,
    uploadCoverImage,
    dismissUpload,
    deleteAttachment,
  }
}
