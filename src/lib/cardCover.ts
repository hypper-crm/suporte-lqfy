import type { CoverUrls } from '../hooks/useCardCovers'
import type { Card } from '../types/database'

// The image shown at the top of a card. A null URL means the cover link is still loading.
export type CardCoverImage = {
  imageUrl: string | null
}

// Only the card's own cover is shown. Undefined means no cover.
export function resolveCardCover(card: Card, coverUrls: CoverUrls): CardCoverImage | undefined {
  if (!card.cover_attachment_id) return undefined
  const coverUrl = coverUrls[card.cover_attachment_id]
  // A link that could not be created shows no cover.
  if (coverUrl === null) return undefined
  return { imageUrl: coverUrl ?? null }
}
