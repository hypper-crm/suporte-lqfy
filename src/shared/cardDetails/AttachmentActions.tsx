import { Download, ExternalLink, ImageUp, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { attachments, cardDetails, common, serviceErrors } from '../../i18n/pt-BR'
import { openUrlInNewTab, startDownload } from '../../lib/fileActions'
import { getAttachmentUrl } from '../../services/attachmentService'
import type { CardAttachment } from '../../types/database'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

// Image attachments only.
export type AttachmentCoverAction = {
  isCover: boolean
  onUseAsCover: () => Promise<void>
}

type AttachmentActionsProps = {
  attachment: CardAttachment
  cover?: AttachmentCoverAction
  onDelete: (attachment: CardAttachment) => Promise<void>
}

type PendingAction = 'open' | 'download' | 'cover' | 'delete'

export function AttachmentActions({ attachment, cover, onDelete }: AttachmentActionsProps) {
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

  async function setAsCover(onUseAsCover: () => Promise<void>) {
    setPendingAction('cover')
    setErrorMessage(null)
    try {
      await onUseAsCover()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.cardCoverSave)
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
          <Button variant="dangerGhost" size="compact" onClick={() => void confirmDelete()} disabled={isBusy} className="gap-1.5">
            {pendingAction === 'delete' ? common.deleting : common.yesDelete}
          </Button>
          <Button variant="ghost" size="compact" onClick={() => setIsConfirmingDelete(false)} disabled={isBusy} className="gap-1.5">
            {common.cancel}
          </Button>
        </div>
      ) : (
        <div className="-ml-2 flex flex-wrap items-center gap-0.5">
          <Button variant="ghost" size="compact" onClick={() => void openOrDownload('open')} disabled={isBusy} className="gap-1.5">
            <ExternalLink aria-hidden="true" className="size-3.5" />
            {pendingAction === 'open' ? attachments.opening : attachments.open}
          </Button>
          <Button variant="ghost" size="compact" onClick={() => void openOrDownload('download')} disabled={isBusy} className="gap-1.5">
            <Download aria-hidden="true" className="size-3.5" />
            {pendingAction === 'download' ? attachments.preparing : attachments.download}
          </Button>
          {cover &&
            (cover.isCover ? (
              <Badge variant="accent" className="mx-2">
                {cardDetails.cover.currentCover}
              </Badge>
            ) : (
              <Button
                variant="ghost"
                size="compact"
                onClick={() => void setAsCover(cover.onUseAsCover)}
                disabled={isBusy}
                className="gap-1.5"
              >
                <ImageUp aria-hidden="true" className="size-3.5" />
                {pendingAction === 'cover' ? cardDetails.cover.settingCover : cardDetails.cover.useAsCover}
              </Button>
            ))}
          <Button variant="dangerGhost" size="compact" onClick={() => setIsConfirmingDelete(true)} disabled={isBusy} className="gap-1.5">
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
