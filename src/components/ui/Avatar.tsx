import { useState } from 'react'
import { getInitials } from '../../lib/formatting'

type AvatarSize = 'small' | 'medium' | 'large'

const sizeClassNames: Record<AvatarSize, string> = {
  small: 'size-6 text-[10px]',
  medium: 'size-8 text-xs',
  large: 'size-20 text-2xl',
}

type AvatarProps = {
  fullName: string | null | undefined
  imageUrl?: string | null
  size?: AvatarSize
  title?: string
  className?: string
}

// Shows the photo when there is one, otherwise the initials on a neutral background.
export function Avatar({ fullName, imageUrl, size = 'medium', title, className = '' }: AvatarProps) {
  // The URL that failed to load, so a broken photo falls back to the initials.
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const isPhotoShown = Boolean(imageUrl) && imageUrl !== failedImageUrl

  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-border-strong font-semibold text-foreground ${sizeClassNames[size]} ${className}`}
    >
      {isPhotoShown ? (
        <img
          src={imageUrl ?? undefined}
          alt=""
          className="size-full object-cover"
          onError={() => setFailedImageUrl(imageUrl ?? null)}
        />
      ) : (
        getInitials(fullName)
      )}
    </span>
  )
}
