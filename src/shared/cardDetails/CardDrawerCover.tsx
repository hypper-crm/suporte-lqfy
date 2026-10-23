import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cardDetails, serviceErrors } from '../../i18n/pt-BR'
import type { CardCoverImage } from '../../lib/cardCover'
import type { CardCoverInput } from '../../types/board'
import type { CardAttachment } from '../../types/database'
import { Skeleton } from '../../components/ui/Skeleton'
import { CoverPicker } from './CoverPicker'

// A cover error is reported for this long.
const errorMessageDurationInMilliseconds = 4000

// Always visible on touch screens, which have no hover.
const revealOnHoverClassName =
  'opacity-0 transition-opacity duration-200 ease-fluid group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'

const overlayButtonClassName =
  'flex h-9 items-center rounded-full bg-black/60 px-3 text-xs font-medium text-white outline-none backdrop-blur-sm transition-colors duration-200 ease-fluid hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 md:h-7'

type PendingAction = 'select' | 'upload' | 'remove'

type CoverImageProps = {
  // Null while the link is loading.
  imageUrl: string | null
}

function CoverImage({ imageUrl }: CoverImageProps) {
  // Stays true after the first load, so a renewed link keeps the current image on screen.
  const [hasLoaded, setHasLoaded] = useState(false)

  return (
    <>
      {!hasLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          // Images already in the cache can finish loading before React attaches the load handler.
          ref={(image) => {
            if (image?.complete && image.naturalWidth > 0) setHasLoaded(true)
          }}
          onLoad={() => setHasLoaded(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ease-fluid ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </>
  )
}

type CardDrawerCoverProps = {
  // Undefined when the card has no cover.
  cover: CardCoverImage | undefined
  coverAttachmentId: string | null
  imageAttachments: CardAttachment[]
  isLoadingAttachments: boolean
  onUploadImage: (file: File) => Promise<CardAttachment>
  onUpdateCover: (input: CardCoverInput) => Promise<void>
}

// The optional cover at the top of a card drawer.
export function CardDrawerCover({
  cover,
  coverAttachmentId,
  imageAttachments,
  isLoadingAttachments,
  onUploadImage,
  onUpdateCover,
}: CardDrawerCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const closePicker = useCallback(() => setIsPickerOpen(false), [])

  useEffect(() => {
    if (!errorMessage) return
    const timeoutId = window.setTimeout(() => setErrorMessage(null), errorMessageDurationInMilliseconds)
    return () => window.clearTimeout(timeoutId)
  }, [errorMessage])

  // A press outside the cover area closes the picker.
  useEffect(() => {
    if (!isPickerOpen) return
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsPickerOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isPickerOpen])

  async function run(action: PendingAction, request: () => Promise<void>) {
    setPendingAction(action)
    setErrorMessage(null)
    try {
      await request()
      setIsPickerOpen(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.cardCoverSave)
    } finally {
      setPendingAction(null)
    }
  }

  const selectImage = (attachmentId: string) => void run('select', () => onUpdateCover({ coverAttachmentId: attachmentId }))

  const uploadImage = (file: File) =>
    void run('upload', async () => {
      const attachment = await onUploadImage(file)
      await onUpdateCover({ coverAttachmentId: attachment.id })
    })

  const removeCover = () => void run('remove', () => onUpdateCover({ coverAttachmentId: null }))

  const isBusy = pendingAction !== null

  return (
    <div ref={containerRef} className="group relative shrink-0">
      {cover ? (
        <div className="relative h-[200px] w-full overflow-hidden border-b border-border bg-elevated">
          {/* The key shows the skeleton again when another image becomes the cover. */}
          <CoverImage key={coverAttachmentId} imageUrl={cover.imageUrl} />
          <div
            className={`absolute right-[max(1rem,env(safe-area-inset-right))] bottom-3 flex items-center gap-1.5 md:right-6 ${
              isPickerOpen ? '' : revealOnHoverClassName
            }`}
          >
            <button
              type="button"
              aria-expanded={isPickerOpen}
              disabled={isBusy}
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className={overlayButtonClassName}
            >
              {cardDetails.cover.change}
            </button>
            <button type="button" disabled={isBusy} onClick={removeCover} className={overlayButtonClassName}>
              {pendingAction === 'remove' ? cardDetails.cover.removing : cardDetails.cover.remove}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-10 items-center pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] md:px-6">
          <button
            type="button"
            aria-expanded={isPickerOpen}
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className={`-ml-2 flex h-9 items-center rounded-full px-2 text-xs font-medium text-muted outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 md:h-7 ${
              isPickerOpen ? '' : revealOnHoverClassName
            }`}
          >
            {cardDetails.cover.add}
          </button>
        </div>
      )}
      {!isPickerOpen && errorMessage && (
        <p role="alert" className="px-4 pb-2 text-xs text-danger md:px-6">
          {errorMessage}
        </p>
      )}
      <AnimatePresence>
        {isPickerOpen && (
          <div
            className={`absolute z-sticky ${
              cover ? 'top-[calc(100%-0.5rem)] right-[max(1rem,env(safe-area-inset-right))] md:right-6' : 'top-full left-4 md:left-6'
            }`}
          >
            <CoverPicker
              imageAttachments={imageAttachments}
              isLoadingAttachments={isLoadingAttachments}
              coverAttachmentId={coverAttachmentId}
              isUploading={pendingAction === 'upload'}
              isBusy={isBusy}
              errorMessage={errorMessage}
              onSelect={selectImage}
              onUpload={uploadImage}
              onClose={closePicker}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
