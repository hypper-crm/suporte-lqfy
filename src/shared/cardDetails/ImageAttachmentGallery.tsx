import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useAttachmentThumbnails } from '../../hooks/useAttachmentThumbnails'
import { attachments as attachmentStrings } from '../../i18n/pt-BR'
import { formatFileSize } from '../../lib/formatting'
import type { CardAttachment } from '../../types/database'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { AttachmentActions } from './AttachmentActions'
import { ImageViewer } from './ImageViewer'

type ImageAttachmentGalleryProps = {
  attachments: CardAttachment[]
  onDelete: (attachment: CardAttachment) => Promise<void>
}

export function ImageAttachmentGallery({ attachments, onDelete }: ImageAttachmentGalleryProps) {
  const { thumbnailUrls, errorMessage } = useAttachmentThumbnails(attachments)
  const [viewedAttachment, setViewedAttachment] = useState<CardAttachment | null>(null)

  return (
    <>
      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
      <ul className="grid grid-cols-3 gap-3">
        <AnimatePresence initial={false}>
          {attachments.map((attachment) => {
            const thumbnailUrl = thumbnailUrls[attachment.storage_path]
            return (
              <motion.li
                key={attachment.id}
                layout="position"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex min-w-0 flex-col gap-1"
              >
                <button
                  type="button"
                  onClick={() => setViewedAttachment(attachment)}
                  aria-label={attachmentStrings.viewFullSize(attachment.file_name)}
                  className="flex h-24 items-center justify-center overflow-hidden rounded-card border border-border bg-elevated outline-none transition-[border-color] duration-200 ease-fluid hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={attachment.file_name} className="h-full w-full object-cover" />
                  ) : errorMessage ? (
                    <span className="text-xs text-subtle">{attachmentStrings.noPreview}</span>
                  ) : (
                    <Skeleton className="h-full w-full rounded-none" />
                  )}
                </button>
                <p className="truncate pt-1 text-xs font-medium" title={attachment.file_name}>
                  {attachment.file_name}
                </p>
                <p className="text-xs text-muted">{formatFileSize(attachment.file_size)}</p>
                <AttachmentActions attachment={attachment} onDelete={onDelete} />
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
      <AnimatePresence>
        {viewedAttachment && (
          <ImageViewer key={viewedAttachment.id} attachment={viewedAttachment} onClose={() => setViewedAttachment(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
