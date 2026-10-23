import { Upload } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { attachments } from '../../i18n/pt-BR'
import { acceptedFileExtensions } from '../../lib/attachmentFiles'
import { Button } from '../../components/ui/Button'

type AttachmentDropZoneProps = {
  // Why the last picked file was refused, shown next to the upload area.
  rejectionMessage: string | null
  onFilesSelected: (files: File[]) => void
}

export function AttachmentDropZone({ rejectionMessage, onFilesSelected }: AttachmentDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  function selectFiles(fileList: FileList | null) {
    if (fileList && fileList.length > 0) onFilesSelected(Array.from(fileList))
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingOver(false)
    selectFiles(event.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button size="small" onClick={() => fileInputRef.current?.click()}>
          <Upload aria-hidden="true" className="size-3.5" />
          {attachments.upload}
        </Button>
        {rejectionMessage && (
          <p role="alert" className="text-xs text-danger">
            {rejectionMessage}
          </p>
        )}
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`rounded-card border border-dashed px-4 py-4 text-center text-sm text-muted transition-colors duration-200 ease-fluid ${
          isDraggingOver ? 'border-accent/60 bg-accent/[0.05]' : 'border-border-strong bg-background/40'
        }`}
      >
        {attachments.dropHint}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileExtensions}
        className="hidden"
        onChange={(event) => {
          selectFiles(event.target.files)
          // Clearing the value lets the same file be picked again.
          event.target.value = ''
        }}
      />
    </div>
  )
}
