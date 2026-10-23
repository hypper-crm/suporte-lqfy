import { Upload } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { attachments } from '../../i18n/pt-BR'
import { acceptedFileExtensions } from '../../lib/attachmentFiles'
import { Button } from '../../components/ui/Button'

type AttachmentDropZoneProps = {
  onFilesSelected: (files: File[]) => void
}

export function AttachmentDropZone({ onFilesSelected }: AttachmentDropZoneProps) {
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
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDraggingOver(true)
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center gap-3 rounded-card border border-dashed px-4 py-5 text-center transition-colors duration-200 ease-fluid ${
        isDraggingOver ? 'border-accent/60 bg-accent/[0.05]' : 'border-border-strong bg-background/40'
      }`}
    >
      <p className="text-sm text-muted">{attachments.dropHint}</p>
      <Button size="small" onClick={() => fileInputRef.current?.click()}>
        <Upload aria-hidden="true" className="size-3.5" />
        {attachments.upload}
      </Button>
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
      <p className="text-xs text-subtle">{attachments.acceptedTypes}</p>
    </div>
  )
}
