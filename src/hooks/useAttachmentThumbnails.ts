import { useEffect, useState } from 'react'
import { getThumbnailUrls } from '../services/attachmentService'
import type { CardAttachment } from '../types/database'

export type AttachmentThumbnailsState = {
  // Signed URLs keyed by storage path.
  thumbnailUrls: Record<string, string>
  errorMessage: string | null
}

export function useAttachmentThumbnails(imageAttachments: CardAttachment[]): AttachmentThumbnailsState {
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // A stable key, so the links are only requested again when the set of images changes.
  const storagePathsKey = imageAttachments.map((attachment) => attachment.storage_path).join('\n')

  useEffect(() => {
    if (!storagePathsKey) return

    let isActive = true
    setErrorMessage(null)

    getThumbnailUrls(storagePathsKey.split('\n'))
      .then((loadedUrls) => {
        if (isActive) setThumbnailUrls((current) => ({ ...current, ...loadedUrls }))
      })
      .catch((error: Error) => {
        if (isActive) setErrorMessage(error.message)
      })

    return () => {
      isActive = false
    }
  }, [storagePathsKey])

  return { thumbnailUrls, errorMessage }
}
