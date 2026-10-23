import { ImagePlus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { clients as clientStrings } from '../../i18n/pt-BR'
import { acceptedImageExtensions, checkImageFile, maximumCoverImageSizeInBytes } from '../../lib/imageFiles'
import type { ClientCoverChange } from '../../types/client'
import { Button } from '../ui/Button'

type ClientCoverFieldProps = {
  // The cover saved on the client, if any.
  savedCoverUrl: string | null
  coverChange: ClientCoverChange
  disabled: boolean
  onChange: (coverChange: ClientCoverChange) => void
}

export function ClientCoverField({ savedCoverUrl, coverChange, disabled, onChange }: ClientCoverFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedFile = coverChange.kind === 'replace' ? coverChange.file : null
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  // The preview URL is created and revoked together, so it never outlives the selected file.
  useEffect(() => {
    if (!selectedFile) {
      setSelectedFileUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setSelectedFileUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const previewUrl = coverChange.kind === 'replace' ? selectedFileUrl : coverChange.kind === 'keep' ? savedCoverUrl : null

  function selectFile(file: File | undefined) {
    if (!file) return
    const check = checkImageFile(file, maximumCoverImageSizeInBytes, {
      type: clientStrings.validation.coverType,
      size: clientStrings.validation.coverSize,
    })
    if (!check.isAccepted) {
      setErrorMessage(check.errorMessage)
      return
    }
    setErrorMessage(null)
    onChange({ kind: 'replace', file, mimeType: check.mimeType })
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingOver(false)
    if (!disabled) selectFile(event.dataTransfer.files[0])
  }

  function removeCover() {
    setErrorMessage(null)
    onChange(savedCoverUrl ? { kind: 'remove' } : { kind: 'keep' })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{clientStrings.form.cover}</span>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col gap-3 rounded-card border border-dashed p-3 transition-colors duration-200 ease-fluid ${
          isDraggingOver ? 'border-accent/60 bg-accent/[0.05]' : 'border-border-strong bg-background/40'
        }`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={clientStrings.form.coverPreviewAlt} className="aspect-[3/1] w-full rounded-lg object-cover" />
        ) : (
          <p className="pt-2 text-center text-sm text-muted">{clientStrings.form.coverDropHint}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="small" disabled={disabled} onClick={() => fileInputRef.current?.click()}>
            <ImagePlus aria-hidden="true" className="size-3.5" />
            {previewUrl ? clientStrings.form.coverReplace : clientStrings.form.coverPick}
          </Button>
          {previewUrl && (
            <Button variant="dangerGhost" size="small" disabled={disabled} onClick={removeCover}>
              <Trash2 aria-hidden="true" className="size-3.5" />
              {clientStrings.form.coverRemove}
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-subtle">{clientStrings.form.coverAcceptedTypes}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedImageExtensions}
          className="hidden"
          onChange={(event) => {
            selectFile(event.target.files?.[0])
            // Clearing the value lets the same file be picked again.
            event.target.value = ''
          }}
        />
      </div>
      {errorMessage && (
        <p role="alert" className="text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
