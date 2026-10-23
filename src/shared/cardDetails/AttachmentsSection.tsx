import { useCardAttachments } from '../../hooks/useCardAttachments'
import { attachments as attachmentStrings, common } from '../../i18n/pt-BR'
import { isImageAttachment } from '../../lib/attachmentFiles'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { AttachmentDropZone } from './AttachmentDropZone'
import { AttachmentUploadList } from './AttachmentUploadList'
import { FileAttachmentList } from './FileAttachmentList'
import { ImageAttachmentGallery } from './ImageAttachmentGallery'

type AttachmentsSectionProps = {
  cardId: string
  currentUserId: string
}

export function AttachmentsSection({ cardId, currentUserId }: AttachmentsSectionProps) {
  const { attachments, uploads, isLoading, loadErrorMessage, isRealtimeDisconnected, reload, uploadFiles, dismissUpload, deleteAttachment } =
    useCardAttachments(cardId, currentUserId)

  const imageAttachments = attachments.filter(isImageAttachment)
  const fileAttachments = attachments.filter((attachment) => !isImageAttachment(attachment))

  function renderAttachments() {
    if (isLoading) {
      return (
        <div role="status" aria-label={attachmentStrings.loading} className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-card" />
          <Skeleton className="h-16 rounded-card" />
        </div>
      )
    }

    if (loadErrorMessage) {
      return (
        <div className="flex flex-col items-start gap-2">
          <StatusMessage variant="error">{loadErrorMessage}</StatusMessage>
          <Button variant="link" onClick={reload}>
            {common.tryAgain}
          </Button>
        </div>
      )
    }

    if (attachments.length === 0) return <p className="text-sm text-subtle">{attachmentStrings.empty}</p>

    return (
      <>
        {imageAttachments.length > 0 && <ImageAttachmentGallery attachments={imageAttachments} onDelete={deleteAttachment} />}
        {fileAttachments.length > 0 && <FileAttachmentList attachments={fileAttachments} onDelete={deleteAttachment} />}
      </>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="section-label">{attachmentStrings.title}</h3>
      <AttachmentDropZone onFilesSelected={uploadFiles} />
      <AttachmentUploadList uploads={uploads} onDismiss={dismissUpload} />
      {isRealtimeDisconnected && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusMessage variant="info">{attachmentStrings.realtimePaused}</StatusMessage>
          <Button variant="link" onClick={reload}>
            {common.reload}
          </Button>
        </div>
      )}
      {renderAttachments()}
    </section>
  )
}
