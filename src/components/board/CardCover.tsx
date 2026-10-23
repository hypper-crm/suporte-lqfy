import { useState } from 'react'
import type { CardCoverImage } from '../../lib/cardCover'
import { Skeleton } from '../ui/Skeleton'

type CardCoverProps = {
  cover: CardCoverImage
}

// A 16:9 strip at the top of the card. The skeleton keeps the same size while the image loads, so nothing shifts.
export function CardCover({ cover }: CardCoverProps) {
  // Stays true when a renewed link replaces the URL, so the current image is kept on screen.
  const [hasLoaded, setHasLoaded] = useState(false)

  return (
    <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-border bg-surface">
      {!hasLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
      {cover.imageUrl && (
        <img
          src={cover.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          // Images already in the cache can finish loading before React attaches the load handler.
          ref={(image) => {
            if (image?.complete && image.naturalWidth > 0) setHasLoaded(true)
          }}
          onLoad={() => setHasLoaded(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ease-fluid ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
