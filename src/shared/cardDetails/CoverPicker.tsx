import { ImagePlus } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useAttachmentThumbnails } from '../../hooks/useAttachmentThumbnails'
import { cardDetails } from '../../i18n/pt-BR'
import { acceptedCoverImageExtensions } from '../../lib/attachmentFiles'
import type { CardAttachment } from '../../types/database'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'

type CoverPickerProps = {
  imageAttachments: CardAttachment[]
  isLoadingAttachments: boolean
  coverAttachmentId: string | null
  isUploading: boolean
  isBusy: boolean
  errorMessage: string | null
  onSelect: (attachmentId: string) => void
  onUpload: (file: File) => void
  onClose: () => void
}

// A small popover listing the card's images, with an upload button for a new one.
export function CoverPicker({
  imageAttachments,
  isLoadingAttachments,
  coverAttachmentId,
  isUploading,
  isBusy,
  errorMessage,
  onSelect,
  onUpload,
  onClose,
}: CoverPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { thumbnailUrls } = useAttachmentThumbnails(imageAttachments)

  useEffect(() => {
    // Captured before the drawer's listener, which then ignores the handled event.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-label={cardDetails.cover.pickerLabel}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-card border border-border-strong bg-elevated p-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.9)]"
    >
      {isLoadingAttachments ? (
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : (
        imageAttachments.length > 0 && (
          <ul className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto">
            {imageAttachments.map((attachment) => {
              const thumbnailUrl = thumbnailUrls[attachment.storage_path]
              const isCover = attachment.id === coverAttachmentId
              return (
                <li key={attachment.id}>
                  <button
                    type="button"
                    aria-label={cardDetails.cover.useImage(attachment.file_name)}
                    aria-pressed={isCover}
                    title={attachment.file_name}
                    disabled={isBusy}
                    onClick={() => onSelect(attachment.id)}
                    className={`flex h-16 w-full items-center justify-center overflow-hidden rounded-lg border bg-surface outline-none transition-[border-color] duration-200 ease-fluid hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 ${
                      isCover ? 'border-accent' : 'border-border'
                    }`}
                  >
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="" draggable={false} className="size-full object-cover" />
                    ) : (
                      <Skeleton className="size-full rounded-none" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )
      )}
      <Button size="small" disabled={isBusy} onClick={() => fileInputRef.current?.click()} className="self-start">
        <ImagePlus aria-hidden="true" className="size-3.5" />
        {isUploading ? cardDetails.cover.uploading : cardDetails.cover.upload}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedCoverImageExtensions}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onUpload(file)
          // Clearing the value lets the same file be picked again.
          event.target.value = ''
        }}
      />
      {errorMessage && (
        <p role="alert" className="text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </motion.div>
  )
}
