import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { attachments, common } from '../../i18n/pt-BR'
import { getAttachmentUrl } from '../../services/attachmentService'
import type { CardAttachment } from '../../types/database'
import { Button } from '../../components/ui/Button'
import { overlayTransition } from '../../components/ui/motionPresets'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusMessage } from '../../components/ui/StatusMessage'

type ImageViewerProps = {
  attachment: CardAttachment
  onClose: () => void
}

export function ImageViewer({ attachment, onClose }: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    getAttachmentUrl(attachment.storage_path)
      .then((url) => {
        if (isActive) setImageUrl(url)
      })
      .catch((error: Error) => {
        if (isActive) setErrorMessage(error.message)
      })
    return () => {
      isActive = false
    }
  }, [attachment.storage_path])

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
      aria-modal="true"
      aria-label={attachment.file_name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={overlayTransition}
      className="fixed inset-0 z-overlay flex flex-col items-center justify-center gap-3 bg-black/85 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex w-full max-w-5xl items-center justify-between gap-3">
        <p className="truncate text-sm text-foreground">{attachment.file_name}</p>
        <Button variant="ghost" size="icon" aria-label={common.close} title={common.close} onClick={onClose}>
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {imageUrl && (
        <motion.img
          src={imageUrl}
          alt={attachment.file_name}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={overlayTransition}
          className="max-h-[85vh] max-w-full rounded-card object-contain"
        />
      )}
      {!imageUrl && errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
      {!imageUrl && !errorMessage && (
        <div role="status" aria-label={attachments.loadingImage} className="w-full max-w-3xl">
          <Skeleton className="aspect-video w-full rounded-card" />
        </div>
      )}
    </motion.div>
  )
}
