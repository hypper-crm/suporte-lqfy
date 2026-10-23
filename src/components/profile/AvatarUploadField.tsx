import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'
import { profileScreen, serviceErrors } from '../../i18n/pt-BR'
import { acceptedImageExtensions, checkImageFile, maximumAvatarSizeInBytes } from '../../lib/imageFiles'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { StatusMessage } from '../ui/StatusMessage'

type AvatarUploadFieldProps = {
  displayName: string
  avatarUrl: string | null
  onUpload: (file: File, mimeType: string, extension: string) => Promise<void>
}

export function AvatarUploadField({ displayName, avatarUrl, onUpload }: AvatarUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function uploadFile(file: File | undefined) {
    if (!file) return
    setIsSaved(false)
    const check = checkImageFile(file, maximumAvatarSizeInBytes, {
      type: profileScreen.validation.photoType,
      size: profileScreen.validation.photoSize,
    })
    if (!check.isAccepted) {
      setErrorMessage(check.errorMessage)
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    try {
      await onUpload(file, check.mimeType, check.extension)
      setIsSaved(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.avatarUpload)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-muted">{profileScreen.photo}</span>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="large" fullName={displayName} imageUrl={avatarUrl} title={profileScreen.avatarAlt(displayName)} />
        <div className="flex flex-col items-start gap-2">
          <Button size="small" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
            <Camera aria-hidden="true" className="size-3.5" />
            {isUploading ? profileScreen.uploadingPhoto : profileScreen.changePhoto}
          </Button>
          <p className="text-xs text-subtle">{profileScreen.acceptedTypes}</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedImageExtensions}
          className="hidden"
          onChange={(event) => {
            void uploadFile(event.target.files?.[0])
            // Clearing the value lets the same file be picked again.
            event.target.value = ''
          }}
        />
      </div>
      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
      {isSaved && <StatusMessage variant="success">{profileScreen.photoSaved}</StatusMessage>}
    </div>
  )
}
