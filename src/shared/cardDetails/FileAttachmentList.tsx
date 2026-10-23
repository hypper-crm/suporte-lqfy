import { FileText } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { getFileTypeLabel } from '../../lib/attachmentFiles'
import { formatFileSize } from '../../lib/formatting'
import type { CardAttachment } from '../../types/database'
import { AttachmentActions } from './AttachmentActions'

type FileAttachmentListProps = {
  attachments: CardAttachment[]
  onDelete: (attachment: CardAttachment) => Promise<void>
}

export function FileAttachmentList({ attachments, onDelete }: FileAttachmentListProps) {
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {attachments.map((attachment) => (
          <motion.li
            key={attachment.id}
            layout="position"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-card border border-border bg-elevated p-3 transition-colors duration-200 ease-fluid hover:border-border-strong"
          >
            <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-border-strong bg-background/60 text-muted">
              <FileText aria-hidden="true" className="size-4" />
              <span className="text-[9px] leading-none font-semibold">{getFileTypeLabel(attachment.file_name)}</span>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-medium" title={attachment.file_name}>
                {attachment.file_name}
              </p>
              <p className="text-xs text-muted">{formatFileSize(attachment.file_size)}</p>
              <AttachmentActions attachment={attachment} onDelete={onDelete} />
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
