import type { CoverUrls } from '../hooks/useCardCovers'
import type { Card, Client } from '../types/database'

// The image shown at the top of a card. A null URL means the cover link is still loading.
export type CardCoverImage = {
  imageUrl: string | null
}

// The card's own cover comes first, then the client's cover when the card allows it. Undefined means no cover.
export function resolveCardCover(card: Card, client: Client | undefined, coverUrls: CoverUrls): CardCoverImage | undefined {
  if (card.cover_attachment_id) {
    const coverUrl = coverUrls[card.cover_attachment_id]
    if (coverUrl) return { imageUrl: coverUrl }
    if (coverUrl === undefined) return { imageUrl: null }
  }
  // Client covers are in a public bucket, so their public URL is used directly.
  if (card.show_client_cover && client?.cover_image_url) return { imageUrl: client.cover_image_url }
  return undefined
}
