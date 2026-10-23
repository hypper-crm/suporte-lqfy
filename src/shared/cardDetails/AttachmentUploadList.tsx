import { AnimatePresence, motion } from 'motion/react'
import { attachments, common } from '../../i18n/pt-BR'
import { formatFileSize } from '../../lib/formatting'
import type { AttachmentUpload } from '../../types/attachment'
import { Button } from '../../components/ui/Button'

type AttachmentUploadListProps = {
  uploads: AttachmentUpload[]
  onDismiss: (uploadId: string) => void
}

export function AttachmentUploadList({ uploads, onDismiss }: AttachmentUploadListProps) {
  return (
    <ul className="flex flex-col gap-2 empty:hidden">
      <AnimatePresence initial={false}>
        {uploads.map((upload) => (
          <motion.li
            key={upload.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-between gap-3 rounded-card border px-3 py-2 text-sm ${
              upload.status === 'uploading' ? 'border-border bg-elevated text-muted' : 'border-danger/25 bg-danger/10 text-danger'
            }`}
          >
            {upload.status === 'uploading' ? (
              <span role="status" className="min-w-0 truncate">
                {attachments.uploading(upload.fileName, formatFileSize(upload.fileSize))}
              </span>
            ) : (
              <>
                <span role="alert" className="min-w-0 break-words">
                  {upload.errorMessage}
                </span>
                <Button variant="ghost" size="small" onClick={() => onDismiss(upload.id)}>
                  {common.dismiss}
                </Button>
              </>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
