import { Download, ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { attachments, common, serviceErrors } from '../../i18n/pt-BR'
import { openUrlInNewTab, startDownload } from '../../lib/fileActions'
import { getAttachmentUrl } from '../../services/attachmentService'
import type { CardAttachment } from '../../types/database'
import { Button } from '../../components/ui/Button'

type AttachmentActionsProps = {
  attachment: CardAttachment
  onDelete: (attachment: CardAttachment) => Promise<void>
}

type PendingAction = 'open' | 'download' | 'delete'

const actionButtonClassName = 'h-7 gap-1.5 px-2'

export function AttachmentActions({ attachment, onDelete }: AttachmentActionsProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function openOrDownload(action: 'open' | 'download') {
    setPendingAction(action)
    setErrorMessage(null)
    try {
      if (action === 'open') {
        openUrlInNewTab(await getAttachmentUrl(attachment.storage_path))
      } else {
        startDownload(await getAttachmentUrl(attachment.storage_path, attachment.file_name))
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.attachmentLink)
    } finally {
      setPendingAction(null)
    }
  }

  async function confirmDelete() {
    setPendingAction('delete')
    setErrorMessage(null)
    try {
      await onDelete(attachment)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.attachmentDelete)
      setPendingAction(null)
    }
  }

  const isBusy = pendingAction !== null

  return (
    <div className="flex flex-col gap-1">
      {isConfirmingDelete ? (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="pr-1 text-danger">{attachments.deleteConfirmation}</span>
          <Button variant="dangerGhost" size="small" onClick={() => void confirmDelete()} disabled={isBusy} className={actionButtonClassName}>
            {pendingAction === 'delete' ? common.deleting : common.yesDelete}
          </Button>
          <Button variant="ghost" size="small" onClick={() => setIsConfirmingDelete(false)} disabled={isBusy} className={actionButtonClassName}>
            {common.cancel}
          </Button>
        </div>
      ) : (
        <div className="-ml-2 flex flex-wrap items-center gap-0.5">
          <Button variant="ghost" size="small" onClick={() => void openOrDownload('open')} disabled={isBusy} className={actionButtonClassName}>
            <ExternalLink aria-hidden="true" className="size-3.5" />
            {pendingAction === 'open' ? attachments.opening : attachments.open}
          </Button>
          <Button variant="ghost" size="small" onClick={() => void openOrDownload('download')} disabled={isBusy} className={actionButtonClassName}>
            <Download aria-hidden="true" className="size-3.5" />
            {pendingAction === 'download' ? attachments.preparing : attachments.download}
          </Button>
          <Button variant="dangerGhost" size="small" onClick={() => setIsConfirmingDelete(true)} disabled={isBusy} className={actionButtonClassName}>
            <Trash2 aria-hidden="true" className="size-3.5" />
            {common.delete}
          </Button>
        </div>
      )}
      {errorMessage && (
        <p role="alert" className="text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
